import { useNetworkStatus } from '../../hooks';
import { Switch, SwitchField } from '../ui/switch';

export const OfflineModeToggle = () => {
    const { isManualOffline, toggleManualOffline, isOnline, browserOnline } = useNetworkStatus();

    const getStatusText = () => {
        if (isManualOffline) {
            return 'Manual Offline Mode';
        }
        if (!browserOnline) {
            return 'Network Disconnected';
        }
        return 'Online';
    };

    const getStatusColor = () => {
        if (isManualOffline) {
            return 'text-orange-600';
        }
        if (!isOnline) {
            return 'text-red-600';
        }
        return 'text-green-600';
    };

    return (
        <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
                Network Status
            </div>
            <div className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
            </div>

            <SwitchField>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Offline</span>
                    <Switch
                        checked={isOnline}
                        onChange={toggleManualOffline}
                        color={isOnline ? 'green' : 'red'}
                    />
                    <span className="text-sm text-gray-700">Online</span>
                </div>
            </SwitchField>
        </div>
    );
};
