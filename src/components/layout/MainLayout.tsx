
import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      <main className={`pt-16 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
