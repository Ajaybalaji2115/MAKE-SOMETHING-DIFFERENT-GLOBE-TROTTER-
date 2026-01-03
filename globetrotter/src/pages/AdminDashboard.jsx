import React from 'react';
import { BarChart as BarChartIcon, Users, Map, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const data = [
    { name: 'Jan', trips: 4 },
    { name: 'Feb', trips: 3 },
    { name: 'Mar', trips: 2 },
    { name: 'Apr', trips: 7 },
    { name: 'May', trips: 5 },
    { name: 'Jun', trips: 10 },
];

const AdminDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">1,234</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-full">
                        <Map size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Trips Planned</p>
                        <h3 className="text-2xl font-bold text-gray-900">856</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Active Sessions</p>
                        <h3 className="text-2xl font-bold text-gray-900">42</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <BarChartIcon size={20} /> Monthly Trip Creation
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
