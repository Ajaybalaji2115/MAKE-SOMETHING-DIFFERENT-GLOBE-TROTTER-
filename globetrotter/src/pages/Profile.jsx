import React, { useEffect, useState } from 'react';
import { User, LogOut, Trash2 } from 'lucide-react';
import api from '../lib/axios';

const Profile = () => {
    const [user, setUser] = useState({});

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">User Profile</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={40} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h2>
                        <p className="text-gray-500">{user.email || 'No email'}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                            {user.role || 'CLIENT'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => alert("Edit Profile Coming Soon")}
                        className="w-full py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Edit Profile Details
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                    <button className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
