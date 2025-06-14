import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/home', icon: <HomeOutlined /> },
    { name: 'Bills', path: '/Bills', icon: <FileTextOutlined /> },
    { name: 'Add Items', path: '/Items', icon: <ShoppingCartOutlined /> },
    { name: 'History', path: '/History', icon: <HistoryOutlined /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCartOutlined /> },
  { name: 'Inventory', path: '/inventory', icon: <AppstoreOutlined /> },
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg p-4 flex flex-col gap-2">
      {/* Logo Image */}
      <img
        src='	https://front-end-drab-pi.vercel.app/assets/sunset-Cul1cxVA.jpg'
        alt="Cafe Logo"
        className="w-16 h-16 object-cover rounded-full mb-2 img-fluid"
      />

      {/* Cafe Name */}
      <h2 className="text-xl font-bold mb-1">The SunSet Cafe</h2>
      <h4 className="text-sm text-gray-500 mb-4">Tea, Savoury & More</h4>

      {/* Navigation Items */}
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition hover:bg-blue-100 ${
              isActive ? 'bg-blue-200 font-semibold' : ''
            }`
          }
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 mt-auto"
      >
        <LogoutOutlined />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
