import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Link2, Menu, X, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter">
                Link<span className="text-primary">Snip</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-bold border-b-2 transition-colors ${
                      location.pathname === link.path
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-gray-900">{user?.name}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{user?.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut size={22} />
                  </button>
                </div>
                
                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none"
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 px-3 py-2">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary !py-2 !px-5 text-sm shadow-lg shadow-primary/20">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && isAuthenticated && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  location.pathname === link.path
                    ? 'bg-primary/5 text-primary'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <link.icon size={20} />
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
               <div className="px-4 py-3 bg-gray-50 rounded-2xl mb-4">
                  <p className="text-sm font-black text-gray-900">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500">{user?.email}</p>
               </div>
               <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-bold text-danger hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
