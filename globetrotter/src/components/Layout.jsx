import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    MdDashboard,
    MdCardTravel,
    MdAddCircle,
    MdSearch,
    MdPerson,
    MdLogout,
    MdMenu,
    MdClose
} from 'react-icons/md';
import { FaGlobeAmericas } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = user.role === 'ADMIN' ? [
        { path: '/dashboard/admin', icon: MdDashboard, label: 'Admin Dashboard', gradient: 'from-blue-600 to-indigo-600' },
        // { path: '/admin/users', icon: MdPerson, label: 'Manage Users', gradient: 'from-purple-600 to-pink-600' }, // Future
    ] : [
        { path: '/', icon: MdDashboard, label: t('dashboard'), gradient: 'from-blue-500 to-blue-600' },
        { path: '/my-trips', icon: MdCardTravel, label: t('myTrips'), gradient: 'from-purple-500 to-purple-600' },
        { path: '/create-trip', icon: MdAddCircle, label: t('newTrip'), gradient: 'from-green-500 to-green-600' },
        { path: '/search', icon: MdSearch, label: t('explore'), gradient: 'from-orange-500 to-orange-600' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#363636',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-72 md:fixed md:inset-y-0 z-30">
                <div className="flex flex-col flex-grow bg-white shadow-2xl border-r border-gray-100">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <FaGlobeAmericas className="text-white text-4xl transform group-hover:rotate-12 transition-transform duration-300" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">
                                GlobeTrotter
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg shadow-blue-200'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={`text-2xl ${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                                    <span className="font-semibold">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-700 hover:bg-white rounded-xl transition-all group"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                {user.name ? user.name.charAt(0).toUpperCase() : <MdPerson className="text-xl" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                                    {user.name || t('profile')}
                                </p>
                                <p className="text-xs text-gray-500">{user.email || 'View Profile'}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold"
                        >
                            <MdLogout className="text-xl" />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
                <div className="flex items-center justify-between h-16 px-4">
                    <Link to="/" className="flex items-center gap-2">
                        <FaGlobeAmericas className="text-blue-600 text-2xl" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            GlobeTrotter
                        </span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <MdClose className="text-2xl text-gray-700" />
                        ) : (
                            <MdMenu className="text-2xl text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl transform transition-transform duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between h-16 px-4 border-b">
                                <span className="font-bold text-gray-800">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)}>
                                    <MdClose className="text-2xl text-gray-600" />
                                </button>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="text-xl" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-3 border-t">
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-700 hover:bg-gray-50 rounded-xl"
                                >
                                    <MdPerson className="text-xl" />
                                    <span className="font-medium">{user.name || t('profile')}</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-medium"
                                >
                                    <MdLogout className="text-xl" />
                                    <span>{t('logout')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="md:ml-72 min-h-screen pt-20 md:pt-0">
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;