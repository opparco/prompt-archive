import React from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import RPGNavbar from './RPGNavbar';
import Loader from './Loader';

const Layout = () => {
  const navigation = useNavigation();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto">
        {navigation.state === "loading" ? <Loader /> : <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
