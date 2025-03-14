import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
        <div className="mb-6">
          <p className="text-gray-700 mb-2">申し訳ありません、問題が発生しました。</p>
          <p className="text-gray-500 text-sm">
            {error?.statusText || error?.message || "不明なエラー"}
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ホームに戻る
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
          >
            再読み込み
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
