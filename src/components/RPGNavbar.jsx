// RPG スタイルのナビゲーションバー
import RPGButton from "./RPGButton.jsx";

const RPGNavbar = ({ active, onNavChange }) => {
    return (
        <div className="bg-gray-100 py-2 border-b-2 border-gray-600 mb-6">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
                <div className="text-lg font-bold text-gray-800 mb-0">プロンプトアーカイブ</div>
            </div>
        </div>
    );
};

export default RPGNavbar;
