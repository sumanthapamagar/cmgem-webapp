import { useCallback, useRef, useEffect } from 'react';
import { offlineStorage } from '../lib/offline-api';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to update project equipment and floors in offline storage
 * Updates the equipment in the equipments array of the project
 * and updates the project timestamp without making network requests
 */
export const useOfflineEquipmentUpdate = () => {
    const queryClient = useQueryClient();
    const updateTimeoutRef = useRef(null);
    const lastUpdateRef = useRef(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Generate a MongoDB-style ObjectId string (24 character hex string)
     * @returns {string} MongoDB-style ObjectId
     */
    const generateMongoId = useCallback(() => {
        const timestamp = Math.floor(Date.now() / 1000).toString(16);
        const randomPart = Math.random().toString(16).substring(2, 10);
        const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        return (timestamp + randomPart + counter).padEnd(24, '0');
    }, []);

    const validateOfflineProject = useCallback(async (projectId) => {
        const project = await offlineStorage.getProject(projectId);

        if (!project)
            return {
                valid: false,
                project: null,
                error: `Project ${projectId} not found in offline storage`
            };

        return {
            valid: true,
            project,
            error: null
        };
    }, []);


    const validateOfflineProjectEquipment = useCallback((project, equipmentId) => {
        if (!project.equipments || !Array.isArray(project.equipments)) {
            return {
                valid: false,
                equipmentIndex: -1,
                error: `Project ${project._id} has no equipments array`
            };
        }

        const equipmentIndex = project.equipments.findIndex(eq => eq._id === equipmentId);

        if (equipmentIndex === -1) {
            return {
                valid: false,
                equipmentIndex: -1,
                error: `Equipment ${equipmentId} not found in project ${project._id}`
            };
        }

        return {
            valid: true,
            equipmentIndex,
            error: null
        };
    }, []);

    /**
     * Add a new equipment to the project with all required fields and floors
     * @param {string} projectId - The project ID
     * @param {Object} equipmentData - Equipment data with category, start_floor, name, floors_served, project_id
     * @returns {Promise<boolean>} Success status
     */
    const addNewEquipment = useCallback(async (projectId, equipmentData) => {
        const projectValidation = await validateOfflineProject(projectId);
        if (!projectValidation.valid) return false;

        const project = projectValidation.project;
        const { category, start_floor, name, floors_served } = equipmentData;

        // Generate MongoDB-style ID for the equipment
        const equipmentId = generateMongoId();

        // Create floors array based on floors_served
        const floors = [];
        for (let i = 0; i < floors_served; i++) {
            floors.push({
                _id: generateMongoId(),
                equipment_id: equipmentId,
                level: start_floor + i,
                designation: "",
                door_opening: "",
                floor_levelling: "",
                landing_call_button: "",
                landing_chime: "",
                landing_indication: "",
                floor_comment: "",
                signalisation_comment: "",
            });
        }

        // Create new equipment with all required fields
        const newEquipment = {
            _id: equipmentId,
            name,
            category,
            start_floor,
            floors_served,
            project_id: projectId,
            // Initialize empty objects for complex fields
            car_interior: {
                "wall_type": "",
                "ceiling_and_lights_type": "",
                "flooring_type": "",
                "mirror_location": "",
                "handrails": "",
                "buttons_type": "",
                "indication_type": "",
                "voice_announcement": "",
                "car_door_finishes": "",
                "car_door_type": ""
            },
            checklists: {},
            landings: {
                "fire_rated_landing_doors": "",
                "landing_signalisation_type": "",
                "no_of_landing_button_risers": "",
                "landing_doors_frame_finishes": ""
            },
            lift: {
                "lift_number": "",
                "installation_date": "",
                "original_equipment_manufacturer": "",
                "lift_type": "",
                "drive_system": "",
                "applicable_code": "",
                "load": "",
                "speed": "",
                "floor_served_front": "",
                "floor_served_rear": "",
                "hoist_rope_size": "",
                "governer_rope_size": ""
            },
            lift_car: {
                "car_interior": "",
                "car_door_finish": "",
                "car_door_type": "",
                "car_signalisation": ""
            },
            lift_shaft: {
                "liftwell_construiction": "",
                "vents_in_liftwell": "",
                "sprinklers_smoke_detectors": "",
                "ledges_in_liftwell": "",
                "false_pit_floors": "",
                "building_services_in_liftwell": "",
                "sprinklers_in_pit": ""
            },
            machine_room: {
                "machine_room_location": "",
                "machine_room_ventilation": "",
                "lift_submain_type_and_number_of": "",
                "machinery_access_hatch": "",
                "building_services_in_machine_room": "",
                "lifting_beams_with_rated_load_visible": "",
                "fire_extinguisher": "",
                "sprinkllers_smoke_detectors": ""
            },
            maintenance: {
                "current_provider": "",
                "total_inspections_last_12_months": "",
                "total_calls_last_12_months": "",
                "annual_safety_visit_date": ""
            },
            floors,
        };

        const updatedEquipments = [...(project.equipments || []), newEquipment];

        const updatedProject = {
            ...project,
            equipments: updatedEquipments,
        };

        const success = await offlineStorage.saveProject(updatedProject, false, true); // Skip limit enforcement for equipment updates

        // Invalidate offline project query to trigger UI update
        if (success && queryClient) {
            queryClient.invalidateQueries({ queryKey: ['offline-project', projectId] });
        }

        return success;
    }, [validateOfflineProject, generateMongoId, queryClient]);

    const updateEquipment = useCallback(async ({ projectId, equipmentId, updates, delay = 100 }) => {
        try {
            // Clear any existing timeout to prevent race conditions
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            // Set a new timeout for the update - reduced from 300ms to 100ms
            updateTimeoutRef.current = setTimeout(async () => {
                try {
                    const projectValidation = await validateOfflineProject(projectId);
                    if (!projectValidation.valid) {
                        console.error('Project validation failed:', projectValidation.error);
                        return false;
                    }

                    const project = projectValidation.project;
                    const equipmentValidation = validateOfflineProjectEquipment(project, equipmentId);

                    if (!equipmentValidation.valid) {
                        console.error('Equipment validation failed:', equipmentValidation.error);
                        return false;
                    }

                    const equipmentIndex = equipmentValidation.equipmentIndex;

                    const updatedEquipment = {
                        ...project.equipments[equipmentIndex],
                        ...updates,
                    };

                    const updatedEquipments = [...project.equipments];
                    updatedEquipments[equipmentIndex] = updatedEquipment;

                    const updatedProject = {
                        ...project,
                        equipments: updatedEquipments,
                        last_updated: new Date().toISOString(), // Add timestamp for tracking
                    };

                    const success = await offlineStorage.saveProject(updatedProject, false, true); // Skip limit enforcement for equipment updates

                    // Invalidate offline project query to trigger UI update
                    if (success && queryClient) {
                        queryClient.invalidateQueries({ queryKey: ['offline-project', projectId] });
                        lastUpdateRef.current = Date.now();
                    } else {
                        console.error('Failed to save project to offline storage');
                    }

                    return success;
                } catch (error) {
                    console.error('Error in delayed equipment update:', error);
                    return false;
                }
            }, delay);

        } catch (error) {
            console.error('Error setting up equipment update:', error);
            return false;
        }
    }, [validateOfflineProject, validateOfflineProjectEquipment, queryClient]);


    return {
        validateOfflineProject,
        validateOfflineProjectEquipment,
        updateEquipment,
        addNewEquipment,
    };
};
