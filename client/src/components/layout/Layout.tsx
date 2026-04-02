import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AlertBanner } from './AlertBanner';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary flex flex-col font-sans transition-colors duration-300 overflow-x-hidden">
      <AlertBanner />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

