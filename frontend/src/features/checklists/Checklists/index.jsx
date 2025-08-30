import { Stack } from '../../../components/layout/Stack';
import ChecklistNav from './ChecklistNav';
import ChecklistRoutes from './ChecklistRoutes';

function ChecklistHome() {
    return (
        <Stack horizontal className=" relative">
            <ChecklistNav />
            <Stack className="grow p-6 gap-6">
                <ChecklistRoutes />
            </Stack>
        </Stack>
    );
}

export default ChecklistHome;
