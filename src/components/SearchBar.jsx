import React, { useState, useEffect, useRef } from 'react';
import { useMetadata } from '../context/MetadataContext';
import { parseMetadataString } from '../services/metadataService';

const SearchBar = () => {
  const { searchTerm, setSearchTerm, images } = useMetadata();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchField, setSearchField] = useState('all');
  const inputRef = useRef(null);

  // 検索履歴の読み込み
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // 検索履歴の保存
  const saveSearch = (term) => {
    if (!term.trim()) return;
    
    const updatedSearches = [
      term, 
      ...recentSearches.filter(s => s !== term)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // 検索候補の生成
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const getSuggestions = () => {
      const uniqueValues = new Set();
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      // メタデータから検索フィールドに基づいて候補を生成
      images.forEach(image => {
        const metadata = parseMetadataString(image.metadata);
        
        if (searchField === 'all') {
          // すべてのフィールドから候補を探す
          Object.values(metadata).forEach(value => {
            if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) {
              uniqueValues.add(value);
            }
          });
        } else if (searchField === 'prompt') {
          // プロンプトのみから候補を探す
          const prompt = metadata.Prompt || '';
          if (prompt.toLowerCase().includes(lowerSearchTerm)) {
            prompt.split(',').forEach(part => {
              const trimmed = part.trim();
              if (trimmed.toLowerCase().includes(lowerSearchTerm)) {
                uniqueValues.add(trimmed);
              }
            });
          }
        } else if (searchField === 'negativePrompt') {
          // ネガティブプロンプトから候補を探す
          const negPrompt = metadata['Negative prompt'] || '';
          if (negPrompt.toLowerCase().includes(lowerSearchTerm)) {
            negPrompt.split(',').forEach(part => {
              const trimmed = part.trim();
              if (trimmed.toLowerCase().includes(lowerSearchTerm)) {
                uniqueValues.add(trimmed);
              }
            });
          }
        } else if (metadata[searchField] && 
                   metadata[searchField].toLowerCase().includes(lowerSearchTerm)) {
          // 特定のフィールドから候補を探す
          uniqueValues.add(metadata[searchField]);
        }
      });
      
      // 最大10件の候補を返す
      return Array.from(uniqueValues)
        .filter(v => v.toLowerCase() !== lowerSearchTerm)
        .slice(0, 10);
    };
    
    setSuggestions(getSuggestions());
  }, [searchTerm, searchField, images]);

  // 検索実行
  const handleSearch = (e) => {
    e.preventDefault();
    saveSearch(searchTerm);
    setIsSuggestionsOpen(false);
  };

  // フォーカス時にサジェスト表示
  const handleFocus = () => {
    if (searchTerm.trim().length >= 2) {
      setIsSuggestionsOpen(true);
    }
  };

  // 検索候補クリック
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    saveSearch(suggestion);
    setIsSuggestionsOpen(false);
    inputRef.current?.blur();
  };

  // 検索履歴クリック
  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    setIsSuggestionsOpen(false);
  };

  // 検索オプションの選択肢
  const searchOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'prompt', label: 'プロンプト' },
    { value: 'negativePrompt', label: 'ネガティブプロンプト' },
    { value: 'Model', label: 'モデル' },
    { value: 'Sampler', label: 'サンプラー' },
    { value: 'Steps', label: 'ステップ数' },
    { value: 'CFG scale', label: 'CFG値' },
    { value: 'Size', label: 'サイズ' }
  ];

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          {/* 検索フィールド選択 */}
          <div className="relative">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="h-full rounded-l-lg border-r-0 border border-gray-300 bg-gray-50 py-2 pl-3 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500"
            >
              {searchOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 検索入力フィールド */}
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              className="block w-full rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="検索ワードを入力..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  setIsSuggestionsOpen(true);
                } else {
                  setIsSuggestionsOpen(false);
                }
              }}
              onFocus={handleFocus}
              onBlur={() => {
                // すぐに閉じると候補クリックできないので遅延
                setTimeout(() => setIsSuggestionsOpen(false), 200);
              }}
            />
            
            {/* クリアボタン */}
            {searchTerm && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* 検索候補と最近の検索 */}
        {isSuggestionsOpen && (searchTerm.trim().length >= 2 || recentSearches.length > 0) && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <div className="py-1">
              {/* 検索候補 */}
              {suggestions.length > 0 && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-gray-500">候補</h3>
                  <div className="mt-1 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="cursor-pointer rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 検索履歴 */}
              {recentSearches.length > 0 && (
                <div className="border-t border-gray-100 px-3 py-2">
                  <h3 className="text-xs font-medium text-gray-500">最近の検索</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <div
                        key={index}
                        className="inline-flex cursor-pointer items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {term}
                      </div>
                    ))}
                    <div
                      className="inline-flex cursor-pointer items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('recentSearches');
                      }}
                    >
                      <svg className="mr-1 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      履歴をクリア
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
      
      {/* 詳細検索オプションのトグル */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <svg
            className={`mr-1 h-4 w-4 transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          詳細検索オプション
        </button>
      </div>
      
      {/* 詳細検索オプション */}
      {isAdvancedOpen && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-medium mb-2">検索構文</div>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-semibold">AND検索:</span> キーワード1 AND キーワード2（両方を含む）</p>
            <p><span className="font-semibold">OR検索:</span> キーワード1 OR キーワード2（どちらかを含む）</p>
            <p><span className="font-semibold">除外:</span> -キーワード（このキーワードを含まない）</p>
            <p><span className="font-semibold">フレーズ検索:</span> "正確なフレーズ"（引用符内の正確な文字列）</p>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium mb-1">よく使われるキーワード</div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} stable_diffusion` : 'stable_diffusion')}
                >
                  stable_diffusion
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} portrait` : 'portrait')}
                >
                  portrait
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} landscape` : 'landscape')}
                >
                  landscape
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} "high quality"` : '"high quality"')}
                >
                  high quality
                </button>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">サンプラー</div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} "Euler a"` : '"Euler a"')}
                >
                  Euler a
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} "DPM++ 2M"` : '"DPM++ 2M"')}
                >
                  DPM++ 2M
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                  onClick={() => setSearchTerm(searchTerm ? `${searchTerm} DDIM` : 'DDIM')}
                >
                  DDIM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
