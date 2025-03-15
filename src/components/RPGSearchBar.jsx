// RPG スタイルの検索バー
import RPGWindow from "./RPGWindow.jsx";
import RPGButton from "./RPGButton.jsx";
import { FaTimes } from 'react-icons/fa';

// よく使われるタグの定義
const COMMON_TAGS = [
    'portrait',
    'landscape',
    'highquality',
    'realistic',
    'anime',
];

const RPGSearchBar = ({ searchTerm, setSearchTerm, onSearch }) => {
    const handleTagClick = (tag) => {
        const prefix = searchTerm ? `${searchTerm} ` : '';
        setSearchTerm(`${prefix}${tag}`);
    };

    return (
        <div className="mb-6">
            <RPGWindow title="検索">
                <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3">
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
                                onClick={() => {
                                    setSearchTerm('');
                                    onSearch();
                                }}
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

                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="text-sm text-gray-700 font-medium mr-2">よく使われるタグ:</div>
                    {COMMON_TAGS.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </RPGWindow>
        </div>
    );
};

export default RPGSearchBar;
