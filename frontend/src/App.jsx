// Import necessary dependencies
import { Outlet, Route, Routes } from 'react-router-dom';
import Root from './features/projects/Root';
import ProjectRoot from './features/projects/ProjectRoot';
import OfflineProjects from './features/projects/OfflineProjects';
import {Header, Offline, Online} from './components';
import Accounts from './features/accounts/Accounts';
import NewAccount from './features/accounts/NewAccount';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccountDetail from './features/accounts/AccountDetails';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from './lib/authConfig';
import ChecklistHome from './features/checklists/Checklists';


// Create a new instance of QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 2000,
            retry: 0
        }
    },
    // Configure global cache callbacks to show toast notifications
});

// Define ErrorComponent and Loading components
const ErrorComponent = () => 'An error occured';
const Loading = () => 'Loading profile data';

// Define the App component
function App({ msalInstance }) {
    const authRequest = {
        ...loginRequest
    };
    return (
        <QueryClientProvider
            client={queryClient}
        >
            <Offline>
                <Header />
                <Routes>
                    <Route path="/" element={<OfflineProjects />} />
                    <Route path="projects" element={<Outlet />}>
                        <Route index element={<OfflineProjects />} />
                        <Route path=":projectId/*" element={<ProjectRoot />} />
                    </Route>
                    <Route path="offline-projects" element={<OfflineProjects />} />
                </Routes>
            </Offline>
            <Online>
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
            </Online>
        </QueryClientProvider>
    );
}

export default App;
