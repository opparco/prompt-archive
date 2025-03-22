import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RPGImageGallery from './pages/RPGImageGallery';
import RPGGroupDetailPage from './pages/RPGGroupDetailPage';
import ErrorPage from './pages/ErrorPage';
import Loader from './components/Loader';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

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
          path: "group/:id",
          element: <RPGGroupDetailPage />,
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
