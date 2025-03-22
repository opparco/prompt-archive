import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RPGImageGallery from './pages/RPGImageGallery';
import ErrorPage from './components/ErrorPage';
import Loader from './components/Loader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// クライアントの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 24 * 3600 * 1000,
      cacheTime: 48 * 3600 * 1000,
    },
  },
});

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
        },
        {
          path: "*",
          element: <ErrorPage />,
        },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} fallbackElement={<Loader />} />
    </QueryClientProvider>
  );
}

export default App;
