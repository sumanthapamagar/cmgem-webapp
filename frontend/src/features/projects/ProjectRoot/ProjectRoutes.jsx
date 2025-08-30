import { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';


import { EquipmentInformation } from './ProjectEquipment/EquipmentInformation';
import { EquipmentInspection } from './ProjectEquipment/EquipmentInspection';
import { SiteDetails } from './ProjectEquipment/SiteDetails';
import EquipmentFloors from './ProjectEquipment/EquipmentFloors';
import { ProjectUpdate } from './ProjectUpdate';
import EquipmentRoot from './ProjectEquipment';

const ProjectRoutes = () => {
    return (
        <>
            <Routes>
                <Route
                    index
                    element={
                        <ProjectUpdate  />
                    }
                />
                <Route
                    path="details"
                    element={
                        <ProjectUpdate />
                    }
                />
                <Route path="equipments/:equipmentId" element={<EquipmentRoot />}>
                    <Route index element={<EquipmentInformation />} />
                    <Route path="information" element={<EquipmentInformation />} />
                    <Route path="inspection" element={<EquipmentInspection />} />
                    <Route path="site" element={<SiteDetails />} />
                    <Route path="floor-table" element={<EquipmentFloors />} />
                </Route>
            </Routes>
        </>
    );
};

export default ProjectRoutes;
