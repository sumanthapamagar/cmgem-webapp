import { Route, Routes } from 'react-router-dom';
import Checklists from './Checklists';

export default function ChecklistRoutes() {
    return (
        <Routes>
            <Route index element={<>Please Select the location and equipment type to view/edite checklists.</>} />
            <Route path="/:equipmentType/:location" element={<Checklists />}/>
        </Routes>
    );
}
