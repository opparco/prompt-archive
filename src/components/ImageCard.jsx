import React, { useState, useEffect } from 'react';
import { useMetadata } from '../context/MetadataContext';
import { parseMetadataString } from '../services/metadataService';

const ImageCard = ({ image, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // メタデータをパース
  const metadata = parseMetadataString(image.metadata);
  
  // 重要な情報を抽出
  const prompt = metadata.Prompt || 'No prompt available';
  const model = metadata.Model || 'Unknown model';
  const sampler = metadata.Sampler || '';
  const steps = metadata.Steps || '';
  const cfgScale = metadata['CFG scale'] || '';
  const size = metadata.Size || '';
  const seed = metadata.Seed || '';
  
  // 画像のアスペクト比を計算
  useEffect(() => {
    if (size) {
      const [width, height] = size.split('x').map(Number);
      if (width && height) {
        setAspectRatio(width / height);
      }
    }
  }, [size]);
  
  // 画像パスを生成（実際の環境に合わせて調整）
  const imageSrc = `/images${image.imagePath}`;
  
  // 画像サムネイルをクリックした時の処理
  const handleCardClick = (e) => {
    // 「詳細を表示」ボタンのクリックは伝播させない
    if (e.target.closest('.expand-button')) {
      return;
    }
    
    if (onClick) {
      onClick(image);
    }
  };
  
  // 詳細表示ボタンのトグル
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  // プロンプトを短く表示するヘルパー関数
  const truncatePrompt = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // プロンプトからLoRAを検出
  const extractLoras = (promptText) => {
    if (!promptText) return [];
    
    const loraMatches = promptText.match(/<lora:([\w\-_]+)(?::([0-9.]+))?>/g) || [];
    return loraMatches.map(match => {
      const nameMatch = match.match(/<lora:([\w\-_]+)/);
      const name = nameMatch ? nameMatch[1] : '';
      return name;
    });
  };
  
  const loras = extractLoras(prompt);
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* 画像読み込み中のプレースホルダー */}
        {!isImageLoaded && !imageError && (
          <div 
            className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
            style={{ aspectRatio: aspectRatio || '1 / 1' }}
          >
            <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* 画像 */}
        <img 
          src={imageSrc} 
          alt={truncatePrompt(prompt, 30)}
          className={`w-full h-64 object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ aspectRatio: aspectRatio || '1 / 1' }}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            setIsImageLoaded(true);
            e.target.src = '/placeholder-image.webp';
          }}
        />
        
        {/* 解像度バッジ - 右上 */}
        {size && (
          <div className="absolute top-2 right-2 bg-black/60 rounded text-white text-xs px-2 py-1">
            {size}
          </div>
        )}
        
        {/* LoRAバッジ - 左上 */}
        {loras.length > 0 && (
          <div className="absolute top-2 left-2 bg-purple-600/80 rounded text-white text-xs px-2 py-1">
            LoRA: {loras.length}
          </div>
        )}
        
        {/* ホバー時の情報オーバーレイ */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}
        >
          <h3 className="text-white font-medium line-clamp-2 text-sm">{truncatePrompt(prompt, 100)}</h3>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1 text-xs">
            <span className="inline-block px-2 py-1 leading-none bg-blue-100 text-blue-800 rounded-full font-semibold uppercase tracking-wide text-xs">
              {model.split('_')[0]}
            </span>
            
            {sampler && (
              <span className="inline-block px-2 py-1 leading-none bg-green-100 text-green-800 rounded-full font-semibold uppercase tracking-wide text-xs">
                {sampler.split(' ')[0]}
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            ID: {image.id}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {steps && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              Steps: {steps}
            </div>
          )}
          
          {cfgScale && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              CFG: {cfgScale}
            </div>
          )}
          
          {seed && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[100px]" title={seed}>
              Seed: {seed.substring(0, 8)}...
            </div>
          )}
        </div>
        
        <button 
          className="expand-button text-blue-600 hover:text-blue-800 text-xs flex items-center"
          onClick={toggleExpand}
        >
          <svg 
            className={`mr-1 h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {isExpanded ? '詳細を隠す' : '詳細を表示'}
        </button>
        
        {isExpanded && (
          <div className="mt-3 text-sm bg-gray-50 p-3 rounded">
            <div className="mb-2">
              <div className="font-medium text-gray-700 mb-1">プロンプト:</div>
              <div className="text-gray-800 text-xs bg-white p-2 rounded border border-gray-100 max-h-40 overflow-y-auto">
                {prompt}
              </div>
            </div>
            
            {metadata['Negative prompt'] && (
              <div className="mb-2">
                <div className="font-medium text-gray-700 mb-1">ネガティブプロンプト:</div>
                <div className="text-gray-800 text-xs bg-white p-2 rounded border border-gray-100 max-h-40 overflow-y-auto">
                  {metadata['Negative prompt']}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetadataItem label="モデル" value={model} />
              <MetadataItem label="サンプラー" value={sampler} />
              <MetadataItem label="ステップ数" value={steps} />
              <MetadataItem label="CFG値" value={cfgScale} />
              <MetadataItem label="シード値" value={seed} />
              <MetadataItem label="サイズ" value={size} />
              
              {/* モデルハッシュがあれば表示 */}
              {metadata['Model hash'] && (
                <div className="col-span-2">
                  <MetadataItem label="モデルハッシュ" value={metadata['Model hash']} />
                </div>
              )}
              
              {/* LoRAがあれば表示 */}
              {loras.length > 0 && (
                <div className="col-span-2">
                  <div className="font-medium text-gray-700">LoRA:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {loras.map((lora, index) => (
                      <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {lora}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// メタデータ項目表示用ヘルパーコンポーネント
const MetadataItem = ({ label, value }) => {
  if (!value) return null;
  
  return (
    <div>
      <div className="font-medium text-gray-700">{label}:</div>
      <div className="text-gray-800 truncate" title={value}>
        {value}
      </div>
    </div>
  );
};

export default ImageCard;
