import { Stack } from "../../../../../components";

export function EquipmentNotFound() {
    return (
        <Stack className="items-center justify-center">
            <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <span>Equipment not found</span>
            </div>
        </Stack>
    );
}

export function EquipmentLoadingState({ message = "Loading equipment..." }) {
    return (
        <Stack className="items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harper-blue mx-auto mb-2"></div>
                <span>{message}</span>
            </div>
        </Stack>
    );
}