// RPG スタイルの画像カード
import RPGWindow from "./RPGWindow.jsx";
import apiClient from '../services/apiClient';

const API_BASE_URL = 'http://localhost:5000/api';

const RPGImageCard = ({ group, directory, onGroupSelect }) => {
    const representativeImage = group.images[0];
    
    // APIレスポンスから直接メタデータを取得
    const metadata = {
        prompt: group.prompt,
        generation_params: group.generation_params
    };
    
    // 表示したい主要パラメータを抽出
    const displayParams = {
        'Steps': metadata.generation_params['Steps'],
        'CFG scale': metadata.generation_params['CFG scale'],
        'Seed': metadata.generation_params['Seed'],
        'Model': metadata.generation_params['Model'],
    };
    
    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onGroupSelect(group)}
        >
            <div className="relative">
                <img
                    src={apiClient.getImageUrl(directory, representativeImage.filename)}
                    alt={representativeImage.filename}
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
