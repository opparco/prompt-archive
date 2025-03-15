// メイン Gallery ページ
import {useEffect, useState} from "react";
import RPGSearchBar from "../components/RPGSearchBar.jsx";
import RPGWindow from "../components/RPGWindow.jsx";
import RPGDetailView from "../components/RPGDetailView.jsx";
import RPGNavbar from "../components/RPGNavbar.jsx";
import RPGImageCard from "../components/RPGImageCard.jsx";

const RPGImageGallery = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeNav, setActiveNav] = useState('gallery');
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // サンプルデータの読み込み
    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);

            // 実際のアプリではAPIリクエストになります
            const sampleImages = [
                {
                    id: '1',
                    imagePath: '/00172-2622955718.webp',
                    metadata: 'Steps: 20, Sampler: Euler a, CFG scale: 7, Seed: 1234567890, Size: 512x512, Model hash: abcdef123456, Model: stable_diffusion, Prompt: a beautiful landscape with mountains and lake, Negative prompt: bad quality, blurry'
                },
                {
                    id: '2',
                    imagePath: '/00232-2622955650.webp',
                    metadata: 'Steps: 25, Sampler: DPM++ 2M Karras, CFG scale: 8, Seed: 987654321, Size: 768x768, Model hash: 123abc456def, Model: deliberate_v2, Prompt: portrait of a woman with blue eyes, Negative prompt: deformed, ugly, bad anatomy'
                },
                {
                    id: '3',
                    imagePath: '/00294-2622955584.webp',
                    metadata: 'Steps: 30, Sampler: DDIM, CFG scale: 9, Seed: 555555555, Size: 1024x576, Model hash: 789xyz123abc, Model: dreamshaper_8, Prompt: futuristic city with flying cars and neon lights, Negative prompt: poor quality, low resolution'
                },
                {
                    id: '4',
                    imagePath: '/00355-2622955645.webp',
                    metadata: 'Steps: 40, Sampler: LMS, CFG scale: 7.5, Seed: 123123123, Size: 640x640, Model hash: def456xyz789, Model: realistic_vision_v3, Prompt: cat sitting on a window sill, sunshine, cozy, Negative prompt: cartoon, illustration, drawing'
                },
                {
                    id: '5',
                    imagePath: '/b/src/10004/10004.jpg',
                    metadata: 'Steps: 35, Sampler: Euler a, CFG scale: 8.5, Seed: 888888888, Size: 512x768, Model hash: xyz789def456, Model: stable_diffusion_xl, Prompt: fantasy castle with dragons flying overhead, epic scene, Negative prompt: bad composition, poor lighting'
                },
                {
                    id: '6',
                    imagePath: '/b/src/10005/10005.jpg',
                    metadata: 'Steps: 28, Sampler: DPM++ SDE Karras, CFG scale: 7, Seed: 444444444, Size: 768x512, Model hash: 123def789xyz, Model: photorealistic_v1, Prompt: autumn forest with fallen leaves and morning mist, Negative prompt: oversaturated, blurry, low quality'
                }
            ];

            setImages(sampleImages);
            setLoading(false);
        };

        fetchImages();
    }, []);

    // 検索機能
    const handleSearch = (e) => {
        e && e.preventDefault();
        console.log(`検索: ${searchTerm}`);
        // 実際のアプリでは検索処理を実装
    };

    // 画像の詳細表示
    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-12 font-mono">
            <RPGNavbar active={activeNav} onNavChange={setActiveNav} />

            <div className="container mx-auto px-4">
                <RPGSearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSearch={handleSearch}
                />

                {loading ? (
                    <RPGWindow title="読み込み中...">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
                        </div>
                    </RPGWindow>
                ) : (
                    <RPGWindow title="ギャラリー" className="mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {images.map(image => (
                                <RPGImageCard
                                    key={image.id}
                                    image={image}
                                    onClick={handleImageClick}
                                />
                            ))}
                        </div>
                    </RPGWindow>
                )}
            </div>

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
