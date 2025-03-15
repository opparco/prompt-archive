// RPG スタイルの画像カード
import RPGWindow from "./RPGWindow.jsx";

const RPGImageCard = ({ image, onClick }) => {
    // メタデータをパース
    const metadata = parseMetadataString(image.metadata);

    // 重要な情報を抽出
    const prompt = metadata.Prompt || 'No prompt available';
    const model = metadata.Model || 'Unknown model';
    const sampler = metadata.Sampler || '';
    const steps = metadata.Steps || '';
    const cfgScale = metadata['CFG scale'] || '';
    const size = metadata.Size || '';

    // プロンプトを短く表示するヘルパー関数
    const truncatePrompt = (text, maxLength = 60) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => onClick && onClick(image)}
        >
            <RPGWindow className="h-full">
                <div className="relative">
                    <img
                        src={`/images${image.imagePath}`}
                        alt={truncatePrompt(prompt, 30)}
                        className="w-full h-48 object-cover rounded-md border-2 border-gray-600"
                        onError={(e) => {
                            e.target.src = '/placeholder-image.webp';
                        }}
                    />

                    {size && (
                        <div className="absolute top-2 right-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded-md">
                            {size}
                        </div>
                    )}
                </div>

                <div className="mt-3">
                    <p className="text-sm line-clamp-2 font-medium text-gray-800">
                        {truncatePrompt(prompt, 100)}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
            <span className="inline-block bg-gray-200 border border-gray-500 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
              {model.split('_')[0]}
            </span>

                        {sampler && (
                            <span className="inline-block bg-gray-200 border border-gray-500 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
                {sampler.split(' ')[0]}
              </span>
                        )}
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-700">
                        {steps && <div>Steps: {steps}</div>}
                        {cfgScale && <div>CFG: {cfgScale}</div>}
                        <div className="text-right">ID: {image.id}</div>
                    </div>
                </div>
            </RPGWindow>
        </div>
    );
};

// メタデータ文字列を解析する関数
const parseMetadataString = (metadataString) => {
    if (!metadataString) return {};

    const result = {};

    // Split by commas that are not within quotes
    const parts = metadataString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

    parts.forEach(part => {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
            const key = part.substring(0, colonIndex).trim();
            const value = part.substring(colonIndex + 1).trim();

            // Remove quotes if present
            const cleanValue = value.startsWith('"') && value.endsWith('"')
                ? value.substring(1, value.length - 1)
                : value;

            result[key] = cleanValue;
        }
    });

    return result;
};

export default RPGImageCard;
