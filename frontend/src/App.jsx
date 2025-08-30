// Import necessary dependencies
import { Outlet, Route, Routes } from 'react-router-dom';
import { useMemo } from 'react';
import Root from './features/projects/Root';
import ProjectRoot from './features/projects/ProjectRoot';
import OfflineProjects from './features/projects/OfflineProjects';
import { Header, ErrorComponent } from './components';
import Accounts from './features/accounts/Accounts';
import NewAccount from './features/accounts/NewAccount';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccountDetail from './features/accounts/AccountDetails';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from './lib/authConfig';
import ChecklistHome from './features/checklists/Checklists';
import { NetworkStatusProvider, useNetworkStatus } from './contexts/NetworkStatusContext';
import { useInitializeChecklists } from './hooks/useChecklists';

// Create a new instance of QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 20000,
            retry: 0,
            refetchOnWindowFocus: false, // Disable refetch on window focus
            refetchOnReconnect: false,   // Disable refet0ch on reconnect
            refetchOnMount: false        // Disable refetch on component mount
        }
    },
    // Configure global cache callbacks to show toast notifications
});

// Define Loading component
const Loading = () => 'Loading profile data';

// Define the AppContent component that uses the network status
function AppContent({ msalInstance }) {
    const networkStatus = useNetworkStatus();
    const { isOffline } = networkStatus;
    const authRequest = useMemo(() => ({
        ...loginRequest
    }), []);

    // Initialize checklist sync service when online
    useInitializeChecklists();

    return (
        <div key={`app-${isOffline ? 'offline' : 'online'}`}>
            {isOffline ? (
                // Offline mode - show offline projects and limited functionality
                <>
                    <Header />
                    <Routes>
                        <Route path="/" element={<OfflineProjects />} />
                        <Route path="projects" element={<Outlet />}>
                            <Route index element={<OfflineProjects />} />
                            <Route path=":projectId/*" element={<ProjectRoot />} />
                        </Route>
                        <Route path="offline-projects" element={<OfflineProjects />} />
                    </Routes>
                </>
            ) : (
                // Online mode - show full functionality with authentication
                <MsalProvider instance={msalInstance}>
                    <MsalAuthenticationTemplate
                        interactionType={InteractionType.Redirect}
                        authenticationRequest={authRequest}
                        errorComponent={ErrorComponent}
                        loadingComponent={Loading}
                    >
                        <Header />
                        <div className="text-base">
                            <Routes>
                                <Route path="/" element={<Root />} />
                                <Route path="accounts" element={<Outlet />}>
                                    <Route index element={<Accounts />} />
                                    <Route
                                        path="new"
                                        element={<NewAccount />}
                                    />
                                    <Route
                                        path=":accountId"
                                        element={<AccountDetail />}
                                    />
                                </Route>
                                {/* <Route path="account" element={<Contact />} /> */}
                                <Route path="projects" element={<Outlet />}>
                                    <Route index element={<Root />} />
                                    <Route
                                        path=":projectId/*"
                                        element={<ProjectRoot />}
                                    />
                                </Route>
                                <Route path="offline-projects" element={<OfflineProjects />} />
                                <Route
                                    path="checklists/*"
                                    element={<ChecklistHome />}
                                />
                            </Routes>
                        </div>
                    </MsalAuthenticationTemplate>
                </MsalProvider>
            )}
        </div>
    );
}

// Define the main App component
function App({ msalInstance }) {
    return (
        <QueryClientProvider client={queryClient}>
            <NetworkStatusProvider>
                <AppContent msalInstance={msalInstance} />
            </NetworkStatusProvider>
        </QueryClientProvider>
    );
}

export default App;
