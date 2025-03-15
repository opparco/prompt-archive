// メイン Gallery ページ
import {useEffect, useState} from "react";
import RPGSearchBar from "../components/RPGSearchBar.jsx";
import RPGWindow from "../components/RPGWindow.jsx";
import RPGDetailView from "../components/RPGDetailView.jsx";
import RPGNavbar from "../components/RPGNavbar.jsx";
import RPGImageCard from "../components/RPGImageCard.jsx";
import RPGGroupDetailView from "../components/RPGGroupDetailView.jsx";
import { FaSearch, FaTimes } from 'react-icons/fa';
import apiClient from '../services/apiClient';

const RPGImageGallery = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeNav, setActiveNav] = useState('gallery');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [imageGroups, setImageGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDirectory, setCurrentDirectory] = useState(null);
    const [directories, setDirectories] = useState([]);
    const [directoryFilter, setDirectoryFilter] = useState('');

    // ディレクトリ一覧の取得
    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                const { directories } = await apiClient.getDirectories();
                setDirectories(directories);
            } catch (error) {
                console.error('ディレクトリの取得に失敗しました:', error);
            }
        };

        fetchDirectories();
    }, []);

    // 画像グループの取得
    useEffect(() => {
        if (!currentDirectory) return;

        const fetchImageGroups = async () => {
            setLoading(true);
            try {
                const { groups } = await apiClient.getImageGroups(currentDirectory);
                setImageGroups(groups);
            } catch (error) {
                console.error('画像グループの取得に失敗しました:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchImageGroups();
    }, [currentDirectory]);

    // 検索機能
    const handleSearch = (e) => {
        e && e.preventDefault();
        if (currentDirectory) {
            setLoading(true);
            apiClient.getImageGroups(currentDirectory, searchTerm)
                .then(response => {
                    setImageGroups(response.groups);
                })
                .catch(error => {
                    console.error('検索に失敗しました:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

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
        setImageGroups([]);
    };

    // フィルタされたディレクトリリストを取得
    const filteredDirectories = directories.filter(dir =>
        dir.name.toLowerCase().includes(directoryFilter.toLowerCase())
    );

    return (
        <div className="bg-gray-100 min-h-screen pb-12 font-mono">
            <RPGNavbar active={activeNav} onNavChange={setActiveNav} />

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
                                    key={dir.path}
                                    className={`px-2 py-1 rounded text-left text-sm ${
                                        currentDirectory === dir.path 
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-gray-100 hover:bg-gray-300'
                                    }`}
                                    onClick={() => handleDirectoryChange(dir.path)}
                                >
                                    {dir.name} ({dir.webp_count})
                                </button>
                            ))}
                        </div>
                    </RPGWindow>
                </div>

                {/* メインコンテンツエリア */}
                <div className="flex-1 px-4">
                    <RPGSearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onSearch={handleSearch}
                    />

                    <RPGWindow title="ギャラリー">
                        {!currentDirectory ? (
                            <div className="flex justify-center items-center h-64 text-gray-500">
                                表示するフォルダーを選択してください
                            </div>
                        ) : loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {imageGroups.map(group => (
                                    <RPGImageCard
                                        key={group.group_id}
                                        group={group}
                                        directory={currentDirectory}
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
                    directory={currentDirectory}
                    onClose={() => setSelectedGroup(null)}
                    onImageSelect={handleImageSelect}
                />
            )}

            {/* 画像詳細モーダル */}
            {selectedImage && (
                <RPGDetailView
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
};

export default RPGImageGallery;
