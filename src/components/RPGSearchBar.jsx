// RPG スタイルの検索バー
import RPGWindow from "./RPGWindow.jsx";
import RPGButton from "./RPGButton.jsx";
import { FaSearch } from 'react-icons/fa';

const RPGSearchBar = ({ searchTerm, setSearchTerm, onSearch }) => {
    return (
        <div className="mb-6">
            <RPGWindow title="検索">
                <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            placeholder="プロンプトで検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-200 border-2 border-gray-700 rounded-md py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaSearch className="text-gray-700" />
                        </div>
                    </div>
                    <RPGButton onClick={onSearch} className="px-4 py-2">
                        検索
                    </RPGButton>
                    <RPGButton>
                        詳細フィルター
                    </RPGButton>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="text-sm text-gray-700 font-medium mr-2">よく使われるタグ:</div>
                    <button className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300">
                        portrait
                    </button>
                    <button className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300">
                        landscape
                    </button>
                    <button className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300">
                        highquality
                    </button>
                    <button className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300">
                        realistic
                    </button>
                    <button className="bg-gray-200 px-2 py-1 text-xs rounded-md border border-gray-500 hover:bg-gray-300">
                        anime
                    </button>
                </div>
            </RPGWindow>
        </div>
    );
};

export default RPGSearchBar;
