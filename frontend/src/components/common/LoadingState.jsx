import { Stack } from '../layout/Stack';

export const LoadingBar = ({children}) => {
    return (
        <div className="loader bg-transparent relative w-130 h-1 rounded-full">
            <div className="absolute bg-blue-500 top-0 left-0 w-0 h-full rounded-full animate-moving"></div>
        </div>
    );
};

export const LoadingState = ({ 
    message = "Loading...", 
    className = "h-[calc(100vh-150px)] items-center justify-center",
    showLoadingBar = true 
}) => {
    return (
        <Stack className={className}>
            <div>
                {showLoadingBar && <LoadingBar />}
                <span>{message}</span>
            </div>
        </Stack>
    );
};

// Specific loading states for common use cases
export const ProjectLoadingState = ({ message = "Loading project details." }) => (
    <LoadingState message={message} />
);
export const ProjectsLoadingState = ({ message = "Loading projects." }) => (
    <LoadingState message={message} />
);

export const ChecklistLoadingState = ({ message = "Fetching checklists." }) => (
    <LoadingState message={message} />
);

export const AccountLoadingState = ({ message = "Loading accounts." }) => (
    <LoadingState message={message} />
);
