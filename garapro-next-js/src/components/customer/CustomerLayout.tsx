import React from 'react';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="customer-layout">
      {children}
    </div>
  );
};

export default CustomerLayout;