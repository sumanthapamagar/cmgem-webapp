import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { Button } from '../ui/button';

export function ErrorComponent({ error }) {
    const { setManualOffline, browserOnline } = useNetworkStatus();
    
    // Check if the error is network-related
    const isNetworkError = React.useMemo(() => {
        if (!error) return false;
        
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = error.code || '';
        
        // Common network error indicators
        const networkErrorPatterns = [
            'network error',
            'connection failed',
            'timeout',
            'fetch failed',
            'network request failed',
            'connection refused',
            'no internet',
            'offline',
            'unreachable',
            'dns',
            'certificate',
            'ssl',
            'tls'
        ];
        
        // Check error message
        const hasNetworkPattern = networkErrorPatterns.some(pattern => 
            errorMessage.includes(pattern)
        );
        
        // Check for specific error codes
        const networkErrorCodes = [
            'NETWORK_ERROR',
            'CONNECTION_ERROR',
            'TIMEOUT_ERROR',
            'FETCH_ERROR',
            'ERR_NETWORK',
            'ERR_INTERNET_DISCONNECTED',
            'ERR_CONNECTION_REFUSED',
            'ERR_CONNECTION_TIMED_OUT',
            'ERR_NAME_NOT_RESOLVED'
        ];
        
        const hasNetworkCode = networkErrorCodes.some(code => 
            errorCode.includes(code) || errorMessage.includes(code)
        );
        
        // Check if browser reports offline
        const browserOffline = !browserOnline;
        
        return hasNetworkPattern || hasNetworkCode || browserOffline;
    }, [error, browserOnline]);
    
    const handleUseOfflineMode = () => {
        setManualOffline(true);
        // Reload the page to switch to offline mode
        window.location.reload();
    };
    
    const handleRetry = () => {
        // Reload the page to retry
        window.location.reload();
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="mb-4">
                    {isNetworkError ? (
                        <i className="fas fa-wifi text-red-500 text-6xl mx-auto mb-4 block"></i>
                    ) : (
                        <i className="fas fa-exclamation-triangle text-yellow-500 text-6xl mx-auto mb-4 block"></i>
                    )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isNetworkError ? 'Connection Error' : 'Authentication Error'}
                </h2>
                
                <p className="text-gray-600 mb-6">
                    {isNetworkError ? (
                        <>
                            It looks like you're having trouble connecting to the internet. 
                            This might be due to a network issue or the server being unavailable.
                        </>
                    ) : (
                        <>
                            There was an error during authentication. This could be due to 
                            network issues or authentication service problems.
                        </>
                    )}
                </p>
                
                {error && (
                    <div className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-700 text-left">
                        <strong>Error Details:</strong>
                        <br />
                        {error.message || 'Unknown error occurred'}
                    </div>
                )}
                
                <div className="space-y-3">
                    {isNetworkError && (
                        <Button
                            onClick={handleUseOfflineMode}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <i className="fas fa-wifi mr-2"></i>
                            Use App Offline
                        </Button>
                    )}
                    
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="w-full"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>
                        Try Again
                    </Button>
                </div>
                
                {isNetworkError && (
                    <p className="text-xs text-gray-500 mt-4">
                        Offline mode will allow you to access previously downloaded projects 
                        and continue working without an internet connection.
                    </p>
                )}
            </div>
        </div>
    );
}
