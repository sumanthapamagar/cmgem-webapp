export const DeleteButton = ({ onClick }) => {
    return (
        <button
            className="absolute top-1 right-1 bg-white/50 p-2 rounded-sm"
            onClick={onClick}
        >
            <i className="fa-solid fa-trash"></i>
        </button>
    );
};
