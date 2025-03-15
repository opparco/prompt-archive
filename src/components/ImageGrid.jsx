import React, { useState, useEffect, useRef } from 'react';
import { useMetadata } from '../context/MetadataContext';
import ImageCard from './ImageCard';
import { parseMetadataString } from '../services/metadataService';

const ImageGrid = ({ onImageClick }) => {
  const { filteredImages, isLoading, error } = useMetadata();
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [columnCount, setColumnCount] = useState(4);
  const [sortedImages, setSortedImages] = useState([]);
  const [visibleImages, setVisibleImages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef(null);
  const imagesPerPage = 20;

  // レスポンシブなグリッドのカラム数調整
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumnCount(1);
      } else if (width < 768) {
        setColumnCount(2);
      } else if (width < 1024) {
        setColumnCount(3);
      } else {
        setColumnCount(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 画像のソート
  useEffect(() => {
    if (!filteredImages || filteredImages.length === 0) {
      setSortedImages([]);
      return;
    }

    const sorted = [...filteredImages];

    switch (sortOption) {
      case 'newest':
        // 画像IDで降順ソート（IDが大きいほど新しいと仮定）
        sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'oldest':
        // 画像IDで昇順ソート
        sorted.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
      case 'model':
        // モデル名でソート
        sorted.sort((a, b) => {
          const modelA = parseMetadataString(a.metadata).Model || '';
          const modelB = parseMetadataString(b.metadata).Model || '';
          return modelA.localeCompare(modelB);
        });
        break;
      case 'steps':
        // ステップ数でソート（降順）
        sorted.sort((a, b) => {
          const stepsA = parseInt(parseMetadataString(a.metadata).Steps || '0');
          const stepsB = parseInt(parseMetadataString(b.metadata).Steps || '0');
          return stepsB - stepsA;
        });
        break;
      case 'cfgScale':
        // CFG値でソート（降順）
        sorted.sort((a, b) => {
          const cfgA = parseFloat(parseMetadataString(a.metadata)['CFG scale'] || '0');
          const cfgB = parseFloat(parseMetadataString(b.metadata)['CFG scale'] || '0');
          return cfgB - cfgA;
        });
        break;
      case 'resolution':
        // 解像度でソート（高い順）
        sorted.sort((a, b) => {
          const sizeA = parseMetadataString(a.metadata).Size || '';
          const sizeB = parseMetadataString(b.metadata).Size || '';
          
          const [widthA, heightA] = sizeA.split('x').map(Number);
          const [widthB, heightB] = sizeB.split('x').map(Number);
          
          const resolutionA = (widthA && heightA) ? widthA * heightA : 0;
          const resolutionB = (widthB && heightB) ? widthB * heightB : 0;
          
          return resolutionB - resolutionA;
        });
        break;
      default:
        // デフォルトは新しい順
        sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    setSortedImages(sorted);
    setPage(1);
    setVisibleImages(sorted.slice(0, imagesPerPage));
    setHasMore(sorted.length > imagesPerPage);
  }, [filteredImages, sortOption]);

  // 無限スクロール用のIntersection Observer
  useEffect(() => {
    // 要素がない、または表示するものがなければ終了
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(entries => {
      // ローディング要素が画面に入ったらロード
      if (entries[0].isIntersecting && hasMore) {
        loadMoreImages();
      }
    }, { threshold: 0.1 });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, sortedImages, visibleImages]);

  // 追加画像の読み込み
  const loadMoreImages = () => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * imagesPerPage;
    const endIndex = nextPage * imagesPerPage;
    
    if (startIndex < sortedImages.length) {
      const newImages = sortedImages.slice(startIndex, endIndex);
      setVisibleImages(prev => [...prev, ...newImages]);
      setPage(nextPage);
      setHasMore(endIndex < sortedImages.length);
    } else {
      setHasMore(false);
    }
  };

  // 表示モードのトグル
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // ソートオプションの変更
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visibleImages.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">画像が見つかりませんでした</h3>
        <p className="mt-1 text-sm text-gray-500">
          検索条件に一致する画像はありません。
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* コントロールバー */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="text-gray-600">
          {filteredImages.length} 件の画像が見つかりました
          {filteredImages.length > 0 && visibleImages.length < filteredImages.length && 
            ` (${visibleImages.length}件表示中)`}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* 表示モード切り替え */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg ${
                viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => toggleViewMode('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg ${
                viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => toggleViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* ソートオプション */}
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="model">モデル名順</option>
            <option value="steps">ステップ数順</option>
            <option value="cfgScale">CFG値順</option>
            <option value="resolution">解像度順</option>
          </select>

          {/* グリッド密度 (グリッド表示時のみ) */}
          {viewMode === 'grid' && (
            <select
              value={columnCount}
              onChange={(e) => setColumnCount(Number(e.target.value))}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={2}>2列</option>
              <option value={3}>3列</option>
              <option value={4}>4列</option>
              <option value={5}>5列</option>
              <option value={6}>6列</option>
            </select>
          )}
        </div>
      </div>

      {/* 画像グリッド */}
      {viewMode === 'grid' ? (
        <div 
          className="grid gap-6" 
          style={{ 
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` 
          }}
        >
          {visibleImages.map(image => (
            <ImageCard 
              key={image.id} 
              image={image} 
              onClick={() => onImageClick && onImageClick(image)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleImages.map(image => (
            <div 
              key={image.id}
              className="flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              onClick={() => onImageClick && onImageClick(image)}
            >
              <div className="md:w-48 h-48 flex-shrink-0">
                <img 
                  src={`/images${image.imagePath}`}
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.webp';
                  }}
                />
              </div>
              <div className="p-4 flex-1">
                <ListViewDetails image={image} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 無限スクロール用ローディング要素 */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="flex justify-center items-center py-8"
        >
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

// リスト表示用の詳細コンポーネント
const ListViewDetails = ({ image }) => {
  const metadata = parseMetadataString(image.metadata);
  
  return (
    <div>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900 mb-1 truncate max-w-md">
          {metadata.Prompt ? metadata.Prompt.substring(0, 100) + (metadata.Prompt.length > 100 ? '...' : '') : 'No prompt available'}
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">ID: {image.id}</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-3 text-sm">
        {metadata.Model && (
          <div className="flex items-center">
            <span className="text-gray-500">モデル:</span>
            <span className="ml-1 font-medium truncate">{metadata.Model}</span>
          </div>
        )}
        
        {metadata.Sampler && (
          <div className="flex items-center">
            <span className="text-gray-500">サンプラー:</span>
            <span className="ml-1 font-medium">{metadata.Sampler}</span>
          </div>
        )}
        
        {metadata.Steps && (
          <div className="flex items-center">
            <span className="text-gray-500">ステップ数:</span>
            <span className="ml-1 font-medium">{metadata.Steps}</span>
          </div>
        )}
        
        {metadata['CFG scale'] && (
          <div className="flex items-center">
            <span className="text-gray-500">CFG値:</span>
            <span className="ml-1 font-medium">{metadata['CFG scale']}</span>
          </div>
        )}
        
        {metadata.Size && (
          <div className="flex items-center">
            <span className="text-gray-500">サイズ:</span>
            <span className="ml-1 font-medium">{metadata.Size}</span>
          </div>
        )}
        
        {metadata.Seed && (
          <div className="flex items-center">
            <span className="text-gray-500">シード値:</span>
            <span className="ml-1 font-medium">{metadata.Seed}</span>
          </div>
        )}
      </div>
      
      {metadata['Negative prompt'] && (
        <div className="mt-3 text-sm">
          <span className="text-gray-500">ネガティブプロンプト:</span>
          <div className="mt-1 text-gray-700 bg-gray-50 p-2 rounded text-xs">
            {metadata['Negative prompt'].substring(0, 150) + (metadata['Negative prompt'].length > 150 ? '...' : '')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGrid;
