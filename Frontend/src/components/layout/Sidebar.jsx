import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'technician'] },
    { name: 'Equipment', href: '/equipment', icon: Package, roles: ['admin', 'manager', 'technician'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Requests', href: '/requests', icon: ClipboardList, roles: ['admin', 'manager', 'technician'] },
    { name: 'Calendar', href: '/calendar', icon: Calendar, roles: ['admin', 'manager', 'technician'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-secondary-200 z-50
          transform transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-secondary-600 hover:text-secondary-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Logo section for mobile */}
        <div className="lg:hidden p-6 border-b border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm p-0">
              <img
                src="/logo.jpg"
                alt="GearGuard logo"
                className="w-10 h-10 object-contain rounded-lg shadow-md"
              />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-secondary-900">
                GearGuard
              </h1>
              <p className="text-xs text-secondary-500">Maintenance Tracker</p>
            </div>
          </div>
        </div>

        {/* Logo section for desktop */}
        <div className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center p-4' : 'p-6 gap-3'} border-b border-secondary-200 transition-all duration-300`}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm p-0">
            <img
              src="/logo.jpg"
              alt="GearGuard logo"
              className="w-10 h-10 object-contain rounded-lg shadow-md"
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-xl font-display font-bold text-secondary-900">
                GearGuard
              </h1>
              <p className="text-xs text-secondary-500">Maintenance Tracker</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 mt-16 lg:mt-4">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-700 hover:bg-secondary-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
                `
              }
              title={isCollapsed ? item.name : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Button (Desktop Only) */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 bg-white border border-secondary-200 rounded-full p-1 text-secondary-500 hover:text-secondary-900 shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Bottom section */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-900 mb-1">
                Need Help?
              </p>
              <p className="text-xs text-primary-700 mb-3">
                Check our documentation and guides
              </p>
              <button className="w-full px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
                View Docs
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
