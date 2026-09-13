export const DeleteButton = ({ onClick, iconColor }) => {
    return (
        <button
            className="absolute top-1 right-1 bg-white/50 p-1 rounded-sm"
            onClick={onClick}
        >
            <i className={`fa-solid fa-trash ${iconColor ?? ""}`}></i>
        </button>
    );
};
