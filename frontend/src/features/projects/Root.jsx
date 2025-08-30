import { useState,  useCallback } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import { getProjects, getProjectCategories } from '../../lib/api';
import { Input,  ProjectsLoadingState, Stack, Modal, Button, Online, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components';
import { Pagination, PaginationPrevious, PaginationNext, PaginationList, PaginationPage, PaginationGap } from '../../components/ui/pagination';
import NewProjectForm from './NewProject';
import { projectKeys } from './projects';

export default function Root() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginationParams, setPaginationParams] = useState({
        page: 1,
        limit: 15,
        sortBy: 'created_at',
        sortOrder: 'desc',
        search: '',
        category: '',
        accountId: ''
    });
    
    const hideDialog = () => setIsDialogOpen(false);
    const onOpen = () => setIsDialogOpen(true);

    // Fetch projects with pagination
    const projectListQuery = useQuery({
        queryKey: projectKeys.listWithParams(paginationParams),
        queryFn: () => getProjects(paginationParams),
        keepPreviousData: true, // Keep previous data while loading new page
    });

    // Update pagination when params change
    const updatePagination = useCallback((updates) => {
        setPaginationParams(prev => ({
            ...prev,
            ...updates,
            page: 1 // Reset to first page when filters change
        }));
    }, []);

    // Handle page change
    const handlePageChange = (page) => {
        setPaginationParams(prev => ({ ...prev, page }));
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search button click
    const handleSearch = () => {
        updatePagination({ search: searchTerm });
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        updatePagination({ search: '' });
    };

    // Handle category filter
    const handleCategoryChange = (category) => {
        updatePagination({ category });
    };

    // Handle sorting
    const handleSort = (field) => {
        setPaginationParams(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Get data from backend response
    const projects = projectListQuery.data?.data || [];
    const pagination = projectListQuery.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    };

    if (projectListQuery.isLoading && !projectListQuery.data) {
        return (
            <ProjectsLoadingState />
        );
    }

    return (
        <Stack className="p-2 sm:p-4 lg:p-8 gap-6">
            <Stack horizontal className="gap-6 justify-between">
                <h1 className="text-5xl font-light">Audit Reports</h1>
                <Online>
                    <Button onClick={onOpen}>New Project</Button>
                    {isDialogOpen && (
                        <Modal
                            open={isDialogOpen}
                            hideDialog={hideDialog}
                            title="Add New Project"
                            size="xl"
                        >
                            <NewProjectForm hideDialog={hideDialog} />
                        </Modal>
                    )}
                </Online>
            </Stack>

            {/* Search and Filter Controls */}
            <Stack horizontal className="gap-4 items-center">
                <div className="w-96 relative">
                    <Input
                        placeholder="Search projects by name, category, city, or state..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        className={`w-96 ${
                            searchTerm !== paginationParams.search && searchTerm.trim() 
                                ? 'ring-2 ring-blue-500' 
                                : ''
                        }`}
                    />
                    {searchTerm !== paginationParams.search && searchTerm.trim() && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-sm">
                                Press Enter or click Search
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleSearch}
                    color='amber'
                    disabled={!searchTerm.trim()}
                    className="px-6"
                >
                    Search
                </Button>
                {searchTerm && (
                    <Button
                        variant="outline"
                        onClick={handleClearSearch}
                        className="px-4"
                    >
                        Clear
                    </Button>
                )}
            </Stack>

            {/* Search Results Summary */}
            {(paginationParams.search || paginationParams.category) && (
                <div className="text-sm text-gray-600">
                    {paginationParams.search && (
                        <span className="mr-4">
                            Search: "{paginationParams.search}"
                        </span>
                    )}
                    {paginationParams.category && (
                        <span>
                            Category: {paginationParams.category}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchTerm('');
                            updatePagination({ search: '', category: '' });
                        }}
                        className="ml-4 text-blue-600 hover:text-blue-800"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}

            {/* Projects Table */}
            <div className="relative">
                <Table className="border-1 bg-white border-neutral-300 rounded-lg" dense striped grid>
                    <TableHead>
                        <TableRow className="bg-white">
                            <TableHeader 
                                className="font-semibold h-12 text-lg cursor-pointer"
                                onClick={() => handleSort('name')}
                            >
                                Project/Building
                                {paginationParams.sortBy === 'name' && (
                                    <span className="ml-2">
                                        {paginationParams.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </TableHeader>
                            <TableHeader 
                                className="font-semibold h-12 text-lg w-32 cursor-pointer  "
                            >
                                Building Type
                            </TableHeader>
                            <TableHeader className="font-semibold h-12 text-lg w-44 ">Account</TableHeader>
                            <TableHeader 
                                className="font-semibold h-12 text-lg w-44 cursor-pointer  "
                                onClick={() => handleSort('created_at')}
                            >
                                Created Date
                                {paginationParams.sortBy === 'created_at' && (
                                    <span className="ml-2">
                                        {paginationParams.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <TableRow 
                                    key={project._id}
                                    href={`/projects/${project._id}`}
                                >
                                    <TableCell>
                                        <div className="font-semibold">
                                            {project.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {project.category ? (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                                {project.category}
                                            </span>
                                        ) : (
                                            <span >-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {project.account?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <time
                                            dateTime={project.created_at}
                                        >
                                            {dayjs(project.created_at).format('DD MMM YYYY')}
                                        </time>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    {paginationParams.search || paginationParams.category 
                                        ? 'No projects found matching your criteria.' 
                                        : 'No projects found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                
                {/* Loading overlay for table */}
                {projectListQuery.isFetching && projectListQuery.data && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <span className="text-sm text-gray-600">Loading...</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Pagination Controls */}
            {pagination.total > 0 && (
                <Pagination className="justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} projects
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <PaginationPrevious 
                            onClick={pagination.hasPrev ? () => handlePageChange(pagination.page - 1) : undefined}
                            disabled={!pagination.hasPrev}
                        >
                            Previous
                        </PaginationPrevious>
                        
                        <PaginationList>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }
                                
                                return (
                                    <PaginationPage
                                        key={pageNum}
                                        onClick={() => {
                                            handlePageChange(pageNum);
                                        }}
                                        current={pagination.page === pageNum}
                                    >
                                        {pageNum}
                                    </PaginationPage>
                                );
                            })}
                        </PaginationList>
                        
                        <PaginationNext 
                            onClick={pagination.hasNext ? () => handlePageChange(pagination.page + 1) : undefined}
                            disabled={!pagination.hasNext}
                        >
                            Next
                        </PaginationNext>
                    </div>
                </Pagination>
            )}
        </Stack>
    );
}
