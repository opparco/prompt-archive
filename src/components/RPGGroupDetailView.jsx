// RPG スタイルの画像カード
import RPGWindow from "./RPGWindow.jsx";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

const RPGGroupDetailView = ({ group, location }) => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(group.images[0]);

    const handleBack = () => {
        // 現在のURLからdirectoryとsearchパラメータを取得
        const params = new URLSearchParams(location.search);
        const directory = params.get('directory');
        const search = params.get('search');
        
        // パラメータを保持して戻る
        const searchParams = new URLSearchParams();
        if (directory) searchParams.set('directory', directory);
        if (search) searchParams.set('search', search);
        
        navigate(`/gallery?${searchParams.toString()}`);
    };

    const { data: selectedImageDetails, isLoading } = useQuery({
        queryKey: ['imageDetails', selectedImage.id],
        queryFn: () => apiClient.getEntryDetails(selectedImage.id),
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate(-1);
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
    }, [navigate, group.images, selectedImage]);

    return (
        <div className="bg-gray-100 min-h-screen pb-12 font-mono">
            <div className="bg-gray-100 py-2 border-b-2 border-gray-600 mb-6">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-800">プロンプトアーカイブ</div>
                    <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={handleBack}
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <RPGWindow title="グループの詳細" className="w-full">
                    <div className="p-4 lg:flex lg:gap-8 space-y-6 lg:space-y-0">
                        {/* メイン画像 */}
                        <div className="lg:w-2/3">
                            {selectedImageDetails && selectedImageDetails.image_url && (
                                <img
                                    src={selectedImageDetails.image_url}
                                    className="w-full max-h-[70vh] lg:max-h-[80vh] object-contain cursor-pointer"
                                    onClick={() => window.open(selectedImageDetails.image_url, '_blank')}
                                />
                            )}
                        </div>

                        {/* メタデータとバリアント */}
                        <div className="lg:w-1/3 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <Loader size="sm" color="gray" showText={false} />
                                </div>
                            ) : selectedImageDetails && (
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
                </RPGWindow>
            </div>
        </div>
    );
};

export default RPGGroupDetailView; 