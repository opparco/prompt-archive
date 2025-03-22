import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import RPGWindow from '../components/RPGWindow';
import RPGButton from '../components/RPGButton';

const ErrorPage = () => {
  const error = useRouteError();
  
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center p-4 font-mono">
      <RPGWindow title="おおっと" className="max-w-lg w-full">
        <div className="text-center">
          <div className="mb-6">
            <p className="text-gray-800 mb-2">何か災いが訪れました</p>
            <div className="bg-gray-200 border border-gray-400 rounded p-3">
              <p className="text-gray-700 text-sm font-mono">
                {error?.statusText || error?.message || "不明なエラー"}
              </p>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <Link to="/">
              <RPGButton>
                ホームに戻る
              </RPGButton>
            </Link>
            <RPGButton onClick={() => window.location.reload()}>
              再読み込み
            </RPGButton>
          </div>
        </div>
      </RPGWindow>
    </div>
  );
};

export default ErrorPage; 