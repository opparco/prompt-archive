// RPG スタイルの画像カード
import RPGWindow from "./RPGWindow.jsx";
import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const RPGGroupDetailView = ({ group, onClose, onImageSelect }) => {
    const [selectedImage, setSelectedImage] = useState(group.images[0]);
    const [selectedImageDetails, setSelectedImageDetails] = useState(null);

    useEffect(() => {
        const loadImageDetails = async () => {
            try {
                const details = await apiClient.getEntryDetails(selectedImage.id);
                setSelectedImageDetails(details);
            } catch (error) {
                console.error('Failed to load image details:', error);
            }
        };
        loadImageDetails();
    }, [selectedImage.id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                const currentIndex = group.images.findIndex(img => img.id === selectedImage.id);
                const newIndex = currentIndex > 0 ? currentIndex - 1 : group.images.length - 1;
                setSelectedImage(group.images[newIndex]);
            } else if (e.key === 'ArrowRight') {
                const currentIndex = group.images.findIndex(img => img.id === selectedImage.id);
                const newIndex = currentIndex < group.images.length - 1 ? currentIndex + 1 : 0;
                setSelectedImage(group.images[newIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, group.images, selectedImage]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <RPGWindow title="グループの詳細" className="w-11/12 max-w-6xl">
                <div className="p-4 flex gap-8">
                    {/* 左側: メイン画像 */}
                    <div className="w-1/2 flex-shrink-0">
                        <div className="sticky top-4">
                            {selectedImageDetails && (
                                <img
                                    src={selectedImageDetails.image_url}
                                    className="w-full object-contain"
                                    onClick={() => onImageSelect(selectedImageDetails)}
                                />
                            )}
                        </div>
                    </div>

                    {/* 右側: メタデータとバリアント */}
                    <div className="w-1/2 space-y-4">
                        {selectedImageDetails && (
                            <div className="space-y-2">
                                <div className="bg-gray-50 p-3 rounded">
                                    <h3 className="font-medium mb-1">プロンプト</h3>
                                    <p className="text-sm text-gray-600">{selectedImageDetails.metadata.prompt}</p>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded">
                                    <h3 className="font-medium mb-1">ネガティブプロンプト</h3>
                                    <p className="text-sm text-gray-600">{selectedImageDetails.metadata.negative_prompt}</p>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded">
                                    <h3 className="font-medium mb-1">生成パラメータ</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        {Object.entries(selectedImageDetails.metadata.generation_params || {}).map(([key, value]) => (
                                            value && (
                                                <div key={key}>
                                                    <span className="font-medium">{key}:</span> {value}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* バリアント */}
                        <div>
                            <h3 className="font-medium mb-2">バリアント ({group.images.length})</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {group.images.map((image) => (
                                    <div 
                                        key={image.id}
                                        className={`cursor-pointer hover:opacity-80 ${
                                            image.id === selectedImage.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.thumbnail_url}
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