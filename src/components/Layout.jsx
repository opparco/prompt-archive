import React from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import Navbar from './Navbar';
import Loader from './Loader';

const Layout = () => {
  const navigation = useNavigation();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {navigation.state === "loading" ? <Loader /> : <Outlet />}
      </main>
      <footer className="bg-white py-4 text-center text-gray-500 text-sm border-t">
        <p>PromptArchive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
