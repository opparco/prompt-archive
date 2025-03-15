// RPG スタイルの詳細表示
import React, { useState, useEffect } from 'react';
import RPGButton from "./RPGButton.jsx";
import RPGWindow from "./RPGWindow.jsx";
import apiClient from '../services/apiClient';

const RPGDetailView = ({ image, onClose }) => {
    const [metadata, setMetadata] = useState(null);
    const [activeTab, setActiveTab] = useState('formatted');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // 基本パラメータのリスト
    const basicParams = [
        'CFG scale',
        'Model',
        'Model hash',
        'Sampler',
        'Seed',
        'Size',
        'Steps',
        'Version'
    ];

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await apiClient.getMetadata(image.path, image.directory);
                setMetadata(response.metadata);
            } catch (error) {
                console.error('メタデータの取得に失敗しました:', error);
            }
        };

        fetchMetadata();
    }, [image]);

    const renderGenerationParams = (params) => {
        if (!params || Object.keys(params).length === 0) {
            return <p>パラメータがありません</p>;
        }

        // パラメータを基本と拡張に分類
        const basic = {};
        const advanced = {};
        Object.entries(params).forEach(([key, value]) => {
            if (basicParams.includes(key)) {
                basic[key] = value;
            } else {
                advanced[key] = value;
            }
        });

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(basic).map(([key, value]) => (
                        <div key={key} className="col-span-2 md:col-span-1">
                            <span className="font-bold">{key}:</span> {value}
                        </div>
                    ))}
                </div>

                {Object.keys(advanced).length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-lg text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                            拡張パラメータ...
                        </button>

                        {showAdvanced && (
                            <div className="grid grid-cols-2 gap-2 text-sm mt-2 pl-4 border-l-2 border-gray-200">
                                {Object.entries(advanced).map(([key, value]) => (
                                    <div key={key} className="col-span-2 md:col-span-1">
                                        <span className="font-bold">{key}:</span> {value}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="my-8">
                <RPGWindow title="詳細" className="w-full max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/2">
                            <img
                                src={`${apiClient.getImageUrl(image.directory, image.path)}`}
                                    className="w-full rounded-lg shadow-lg"
                            />
                        </div>

                        <div className="md:w-1/2 overflow-y-auto max-h-[calc(90vh-8rem)]">
                            <div className="flex gap-2 mb-4">
                                <button
                                    className={`px-3 py-1 rounded ${activeTab === 'formatted' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
                                    onClick={() => setActiveTab('formatted')}
                                >
                                    フォーマット済み
                                </button>
                                <button
                                    className={`px-3 py-1 rounded ${activeTab === 'raw' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
                                    onClick={() => setActiveTab('raw')}
                                >
                                    生データ
                                </button>
                            </div>

                            {activeTab === 'formatted' ? (
                                metadata ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold mb-2">プロンプト</h3>
                                            <p className="text-sm">{metadata.prompt}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold mb-2">ネガティブプロンプト</h3>
                                            <p className="text-sm">{metadata.negative_prompt}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold mb-2">基本パラメータ</h3>
                                            {renderGenerationParams(metadata.generation_params)}
                                        </div>
                                    </div>
                                ) : (
                                    <p>メタデータを読み込み中...</p>
                                )
                            ) : (
                                <div>
                                    <h3 className="text-lg font-bold mb-2">生データ</h3>
                                    <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-4 rounded">
                                        {metadata?.raw_metadata || '読み込み中...'}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
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
