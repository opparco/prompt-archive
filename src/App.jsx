import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RPGImageGallery from './pages/RPGImageGallery';
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
        },
        {
          path: "*",
          element: <ErrorPage />,
        },
      ],
    },
  ]);

  return (
    <RouterProvider router={router} fallbackElement={<Loader />} />
  );
}

export default App;
