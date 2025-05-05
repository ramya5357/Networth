import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, PlusCircle, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:relative`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className="text-xl font-bold">CrediKhaata</div>
        <button
          className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 md:hidden"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="px-2 py-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                } transition-colors duration-200`
              }
              onClick={onClose}
            >
              <Home size={20} className="mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customers/add"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                } transition-colors duration-200`
              }
              onClick={onClose}
            >
              <PlusCircle size={20} className="mr-3" />
              Add Customer
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;