// RPG スタイルの検索バー
import RPGWindow from "./RPGWindow.jsx";
import RPGButton from "./RPGButton.jsx";
import { FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { useCommonTags } from '../hooks/useCommonTags';

const RPGSearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading, error } = useCommonTags();

    const handleTagClick = (tag) => {
        const prefix = searchTerm ? `${searchTerm} ` : '';
        setSearchTerm(`${prefix}${tag}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    return (
        <div className="mb-6">
            <RPGWindow title="検索">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            placeholder="検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-200 border-2 border-gray-700 rounded-md px-4 py-2 text-gray-800"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:text-gray-900"
                                title="検索をクリア"
                            >
                                <FaTimes className="text-gray-700" />
                            </button>
                        )}
                    </div>
                    <RPGButton type="submit" className="px-4 py-2">
                        検索
                    </RPGButton>
                    <RPGButton>
                        詳細フィルター
                    </RPGButton>
                </form>

                <div className="mt-4">
                    <div className="text-sm text-gray-700 font-medium mb-2">よく使われるタグ:</div>
                    {isLoading ? (
                        <div className="text-sm text-gray-600">読み込み中...</div>
                    ) : error ? (
                        <div className="text-sm text-red-600">{error.message}</div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {data.tags.map((tag) => (
                                <button
                                    key={tag.name}
                                    type="button"
                                    onClick={() => handleTagClick(tag.name)}
                                    className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300"
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </RPGWindow>
        </div>
    );
};

export default RPGSearchBar;
