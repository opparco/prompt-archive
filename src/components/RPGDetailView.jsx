// RPG スタイルの詳細表示
import RPGButton from "./RPGButton.jsx";
import RPGWindow from "./RPGWindow.jsx";

const RPGDetailView = ({ image, onClose }) => {
    const metadata = parseMetadataString(image.metadata);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="max-w-5xl w-full max-h-[90vh] overflow-hidden pt-4">
                <RPGWindow title={`詳細 #${image.id}`} titleWidth="250px">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <div className="border-2 border-gray-600 rounded-md overflow-hidden">
                                <img
                                    src={`/images${image.imagePath}`}
                                    alt="Detailed view"
                                    className="w-full object-contain max-h-[60vh]"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.webp';
                                    }}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1 space-y-4">
                            <div className="border-2 border-gray-600 rounded-md p-4 bg-gray-200">
                                <h3 className="font-bold text-lg mb-2">プロンプト</h3>
                                <p className="text-sm text-gray-800 bg-white p-3 rounded-md border border-gray-400">
                                    {metadata.Prompt || 'No prompt available'}
                                </p>
                            </div>

                            {metadata['Negative prompt'] && (
                                <div className="border-2 border-gray-600 rounded-md p-4 bg-gray-200">
                                    <h3 className="font-bold text-lg mb-2">ネガティブプロンプト</h3>
                                    <p className="text-sm text-gray-800 bg-white p-3 rounded-md border border-gray-400">
                                        {metadata['Negative prompt']}
                                    </p>
                                </div>
                            )}

                            <div className="border-2 border-gray-600 rounded-md p-4 bg-gray-200">
                                <h3 className="font-bold text-lg mb-2">生成設定</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="font-semibold">モデル:</span> {metadata.Model || 'Unknown'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">サンプラー:</span> {metadata.Sampler || 'Unknown'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">ステップ数:</span> {metadata.Steps || 'Unknown'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">CFG値:</span> {metadata['CFG scale'] || 'Unknown'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">サイズ:</span> {metadata.Size || 'Unknown'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">シード値:</span> {metadata.Seed || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <RPGButton onClick={onClose}>
                            閉じる
                        </RPGButton>
                    </div>
                </RPGWindow>
            </div>
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

export default RPGDetailView;
