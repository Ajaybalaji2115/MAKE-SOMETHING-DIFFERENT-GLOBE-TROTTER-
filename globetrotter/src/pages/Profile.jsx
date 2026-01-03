import React, { useEffect, useState } from 'react';
import { User, LogOut, Trash2, Edit2, MapPin, Globe, Camera } from 'lucide-react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const { t, changeLanguage } = useLanguage();

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        languagePreference: 'English',
        profilePhotoUrl: ''
    });
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/profile');
            setUser(res.data);
            setFormData({
                name: res.data.name || '',
                languagePreference: res.data.languagePreference || 'English',
                profilePhotoUrl: res.data.profilePhotoUrl || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('confirmDeleteAccount'))) return;
        try {
            await api.delete('/user/profile');
            handleLogout();
        } catch (err) {
            console.error("Failed to delete account", err);
            alert(t('failedToDeleteAccount'));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = formData.profilePhotoUrl;
            if (photoFile) {
                const uploadData = new FormData();
                uploadData.append('file', photoFile);
                const uploadRes = await api.post('/trips/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.imageUrl;
            }

            const res = await api.put('/user/profile', {
                ...formData,
                profilePhotoUrl: imageUrl
            });
            setUser(res.data);
            // Update Global Language Context
            changeLanguage(formData.languagePreference);

            setEditMode(false);
            setPhotoFile(null);
            // Update local storage user name/photo if we want to keep it in sync, but app mainly uses API now
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    const removeSavedDestination = async (dest) => {
        try {
            const res = await api.delete('/user/saved-destinations', { data: { destination: dest } });
            setUser(res.data);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-10 text-center">{t('loadingProfile')}</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">{t('profile')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        {!editMode ? (
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl overflow-hidden border-4 border-white shadow-sm">
                                        {user.profilePhotoUrl ? (
                                            <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : <User size={40} aria-label={t('userIcon')} />
                                        )}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{user.name || t('user')}</h2>
                                    <p className="text-gray-500 mb-2">{user.email || t('noEmail')}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                                            {user.role || t('client')}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Globe size={12} /> {user.languagePreference || t('english')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title={t('editProfile')}
                                >
                                    <Edit2 size={20} />
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fadeIn">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative w-24 h-24 mb-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-sm flex items-center justify-center">
                                            {(photoFile || formData.profilePhotoUrl) ? (
                                                <img
                                                    src={photoFile ? URL.createObjectURL(photoFile) : formData.profilePhotoUrl}
                                                    alt={t('preview')}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={40} className="text-gray-400" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-sm">
                                            <Camera size={14} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('languagePreference')}</label>
                                    <select
                                        value={formData.languagePreference}
                                        onChange={e => setFormData({ ...formData, languagePreference: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="English">{t('english')}</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Tamil">Tamil</option>
                                        <option value="Telugu">Telugu</option>
                                        <option value="Malayalam">Malayalam</option>
                                        <option value="Kannada">Kannada</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setEditMode(false); setPhotoFile(null); }}
                                        className="flex-1 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                    >
                                        {t('saveChanges')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Saved Destinations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-red-500" /> {t('savedDest')}
                        </h3>
                        {user.savedDestinations && user.savedDestinations.length > 0 ? (
                            <div className="space-y-3">
                                {user.savedDestinations.map((dest, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                        <span className="font-medium text-gray-700">{dest}</span>
                                        <button
                                            onClick={() => removeSavedDestination(dest)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title={t('remove')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">{t('noSavedDestinations')}</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('accountActions')}</h3>
                        <button
                            onClick={handleLogout}
                            className="w-full py-2.5 px-4 mb-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} /> {t('logout')}
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full py-2.5 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> {t('deleteAccount')}
                        </button>
                        <p className="text-xs text-gray-400 mt-4 text-center">
                            {t('deleteAccountWarning')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
