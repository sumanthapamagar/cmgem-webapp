
export const DebugInfo = ({ uploadedImages, token }) => {
    if (process.env.NODE_ENV !== 'development' || uploadedImages.length === 0) {
        return null;
    }

    return (
        <div className="text-center text-xs text-blue-600 border border-blue-200 rounded bg-blue-50 p-2 mt-2">
            <div className="font-semibold mb-1">Debug Info (Dev Only)</div>
            <div>Token: {token ? '✓ Present' : '✗ Missing'}</div>
            <div>Images: {uploadedImages.length}</div>
            <button 
                className="text-blue-800 underline mt-1"
                onClick={() => {
                    uploadedImages.forEach(img => {
                        console.log('Image debug:', {
                            id: img._id,
                            thumb: img.thumb_url,
                            low: img.low_size_url,
                            large: img.large_url,
                            url: img.url
                        });
                    });
                }}
            >
                Log URLs to Console
            </button>
        </div>
    );
};
