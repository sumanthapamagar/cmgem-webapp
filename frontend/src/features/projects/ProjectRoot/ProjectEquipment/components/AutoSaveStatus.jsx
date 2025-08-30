import { Button } from "../../../../../components";

export function FormStatusBar({
    isAutoSaving,
    isDirty,
    lastSaved,
    onManualSave,
    saveButtonText = "Save Now",
    className = ""
}) {
    return (
        <div className={`sticky top-2 z-50 py-1 px-4 bg-alice-blue border border-gray-200 rounded-lg  ${className}`}>
            <div className="flex  items-center">
                <div className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">
                        {isAutoSaving ? (
                            <>
                                <span className="text-blue-600">Saving changes locally...</span>
                                <div className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-2"></div>
                            </>
                        ) : isDirty ? (
                            <>
                                <span className="text-orange-400">New changes pending to save locally</span>
                                <div className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse ml-2"></div>
                            </>
                        ) : (
                            <>
                                <span className="text-green-600">All changes saved locally (offline mode)</span>
                                {lastSaved && (
                                    <span className="text-xs text-gray-400 ml-2">
                                        (Last saved: {new Date(lastSaved).toLocaleTimeString()})
                                    </span>
                                )}
                                <div className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                            </>
                        )}
                    </span>
                </div>
                <Button
                    type="button"
                    onClick={onManualSave}
                    disabled={isAutoSaving || !isDirty}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 h-6 ml-4 flex-shrink-0"
                >
                    {isAutoSaving ? 'Saving...' : saveButtonText}
                </Button>
            </div>
        </div>
    );
}