// RPG スタイルの画像カード
import RPGWindow from "./RPGWindow.jsx";
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const RPGGroupDetailView = ({ group, directory, onClose, onImageSelect }) => {
    const representativeImage = group.images[0];
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : group.images.length - 1
                );
            } else if (e.key === 'ArrowRight') {
                setSelectedIndex(prev => 
                    prev < group.images.length - 1 ? prev + 1 : 0
                );
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, group.images.length]);

    // 現在選択されている画像を取得
    const currentImage = group.images[selectedIndex];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <RPGWindow title="グループの詳細" className="w-11/12 max-w-6xl">
                <div className="p-4 flex gap-8">
                    {/* 左側: 代表画像 */}
                    <div className="w-1/2 flex-shrink-0">
                        <div className="sticky top-4">
                            <img
                                src={`${API_BASE_URL}/images/${directory}/${currentImage.filename}`}
                                alt={currentImage.filename}
                                className="w-full object-contain"
                                onClick={() => onImageSelect({
                                    ...currentImage,
                                    directory,
                                    metadata: group.raw_metadata
                                })}
                            />
                        </div>
                    </div>

                    {/* 右側: プロンプト、パラメータ、バリアント */}
                    <div className="w-1/2 space-y-4">
                        {/* プロンプトとパラメータ */}
                        <div className="space-y-2">
                            <div className="bg-gray-50 p-3 rounded">
                                <h3 className="font-medium mb-1">プロンプト</h3>
                                <p className="text-sm text-gray-600">{group.prompt}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded">
                                <h3 className="font-medium mb-1">生成パラメータ</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    {Object.entries(group.generation_params).map(([key, value]) => (
                                        value && (
                                            <div key={key}>
                                                <span className="font-medium">{key}:</span> {value}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* バリアント */}
                        <div>
                            <h3 className="font-medium mb-2">バリアント ({group.images.length})</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {group.images.map((image, index) => (
                                    <div 
                                        key={image.id}
                                        className={`cursor-pointer hover:opacity-80 ${
                                            index === selectedIndex ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                        onClick={() => setSelectedIndex(index)}
                                    >
                                        <img
                                            src={`${API_BASE_URL}/images/${directory}/${image.filename}`}
                                            alt={image.filename}
                                            className="w-full aspect-square object-cover rounded"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                    onClick={onClose}
                >
                    ✕
                </button>
            </RPGWindow>
        </div>
    );
};

export default RPGGroupDetailView; 