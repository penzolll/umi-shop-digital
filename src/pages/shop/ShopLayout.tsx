
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

interface ShopLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ 
  children, 
  title,
  className = '' 
}) => {
  return (
    <MainLayout className={className}>
      <div className="container mx-auto px-4 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </MainLayout>
  );
};

export default ShopLayout;
