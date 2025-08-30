import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { 
    getOfflineProjects, 
    getOfflineStorageInfo, 
    clearOfflineProjects,
    syncProject 
} from '../../lib';
import { 
    Stack, 
    Button, 
    Table, 
    TableHead, 
    TableBody, 
TableRow, 
    TableHeader, 
    TableCell,
    Input,
    Modal
} from '../../components';

export default function OfflineProjects() {
    const [offlineProjects, setOfflineProjects] = useState([]);
    const [storageInfo, setStorageInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [showClearModal, setShowClearModal] = useState(false);
    const [syncingProjects, setSyncingProjects] = useState(new Set());
    const navigate = useNavigate();

    // Load offline projects and storage info
    useEffect(() => {
        loadOfflineData();
    }, []);

    // Filter projects based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredProjects(offlineProjects);
        } else {
            const filtered = offlineProjects.filter(project =>
                project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.account?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.state?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProjects(filtered);
        }
    }, [searchTerm, offlineProjects]);

    const loadOfflineData = async () => {
        try {
            setIsLoading(true);
            const [projects, info] = await Promise.all([
                getOfflineProjects(),
                getOfflineStorageInfo()
            ]);
            setOfflineProjects(projects || []);
            setStorageInfo(info);
        } catch (error) {
            console.error('Error loading offline data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    const handleSyncProject = async (projectId) => {
        try {
            setSyncingProjects(prev => new Set(prev).add(projectId));
            await syncProject(projectId);
            // Reload offline data to get updated sync timestamps
            await loadOfflineData();
        } catch (error) {
            console.error('Error syncing project:', error);
        } finally {
            setSyncingProjects(prev => {
                const newSet = new Set(prev);
                newSet.delete(projectId);
                return newSet;
            });
        }
    };

    const handleClearAllProjects = async () => {
        try {
            await clearOfflineProjects();
            setOfflineProjects([]);
            setFilteredProjects([]);
            setShowClearModal(false);
        } catch (error) {
            console.error('Error clearing offline projects:', error);
        }
    };

    const handleRefresh = () => {
        loadOfflineData();
    };

    if (isLoading) {
        return (
            <Stack className="h-[calc(100vh-150px)] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <span className="text-gray-600">Loading offline projects...</span>
                </div>
            </Stack>
        );
    }

    return (
        <Stack className="p-2 sm:p-4 lg:p-8 gap-6">
            {/* Header */}
            <Stack horizontal className="gap-6 justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Offline Projects</h1>
                    <p className="text-gray-600 mt-2">
                        Projects available for offline access
                    </p>
                </div>
                <Stack horizontal className="gap-3">
                    <Button 
                        onClick={handleRefresh}
                        variant="outline"
                        className="px-4"
                    >
                        <i className="fa-solid fa-refresh mr-2"></i>
                        Refresh
                    </Button>
                    <Button 
                        onClick={() => setShowClearModal(true)}
                        variant="outline"
                        color="red"
                        className="px-4"
                        disabled={offlineProjects.length === 0}
                    >
                        <i className="fa-solid fa-trash mr-2"></i>
                        Clear All
                    </Button>
                </Stack>
            </Stack>

            {/* Storage Info */}
            {storageInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Stack horizontal className="gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-database text-blue-600"></i>
                            <span className="font-medium text-blue-900">
                                Storage Type: {storageInfo.storageType}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-folder text-blue-600"></i>
                            <span className="font-medium text-blue-900">
                                Projects: {storageInfo.totalProjects}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-hdd text-blue-600"></i>
                            <span className="font-medium text-blue-900">
                                Available Space: {storageInfo.availableSpace} projects
                            </span>
                        </div>
                    </Stack>
                </div>
            )}

            {/* Search */}
            <div className="w-96">
                <Input
                    placeholder="Search offline projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-96"
                />
            </div>

            {/* Projects Table */}
            <div className="relative">
                <Table className="border border-gray-300 rounded-xs" dense striped grid>
                    <TableHead>
                        <TableRow>
                            <TableHeader className="font-semibold text-lg">
                                Project/Building
                            </TableHeader>
                            <TableHeader className="font-semibold text-lg w-32">
                                Building Type
                            </TableHeader>
                            <TableHeader className="font-semibold text-lg w-44">
                                Account
                            </TableHeader>
                            <TableHeader className="font-semibold text-lg w-44">
                                Last Synced
                            </TableHeader>
                            <TableHeader className="font-semibold text-lg w-44">
                                Offline Since
                            </TableHeader>
                            <TableHeader className="font-semibold text-lg w-32">
                                Actions
                            </TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <TableRow 
                                    key={project._id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleProjectClick(project._id)}
                                >
                                    <TableCell>
                                        <div className="font-semibold text-gray-900">
                                            {project.name}
                                        </div>
                                        {project.city && project.state && (
                                            <div className="text-sm text-gray-600">
                                                {project.city}, {project.state}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {project.category ? (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                                {project.category}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {project.account?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {project.last_synced ? (
                                            <time
                                                className="text-slate-600"
                                                dateTime={project.last_synced}
                                            >
                                                {dayjs(project.last_synced).format('DD MMM YYYY HH:mm')}
                                            </time>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Never</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {project.offline_timestamp ? (
                                            <time
                                                className="text-slate-600"
                                                dateTime={project.offline_timestamp}
                                            >
                                                {dayjs(project.offline_timestamp).format('DD MMM YYYY HH:mm')}
                                            </time>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSyncProject(project._id);
                                            }}
                                            size="sm"
                                            variant="outline"
                                            disabled={syncingProjects.has(project._id)}
                                            className="px-3"
                                        >
                                            {syncingProjects.has(project._id) ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                                                    Syncing
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-sync mr-2"></i>
                                                    Sync
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    {searchTerm ? (
                                        'No offline projects found matching your search.'
                                    ) : (
                                        <div className="text-center">
                                            <i className="fa-solid fa-download text-6xl text-gray-300 mb-4"></i>
                                            <div className="text-xl font-medium text-gray-400 mb-2">
                                                No Offline Projects
                                            </div>
                                            <div className="text-gray-500">
                                                Projects will be available offline once you visit them while online.
                                            </div>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            {filteredProjects.length > 0 && (
                <div className="text-sm text-gray-600 text-center">
                    Showing {filteredProjects.length} of {offlineProjects.length} offline projects
                </div>
            )}

            {/* Clear All Confirmation Modal */}
            {showClearModal && (
                <Modal
                    open={showClearModal}
                    hideDialog={() => setShowClearModal(false)}
                    title="Clear All Offline Projects"
                    size="md"
                >
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <i className="fa-solid fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Clear All Offline Projects?
                            </h3>
                            <p className="text-gray-600">
                                This will remove all {offlineProjects.length} projects from offline storage. 
                                You'll need to visit them again while online to make them available offline.
                            </p>
                        </div>
                        
                        <Stack horizontal className="gap-3 justify-end">
                            <Button
                                onClick={() => setShowClearModal(false)}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleClearAllProjects}
                                color="red"
                            >
                                <i className="fa-solid fa-trash mr-2"></i>
                                Clear All Projects
                            </Button>
                        </Stack>
                    </div>
                </Modal>
            )}
        </Stack>
    );
}
