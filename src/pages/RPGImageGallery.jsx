// メイン Gallery ページ
import {useEffect, useState} from "react";
import RPGSearchBar from "../components/RPGSearchBar.jsx";
import RPGWindow from "../components/RPGWindow.jsx";
import RPGImageCard from "../components/RPGImageCard.jsx";
import RPGGroupDetailView from "../components/RPGGroupDetailView.jsx";
import { FaTimes } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import { useQuery } from '@tanstack/react-query';

const RPGImageGallery = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [imageGroups, setImageGroups] = useState([]);
    const [currentDirectory, setCurrentDirectory] = useState(null);
    const [directories, setDirectories] = useState([]);
    const [directoryFilter, setDirectoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // ディレクトリ一覧の取得
    const { data: directoriesData } = useQuery({
        queryKey: ['directories'],
        queryFn: () => apiClient.getDirectories(),
    });

    useEffect(() => {
        if (directoriesData) {
            setDirectories(directoriesData.directories);
        }
    }, [directoriesData]);

    // 画像グループの取得
    const { data: groupsData, isLoading } = useQuery({
        queryKey: ['imageGroups', currentDirectory, searchTerm],
        queryFn: () => apiClient.getImageGroups(currentDirectory, searchTerm),
        enabled: !!currentDirectory, // currentDirectory が存在する場合のみ実行
    });

    useEffect(() => {
        if (groupsData) {
            setImageGroups(groupsData.groups);
        }
    }, [groupsData]);

    // グループ選択ハンドラ
    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
    };

    // 画像選択ハンドラ
    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    // ディレクトリの変更
    const handleDirectoryChange = (newDirectory) => {
        setCurrentDirectory(newDirectory);
        setSearchTerm(''); // ディレクトリ変更時に検索条件をリセット
    };

    // 検索機能
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // フィルタされたディレクトリリストを取得
    const filteredDirectories = directories.filter(dir =>
        dir.toLowerCase().includes(directoryFilter.toLowerCase())
    );

    return (
        <div className="bg-gray-100 min-h-screen pb-12 font-mono">
            <div className="bg-gray-100 py-2 border-b-2 border-gray-600 mb-6">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-lg font-bold text-gray-800 mb-0">プロンプトアーカイブ</div>
                </div>
            </div>

            <div className="flex">
                {/* 左サイドバーとしてのフォルダー選択 */}
                <div className="w-64 min-h-screen">
                    <RPGWindow title="フォルダー" className="sticky top-4">
                        <div className="mb-3 relative">
                            <input
                                type="text"
                                placeholder="検索..."
                                className="w-full bg-gray-200 px-2 py-2 border-2 border-gray-700 rounded-md text-gray-800"
                                value={directoryFilter}
                                onChange={(e) => setDirectoryFilter(e.target.value)}
                            />
                            {directoryFilter && (
                                <button
                                    type="button"
                                    onClick={() => setDirectoryFilter('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer hover:text-gray-900"
                                    title="検索をクリア"
                                >
                                    <FaTimes className="text-gray-700" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {filteredDirectories.map((dir) => (
                                <button
                                    key={dir}
                                    className={`px-2 py-1 rounded text-left text-sm ${
                                        currentDirectory === dir 
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-gray-100 hover:bg-gray-300'
                                    }`}
                                    onClick={() => handleDirectoryChange(dir)}
                                >
                                    {dir}
                                </button>
                            ))}
                        </div>
                    </RPGWindow>
                </div>

                {/* メインコンテンツエリア */}
                <div className="flex-1 px-4">
                    <RPGSearchBar onSearch={handleSearch} />

                    <RPGWindow title="ギャラリー">
                        {!currentDirectory ? (
                            <div className="flex justify-center items-center h-64 text-gray-500">
                                表示するフォルダーを選択してください
                            </div>
                        ) : isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {imageGroups.map((group, index) => (
                                    <RPGImageCard
                                        key={index}
                                        group={group}
                                        onGroupSelect={handleGroupSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </RPGWindow>
                </div>
            </div>

            {/* グループ詳細モーダル */}
            {selectedGroup && (
                <RPGGroupDetailView
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onImageSelect={handleImageSelect}
                />
            )}
        </div>
    );
};

export default RPGImageGallery;
