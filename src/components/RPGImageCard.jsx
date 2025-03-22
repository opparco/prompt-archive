// RPG スタイルの画像カード
import RPGWindow from "./RPGWindow.jsx";

const RPGImageCard = ({ group, onGroupSelect }) => {
    const representativeImage = group.images[0];
    
    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onGroupSelect(group)}
        >
            <div className="relative">
                <img
                    src={representativeImage.thumbnail_url}
                    className="w-full h-48 object-cover"
                />
                {group.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        {group.images.length} バリアント
                    </div>
                )}
            </div>
        </div>
    );
};

export default RPGImageCard;
