import axios from 'axios'
import { getIdToken } from './authConfig'

// ============================================================================
// OFFLINE MODE CHECK
// ============================================================================

/**
 * Check if the app is in manual offline mode
 * @returns {boolean} True if in manual offline mode
 */
const isManualOfflineMode = () => {
	// Check localStorage for manual offline mode flag
	return localStorage.getItem('manual_offline_mode') === 'true';
};

/**
 * Throw error if in manual offline mode
 * @throws {Error} If in manual offline mode
 */
const checkOfflineMode = () => {
	if (isManualOfflineMode()) {
		throw new Error('App is in manual offline mode. Network requests are disabled.');
	}
};

// ============================================================================
// CONFIGURATION & SETUP
// ============================================================================

const SERVER_URL = import.meta.env.VITE_SERVER_URL

const server = axios.create({
	baseURL: SERVER_URL,
	timeout: 30000, // 30 second timeout
})

// Request interceptor for authentication and offline mode check
server.interceptors.request.use(async function (config) {
	// Check if in manual offline mode first
	checkOfflineMode();
	
	try {
		const id_token = await getIdToken()
		config.headers = {
			Authorization: `Bearer ${id_token}`,
		}
		config.credentials = 'include'
		return config
	} catch (err) {
		console.error('Failed to get auth token:', err)
		return Promise.reject(new Error('Authentication failed'))
	}
})

// Response interceptor for error handling
server.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => {
		// Enhanced error handling with proper categorization
		if (error.response) {
			// Server responded with error status
			const { status, data } = error.response
			switch (status) {
				case 401:
					return Promise.reject(new Error('Unauthorized - Please log in again'))
				case 403:
					return Promise.reject(new Error('Forbidden - Insufficient permissions'))
				case 404:
					return Promise.reject(new Error('Resource not found'))
				case 422:
					return Promise.reject(new Error(`Validation error: ${data?.message || 'Invalid data'}`))
				case 500:
					return Promise.reject(new Error('Server error - Please try again later'))
				default:
					return Promise.reject(new Error(`Request failed with status ${status}`))
			}
		} else if (error.request) {
			// Request was made but no response received
			return Promise.reject(new Error('Network error - Please check your connection'))
		} else {
			// Something else happened
			return Promise.reject(new Error(error.message || 'Unknown error occurred'))
		}
	}
)

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate required string parameters
 * @param {string} value - Value to validate
 * @param {string} paramName - Name of the parameter for error messages
 * @throws {Error} If validation fails
 */
const validateRequiredString = (value, paramName) => {
	if (!value || typeof value !== 'string') {
		throw new Error(`${paramName} is required and must be a string`)
	}
}

/**
 * Validate required object parameters
 * @param {Object} value - Value to validate
 * @param {string} paramName - Name of the parameter for error messages
 * @throws {Error} If validation fails
 */
const validateRequiredObject = (value, paramName) => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`${paramName} is required and must be an object`)
	}
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get projects with optional filtering and pagination
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.sortBy] - Sort field
 * @param {string} [params.sortOrder] - Sort direction (asc/desc)
 * @param {string} [params.search] - Search term
 * @param {string} [params.category] - Project category
 * @param {string} [params.accountId] - Account ID filter
 * @returns {Promise<Object>} Projects data
 */
const getProjects = async (params = {}) => {
	const queryParams = new URLSearchParams();

	// Add pagination parameters
	if (params.page) queryParams.append('page', params.page);
	if (params.limit) queryParams.append('limit', params.limit);
	if (params.sortBy) queryParams.append('sortBy', params.sortBy);
	if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
	if (params.search) queryParams.append('search', params.search);
	if (params.category) queryParams.append('category', params.category);
	if (params.accountId) queryParams.append('accountId', params.accountId);

	const queryString = queryParams.toString();
	const url = queryString ? `projects?${queryString}` : 'projects';

	const response = await server.get(url);
	return response.data;
}

/**
 * Get a single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project data
 */
const getProject = async (projectId) => {
	validateRequiredString(projectId, 'Project ID');
	
	const response = await server.get(`projects/${projectId}`);
	return response.data;
}

/**
 * Create a new project
 * @param {Object} data - Project data
 * @returns {Promise<Object>} Created project data
 */
const createProject = async (data) => {
	validateRequiredObject(data, 'Project data');
	
	const response = await server.post('projects', data);
	return response.data;
}

/**
 * Update an existing project
 * @param {string} projectId - Project ID
 * @param {Object} data - Updated project data
 * @returns {Promise<Object>} Updated project data
 */
const updateProject = async (projectId, data) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredObject(data, 'Project data');
	
	const response = await server.patch(`projects/${projectId}`, data);
	return response.data;
}

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteProject = async (projectId) => {
	validateRequiredString(projectId, 'Project ID');
	
	const response = await server.delete(`projects/${projectId}`);
	return response.data;
}

/**
 * Get project categories
 * @returns {Promise<Array>} Project categories
 */
const getProjectCategories = async () => {
	const response = await server.get('projects/categories');
	return response.data;
}

/**
 * Get accounts with optional filtering and pagination
 * @param {Object} params - Query parameters
 * @param {string} [params.q] - Search query
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @returns {Promise<Object>} Accounts data
 */
const getAccounts = async (params = {}) => {
	const queryParams = new URLSearchParams();

	if (params.q) queryParams.append('q', params.q);
	if (params.page) queryParams.append('page', params.page);
	if (params.limit) queryParams.append('limit', params.limit);

	const queryString = queryParams.toString();
	const url = queryString ? `accounts?${queryString}` : 'accounts';

	const response = await server.get(url);
	return response.data;
}

/**
 * Get a single account by ID
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} Account data
 */
const getAccount = async (accountId) => {
	validateRequiredString(accountId, 'Account ID');
	
	const response = await server.get(`accounts/${accountId}`);
	return response.data;
}

/**
 * Create a new account
 * @param {Object} data - Account data
 * @returns {Promise<Object>} Created account data
 */
const createAccount = async (data) => {
	validateRequiredObject(data, 'Account data');
	
	const response = await server.post('accounts', data);
	return response.data;
}

/**
 * Update an existing account
 * @param {string} accountId - Account ID
 * @param {Object} data - Updated account data
 * @returns {Promise<Object>} Updated account data
 */
const updateAccount = async ({accountId, data}) => {

	validateRequiredString(accountId, 'Account ID');
	validateRequiredObject(data, 'Account data');
	
	const response = await server.put(`accounts/${accountId}`, data);
	return response.data;
}

/**
 * Delete an account
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteAccount = async (accountId) => {
	validateRequiredString(accountId, 'Account ID');
	
	const response = await server.delete(`accounts/${accountId}`);
	return response.data;
}

/**
 * Get checklists with optional parameters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Checklists data
 */
const getChecklists = async (params) => {
	const response = await server.get("checklists", { params });
	return response.data;
}

/**
 * Get checklists with version information for offline sync
 * @returns {Promise<Object>} Checklists data with version
 */
const getChecklistsWithVersion = async () => {
	const response = await server.get("checklists/with-version");
	return response.data;
}

/**
 * Get a single checklist by ID
 * @param {string} checklistId - Checklist ID
 * @returns {Promise<Object>} Checklist data
 */
const getChecklist = async (checklistId) => {
	validateRequiredString(checklistId, 'Checklist ID');
	
	const response = await server.get(`checklists/${checklistId}`);
	return response.data;
}

/**
 * Create a new checklist
 * @param {Object} data - Checklist data
 * @returns {Promise<Object>} Created checklist data
 */
const createChecklist = async (data) => {
	validateRequiredObject(data, 'Checklist data');
	
	const response = await server.post('checklists', data);
	return response.data;
}

/**
 * Update a single checklist
 * @param {string} checklistId - Checklist ID
 * @param {Object} data - Updated checklist data
 * @returns {Promise<Object>} Updated checklist data
 */
const updateChecklist = async (checklistId, data) => {
	validateRequiredString(checklistId, 'Checklist ID');
	validateRequiredObject(data, 'Checklist data');
	
	const response = await server.patch(`checklists/${checklistId}`, data);
	return response.data;
}

/**
 * Update multiple checklists
 * @param {Array} data - Data for multiple checklists
 * @returns {Promise<Object>} Update confirmation
 */
const updateChecklists = async (data) => {
	if (!data || !Array.isArray(data)) {
		throw new Error('Checklists data is required and must be an array');
	}
	
	const response = await server.patch('checklists', data);
	return response.data;
}

/**
 * Delete a checklist
 * @param {string} checklistId - Checklist ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteChecklist = async (checklistId) => {
	validateRequiredString(checklistId, 'Checklist ID');
	
	const response = await server.delete(`checklists/${checklistId}`);
	return response.data;
}

/**
 * Get equipment for a specific project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Equipment data
 */
const getEquipment = async (projectId) => {
	validateRequiredString(projectId, 'Project ID');
	
	const response = await server.get(`projects/${projectId}/equipment`);
	return response.data;
}

/**
 * Create new equipment for a project
 * @param {string} projectId - Project ID
 * @param {Object} data - Equipment data
 * @returns {Promise<Object>} Created equipment data
 */
const createEquipment = async (projectId, data) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredObject(data, 'Equipment data');
	
	const response = await server.post(`projects/${projectId}/equipment`, data);
	return response.data;
}

const saveProjectEquipments = async ( data) => {
	const response = await server.post(`equipments/bulk-save`, data);
	return response.data;
}

/**
 * Update existing equipment
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {Object} data - Updated equipment data
 * @returns {Promise<Object>} Updated equipment data
 */
const updateEquipment = async (projectId, equipmentId, data) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredString(equipmentId, 'Equipment ID');
	validateRequiredObject(data, 'Equipment data');
	
	const response = await server.patch(`projects/${projectId}/equipment/${equipmentId}`, data);
	return response.data;
}

/**
 * Delete equipment from a project
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteEquipment = async ( equipmentId) => {
	const response = await server.delete(`equipments/${equipmentId}`);
	return response.data;
}

/**
 * Get floors for specific equipment in a project
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @returns {Promise<Array>} Floors data
 */
const getFloors = async (projectId, equipmentId) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredString(equipmentId, 'Equipment ID');
	
	const response = await server.get(`projects/${projectId}/equipment/${equipmentId}/floors`);
	return response.data;
}

/**
 * Create a new floor for equipment
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {Object} data - Floor data
 * @returns {Promise<Object>} Created floor data
 */
const createFloor = async (projectId, equipmentId, data) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredString(equipmentId, 'Equipment ID');
	validateRequiredObject(data, 'Floor data');
	
	const response = await server.post(`projects/${projectId}/equipment/${equipmentId}/floors`, data);
	return response.data;
}

/**
 * Update an existing floor
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {string} floorId - Floor ID
 * @param {Object} data - Updated floor data
 * @returns {Promise<Object>} Updated floor data
 */
const updateFloor = async (projectId, equipmentId, floorId, data) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredString(equipmentId, 'Equipment ID');
	validateRequiredString(floorId, 'Floor ID');
	validateRequiredObject(data, 'Floor data');
	
	const response = await server.patch(`projects/${projectId}/equipment/${equipmentId}/floors/${floorId}`, data);
	return response.data;
}

/**
 * Delete a floor
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {string} floorId - Floor ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteFloor = async (projectId, equipmentId, floorId) => {
	validateRequiredString(projectId, 'Project ID');
	validateRequiredString(equipmentId, 'Equipment ID');
	validateRequiredString(floorId, 'Floor ID');
	
	const response = await server.delete(`projects/${projectId}/equipment/${equipmentId}/floors/${floorId}`);
	return response.data;
}

/**
 * Upload an image for equipment
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {FormData} data - Image data
 * @returns {Promise<Object>} Upload confirmation
 */
const postImage = async ( projectId, equipmentId, data) => {

	validateRequiredString(projectId, 'Project ID');
	validateRequiredString(equipmentId, 'Equipment ID');
	// if (!(data instanceof FormData)) {
	// 	throw new Error('Image data must be FormData');
	// }
	
	const response = await server.post(`equipments/${equipmentId}/images`, data);
	return response.data;
}

/**
 * Get equipment attachments by equipment ID
 * @param {string} equipmentId - Equipment ID
 * @returns {Promise<Object>} Equipment attachments data
 */
const getEquipmentAttachments = async (equipmentId) => {
	validateRequiredString(equipmentId, 'Equipment ID');
	
	const response = await server.get(`attachments/equipment/${equipmentId}`);
	return response.data;
}

/**
 * Delete an attachment
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteAttachment = async (attachmentId) => {
	validateRequiredString(attachmentId, 'Attachment ID');
	
	const response = await server.delete(`attachments/${attachmentId}`);
	return response.data;
}

/**
 * Get SAS token for a storage container
 * @param {string} containerName - Container name
 * @param {number} [expiryHours] - Token expiry time in hours (default: 24)
 * @returns {Promise<Object>} SAS token response
 */
const getStorageSasToken = async (containerName, expiryHours = 24) => {
	validateRequiredString(containerName, 'Container name');
	
	const response = await server.get(`storage/sas-token/${containerName}?expiry_hours=${expiryHours}`);
	return response.data;
}

/**
 * Generic PATCH request function
 * @param {string} uri - Endpoint URI
 * @param {Object} data - Data to patch
 * @returns {Promise<Object>} Response data
 */
const sendPatchRequest = async (uri, data) => {
	validateRequiredString(uri, 'URI');
	validateRequiredObject(data, 'Data');
	
	const response = await server.patch(uri, data);
	return response.data;
}

/**
 * Download inspection report Excel document for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Blob>} Excel file as blob
 */
const downloadInspectionReport = async (projectId) => {
	validateRequiredString(projectId, 'Project ID');
	
	// Add timestamp to bypass cache
	const timestamp = new Date().getTime();
	const response = await server.get(`projects/${projectId}/inspection-report?t=${timestamp}`, {
		responseType: 'blob'
	});
	return response.data;
}

const downloadInspectionReportWord = async (projectId) => {
	validateRequiredString(projectId, 'Project ID');
	
	// Add timestamp to bypass cache
	const timestamp = new Date().getTime();
	const response = await server.get(`projects/${projectId}/report?t=${timestamp}`, {
		responseType: 'blob'
	});
	return response.data;
}

// ============================================================================
// EXPORTED API OBJECT
// ============================================================================

export const api = {
	// Projects API
	projects: {
		getAll: getProjects,
		getById: getProject,
		create: createProject,
		update: updateProject,
		delete: deleteProject,
		getCategories: getProjectCategories,
		downloadInspectionReport: downloadInspectionReport,
		downloadInspectionReportWord: downloadInspectionReportWord,
		// Equipment sub-resource
		equipments: {
			getAll: getEquipment,
			create: createEquipment,
			update: updateEquipment,
			delete: deleteEquipment,
			bulkSave: saveProjectEquipments,
			// Floors sub-resource
			floors: {
				getAll: getFloors,
				create: createFloor,
				update: updateFloor,
				delete: deleteFloor
			},
			// Images sub-resource
			images: {
				post: postImage
			}
		}
	},

	// Accounts API
	accounts: {
		getAll: getAccounts,
		getById: getAccount,
		create: createAccount,
		update: updateAccount,
		delete: deleteAccount
	},

	// Checklists API
	checklists: {
		getAll: getChecklists,
		getById: getChecklist,
		create: createChecklist,
		update: updateChecklist,
		updateMany: updateChecklists,
		delete: deleteChecklist
	},

	// Attachments API
	attachments: {
		getEquipmentAttachments: getEquipmentAttachments,
		delete: deleteAttachment
	},

	// Storage API
	storage: {
		getSasToken: getStorageSasToken
	},

	// Utility functions
	utils: {
		patch: sendPatchRequest
	}
}

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Export individual functions for backward compatibility
export {
	getProjects,
	getProject,
	createProject,
	updateProject as saveProject, // Alias for backward compatibility
	deleteProject,
	getProjectCategories,
	getAccounts,
	getAccount,
	createAccount,
	updateAccount as saveAccount, // Alias for backward compatibility
	deleteAccount,
	getChecklists,
	getChecklistsWithVersion,
	getChecklist,
	saveProjectEquipments,
	createChecklist,
	updateChecklist as patchChecklist, // Alias for backward compatibility
	updateChecklists as patchChecklists, // Alias for backward compatibility
	deleteChecklist,
	getEquipment,
	createEquipment,
	updateEquipment as patchEquipment, // Alias for backward compatibility
	deleteEquipment,
	getFloors,
	createFloor,
	updateFloor as patchFloor, // Alias for backward compatibility
	deleteFloor,
	postImage, // Alias for backward compatibility
	getEquipmentAttachments,
	deleteAttachment,
	getStorageSasToken,
	sendPatchRequest,
	downloadInspectionReport
}
