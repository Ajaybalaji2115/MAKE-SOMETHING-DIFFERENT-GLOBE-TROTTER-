import React, { useEffect, useState } from 'react';
import { BarChart as BarChartIcon, Users, Map, Activity, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState({ totalUsers: 0, totalTrips: 0, activeSessions: 0 });
    const [popularDestinations, setPopularDestinations] = useState([]);
    const [popularActivities, setPopularActivities] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, destRes, actRes, usersRes] = await Promise.all([
                api.get('/admin/stats').catch(e => ({ data: { totalUsers: 0, totalTrips: 0, activeSessions: 0 } })),
                api.get('/admin/popular-destinations').catch(e => ({ data: [] })),
                api.get('/admin/popular-activities').catch(e => ({ data: [] })),
                api.get('/admin/users').catch(e => ({ data: [] }))
            ]);

            setStats(statsRes.data || { totalUsers: 0, totalTrips: 0, activeSessions: 0 });
            setPopularDestinations(destRes.data || []);
            setPopularActivities(actRes.data || []);
            setUsers(usersRes.data || []);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            setError('Failed to load dashboard data. Please check your connection or try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const handleStatusChange = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;

        try {
            await api.put(`/admin/users/${userId}/status`, null, {
                params: { enabled: !currentStatus }
            });
            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, enabled: !currentStatus } : u));
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status. ' + (error.response?.data?.message || ''));
        }
    };

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN';
        if (!window.confirm(`Are you sure you want to change user role to ${newRole}?`)) return;

        try {
            await api.put(`/admin/users/${userId}/role`, null, {
                params: { role: newRole }
            });
            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update role', error);
            alert('Failed to update role. ' + (error.response?.data?.message || ''));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Shield className="text-blue-600 h-8 w-8" />
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                            <Map size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Trips Planned</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.totalTrips}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                            <Activity size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Active Sessions</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.activeSessions}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Popular Destinations Chart */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                            <BarChartIcon className="text-blue-600" />
                            Popular Destinations
                        </h3>
                        <div className="h-80">
                            {popularDestinations.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={popularDestinations}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="trips" radius={[4, 4, 0, 0]} barSize={40}>
                                            {popularDestinations.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 30}, 80%, 60%)`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No destination data available yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Activities Chart */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                            <Activity className="text-purple-600" />
                            Popular Activities
                        </h3>
                        <div className="h-80">
                            {popularActivities.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={popularActivities} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                            {popularActivities.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(${280 + index * 30}, 70%, 60%)`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No activity data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User List Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <Users className="text-purple-600" />
                            Registered Users
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 font-mono text-sm">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${user.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full w-fit ${user.enabled
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                {user.enabled ? 'Active' : 'Pending/Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(user.id, user.enabled)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${user.enabled
                                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {user.enabled ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    Make {user.role === 'ADMIN' ? 'Client' : 'Admin'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
