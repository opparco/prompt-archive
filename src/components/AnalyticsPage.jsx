import React, { useState, useEffect, useMemo } from 'react';
import { useMetadata } from '../context/MetadataContext';
import { parseMetadataString } from '../services/metadataService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';

const COLORS = [
  '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', 
  '#1abc9c', '#f1c40f', '#e67e22', '#34495e', '#16a085',
  '#d35400', '#8e44ad', '#27ae60', '#2980b9', '#c0392b'
];

const AnalyticsPage = () => {
  const { images } = useMetadata();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');
  
  // メタデータを解析して統計データを生成
  const stats = useMemo(() => {
    if (!images.length) return null;
    
    // 集計用のオブジェクト
    const counts = {
      models: {},
      samplers: {},
      sizes: {},
      cfgValues: [],
      stepCounts: [],
      promptWords: {},
      negativePromptWords: {},
      resolutions: {},
      timeStats: {},
      loraUsage: {},
    };
    
    images.forEach(image => {
      const metadata = parseMetadataString(image.metadata);
      
      // モデル集計
      if (metadata.Model) {
        counts.models[metadata.Model] = (counts.models[metadata.Model] || 0) + 1;
      }
      
      // サンプラー集計
      if (metadata.Sampler) {
        counts.samplers[metadata.Sampler] = (counts.samplers[metadata.Sampler] || 0) + 1;
      }
      
      // サイズ集計
      if (metadata.Size) {
        counts.sizes[metadata.Size] = (counts.sizes[metadata.Size] || 0) + 1;
        
        // 解像度も分析（幅×高さのピクセル数）
        const [width, height] = metadata.Size.split('x').map(Number);
        if (width && height) {
          const resolution = width * height;
          const resolutionCategory = 
            resolution < 500000 ? 'Low (<0.5MP)' :
            resolution < 1000000 ? 'Medium (0.5-1MP)' :
            resolution < 2000000 ? 'High (1-2MP)' :
            'Ultra High (>2MP)';
          
          counts.resolutions[resolutionCategory] = (counts.resolutions[resolutionCategory] || 0) + 1;
        }
      }
      
      // CFG値の集計
      if (metadata['CFG scale']) {
        const cfgValue = parseFloat(metadata['CFG scale']);
        if (!isNaN(cfgValue)) {
          counts.cfgValues.push(cfgValue);
        }
      }
      
      // ステップ数の集計
      if (metadata.Steps) {
        const steps = parseInt(metadata.Steps);
        if (!isNaN(steps)) {
          counts.stepCounts.push(steps);
        }
      }
      
      // プロンプト単語の集計
      if (metadata.Prompt) {
        const words = metadata.Prompt
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        words.forEach(word => {
          counts.promptWords[word] = (counts.promptWords[word] || 0) + 1;
        });
      }
      
      // ネガティブプロンプト単語の集計
      if (metadata['Negative prompt']) {
        const words = metadata['Negative prompt']
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        words.forEach(word => {
          counts.negativePromptWords[word] = (counts.negativePromptWords[word] || 0) + 1;
        });
      }
      
      // LoRA使用状況の集計
      if (metadata.Prompt) {
        const loraMatches = metadata.Prompt.match(/<lora:([\w\-_]+)(?::([0-9.]+))?>/g) || [];
        loraMatches.forEach(match => {
          const loraName = match.match(/<lora:([\w\-_]+)/)[1];
          counts.loraUsage[loraName] = (counts.loraUsage[loraName] || 0) + 1;
        });
      }
    });
    
    // グラフデータに変換
    const models = Object.entries(counts.models)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    const samplers = Object.entries(counts.samplers)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    const sizes = Object.entries(counts.sizes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    const resolutions = Object.entries(counts.resolutions)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const order = ['Low (<0.5MP)', 'Medium (0.5-1MP)', 'High (1-2MP)', 'Ultra High (>2MP)'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
    
    // CFG値のヒストグラム
    const cfgHistogram = {};
    counts.cfgValues.forEach(value => {
      const rounded = Math.floor(value);
      cfgHistogram[rounded] = (cfgHistogram[rounded] || 0) + 1;
    });
    
    const cfgStats = Object.entries(cfgHistogram)
      .map(([value, count]) => ({ value: parseInt(value), count }))
      .sort((a, b) => a.value - b.value);
    
    // ステップ数のヒストグラム
    const stepHistogram = {};
    counts.stepCounts.forEach(steps => {
      const roundedSteps = Math.floor(steps / 5) * 5; // 5ステップごとにグループ化
      stepHistogram[roundedSteps] = (stepHistogram[roundedSteps] || 0) + 1;
    });
    
    const stepStats = Object.entries(stepHistogram)
      .map(([steps, count]) => ({ steps: parseInt(steps), count }))
      .sort((a, b) => a.steps - b.steps);
    
    // プロンプト単語の上位
    const promptWordStats = Object.entries(counts.promptWords)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    // ネガティブプロンプト単語の上位
    const negativePromptWordStats = Object.entries(counts.negativePromptWords)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    // LoRA使用状況
    const loraUsageStats = Object.entries(counts.loraUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // 基本統計情報
    const basicStats = {
      totalImages: images.length,
      uniqueModels: Object.keys(counts.models).length,
      uniqueSamplers: Object.keys(counts.samplers).length,
      uniqueSizes: Object.keys(counts.sizes).length,
      avgCfgScale: counts.cfgValues.length 
        ? (counts.cfgValues.reduce((sum, val) => sum + val, 0) / counts.cfgValues.length).toFixed(1)
        : 'N/A',
      avgSteps: counts.stepCounts.length
        ? Math.round(counts.stepCounts.reduce((sum, val) => sum + val, 0) / counts.stepCounts.length)
        : 'N/A',
      loraUsage: Object.keys(counts.loraUsage).length,
    };
    
    return {
      models,
      samplers,
      sizes,
      resolutions,
      cfgStats,
      stepStats,
      promptWordStats,
      negativePromptWordStats,
      loraUsageStats,
      basicStats
    };
  }, [images]);
  
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
        <p className="text-gray-500">データが読み込まれていません</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* タブナビゲーション */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            概要
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'models' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('models')}
          >
            モデルとサンプラー
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'parameters' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('parameters')}
          >
            生成パラメータ
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'prompts' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('prompts')}
          >
            プロンプト分析
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'lora' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('lora')}
          >
            LoRA使用状況
          </button>
        </nav>
      </div>
      
      {/* コンテンツエリア */}
      <div className="p-6">
        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">コレクション概要</h2>
            
            {/* 基本統計情報カード */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600">総画像数</p>
                <p className="text-3xl font-bold text-blue-800">{stats.basicStats.totalImages}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600">モデル種類</p>
                <p className="text-3xl font-bold text-green-800">{stats.basicStats.uniqueModels}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-yellow-600">平均CFG</p>
                <p className="text-3xl font-bold text-yellow-800">{stats.basicStats.avgCfgScale}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-purple-600">平均ステップ数</p>
                <p className="text-3xl font-bold text-purple-800">{stats.basicStats.avgSteps}</p>
              </div>
            </div>
            
            {/* モデル分布とサイズ分布 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">トップモデル</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.models.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3498db" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">解像度分布</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.resolutions}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.resolutions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* CFGとステップ分布 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">CFG値分布</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.cfgStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="value" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f39c12" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">ステップ数分布</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.stepStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="steps" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9b59b6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* モデルとサンプラータブ */}
        {activeTab === 'models' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">モデルとサンプラー分析</h2>
            
            {/* モデル分布 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">モデル分布</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.models} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={180} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* サンプラー分布 */}
            <div>
              <h3 className="text-lg font-medium mb-4">サンプラー分布</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.samplers}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.samplers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.samplers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2ecc71" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* パラメータタブ */}
        {activeTab === 'parameters' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">生成パラメータ分析</h2>
            
            {/* CFG値とステップ数の詳細 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">CFG値分布</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.cfgStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="value" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" fill="#f39c12" stroke="#e67e22" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">ステップ数分布</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.stepStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="steps" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" fill="#9b59b6" stroke="#8e44ad" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* サイズ分布 */}
            <div>
              <h3 className="text-lg font-medium mb-4">サイズ分布</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.sizes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1abc9c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.resolutions}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.resolutions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* プロンプトタブ */}
        {activeTab === 'prompts' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">プロンプト分析</h2>
            
            {/* ポジティブプロンプト単語 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">頻出ポジティブプロンプト単語</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.promptWordStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="word" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* ネガティブプロンプト単語 */}
            <div>
              <h3 className="text-lg font-medium mb-4">頻出ネガティブプロンプト単語</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.negativePromptWordStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="word" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#e74c3c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* LoRAタブ */}
        {activeTab === 'lora' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">LoRA使用状況分析</h2>
            
            {stats.loraUsageStats.length > 0 ? (
              <div>
                <div className="h-96 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.loraUsageStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={180} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#9b59b6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.loraUsageStats.map(lora => (
                    <div key={lora.name} className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-purple-800">{lora.name}</h4>
                        <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          {lora.count} 画像
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-purple-200 rounded-full h-2.5">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${(lora.count / stats.basicStats.totalImages * 100).toFixed(1)}%` }} 
                          />
                        </div>
                        <p className="text-xs text-right mt-1 text-purple-600">
                          {(lora.count / stats.basicStats.totalImages * 100).toFixed(1)}% の画像で使用
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">LoRA使用データが見つかりませんでした</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
