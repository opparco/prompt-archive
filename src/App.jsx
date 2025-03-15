import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { MetadataProvider } from './context/MetadataContext';
import Layout from './components/Layout';
import RPGImageGallery from './pages/RPGImageGallery';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ErrorPage from './components/ErrorPage';
import Loader from './components/Loader';

function App() {
  // createBrowserRouterを使ってルートを定義
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="/gallery" replace />,
        },
        {
          path: "gallery",
          element: <RPGImageGallery />,
          // ここでは例としてローダーを使用しています（実際の実装では必要に応じて調整）
          loader: async () => {
            // 将来的にAPIからデータを取得する場合に備えてloaderを設定
            return { status: "success" };
          },
        },
        {
          path: "analytics",
          element: <Analytics />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "*",
          element: <ErrorPage />,
        },
      ],
    },
  ]);

  return (
    <MetadataProvider>
      <RouterProvider router={router} fallbackElement={<Loader />} />
    </MetadataProvider>
  );
}

export default App;
