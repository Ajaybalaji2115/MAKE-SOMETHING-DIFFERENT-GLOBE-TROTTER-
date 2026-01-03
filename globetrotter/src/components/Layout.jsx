import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Map, Calendar, LogOut, User as UserIcon, PlusCircle, Search } from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: Map, label: 'Dashboard' },
        { path: '/my-trips', icon: Calendar, label: 'My Trips' },
        { path: '/create-trip', icon: PlusCircle, label: 'New Trip' },
        { path: '/search', icon: Search, label: 'Explore' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar / Navbar */}
            <aside className="bg-white shadow-lg w-full md:w-64 md:h-screen md:fixed flex flex-col z-20">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between md:block">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Map className="text-blue-600" />
                        GlobeTrotter
                    </Link>
                    {/* Mobile Menu Toggle could go here */}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto hidden md:block">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 hidden md:block">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl mb-2">
                        <UserIcon size={20} />
                        <span className="font-medium">{user.name || 'Profile'}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
