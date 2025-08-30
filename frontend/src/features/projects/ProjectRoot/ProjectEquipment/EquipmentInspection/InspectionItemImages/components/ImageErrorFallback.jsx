
export const ImageErrorFallback = ({ image, onClick }) => {
    return (
        <div 
            className="h-12 w-16 bg-gray-200 flex items-center justify-center border border-gray-300 cursor-pointer"
            onClick={onClick}
        >
            <div className="text-center text-xs text-gray-500">
                <i className="fa-solid fa-image fa-fw mb-1"></i>
                <div>Failed to load</div>
            </div>
        </div>
    );
};
