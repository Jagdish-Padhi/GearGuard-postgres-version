import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-secondary-600 hover:text-secondary-900 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm p-0">
                <img
                  src="/logo.jpg"
                  alt="GearGuard logo"
                  className="w-10 h-10 object-contain rounded-lg shadow-md"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-bold text-secondary-900">
                  GearGuard
                </h1>
                <p className="text-xs text-secondary-500">Maintenance Tracker</p>
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                  <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
                </div>
              </button>

              {/* Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 fade-in">
                  <div className="px-4 py-3 border-b border-secondary-200">
                    <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                    <p className="text-xs text-secondary-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-3"
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-3"
                  >
                    <Settings size={16} />
                    Settings
                  </button>

                  <div className="border-t border-secondary-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-3"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
