import React, { useEffect, useState } from 'react';
import { 
    MdPerson, 
    MdLogout, 
    MdDelete, 
    MdEdit, 
    MdPlace, 
    MdLanguage,
    MdCamera,
    MdClose,
    MdSave
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const { t, changeLanguage } = useLanguage();

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
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        window.location.href = '/login';
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('confirmDeleteAccount'))) return;
        try {
            await api.delete('/user/profile');
            toast.success('Account deleted successfully');
            handleLogout();
        } catch (err) {
            console.error("Failed to delete account", err);
            toast.error(t('failedToDeleteAccount'));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setPhotoFile(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        
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
            changeLanguage(formData.languagePreference);

            setEditMode(false);
            setPhotoFile(null);
            toast.success('Profile updated successfully! 🎉');
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error('Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const removeSavedDestination = async (dest) => {
        try {
            const res = await api.delete('/user/saved-destinations', { data: { destination: dest } });
            setUser(res.data);
            toast.success('Removed from favorites');
        } catch (err) { 
            console.error(err);
            toast.error('Failed to remove destination');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-8">
                {t('profile')}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
                        {!editMode ? (
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* Profile Picture */}
                                <div className="relative group">
                                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-4xl overflow-hidden border-4 border-white shadow-2xl">
                                        {user.profilePhotoUrl ? (
                                            <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white">
                                                {user.name ? user.name.charAt(0).toUpperCase() : <MdPerson className="text-5xl" />}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center sm:text-left flex-1">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{user.name || t('user')}</h2>
                                    <p className="text-gray-600 mb-3">{user.email || t('noEmail')}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                                            {user.role || t('client')}
                                        </span>
                                        <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                                            <MdLanguage className="text-sm" /> 
                                            {user.languagePreference || t('english')}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                                    title={t('editProfile')}
                                >
                                    <MdEdit className="text-xl" />
                                </button>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={handleSaveProfile} className="space-y-6 animate-fadeIn">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative w-28 h-28 mb-4 group">
                                        <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                                            {(photoFile || formData.profilePhotoUrl) ? (
                                                <img
                                                    src={photoFile ? URL.createObjectURL(photoFile) : formData.profilePhotoUrl}
                                                    alt={t('preview')}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <MdPerson className="text-5xl text-gray-400" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-110 transition-all">
                                            <MdCamera className="text-lg" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <MdPerson className="text-blue-600" />
                                        {t('fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <MdLanguage className="text-purple-600" />
                                        {t('languagePreference')}
                                    </label>
                                    <select
                                        value={formData.languagePreference}
                                        onChange={e => setFormData({ ...formData, languagePreference: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all appearance-none cursor-pointer"
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
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all"
                                    >
                                        <MdClose className="text-xl" />
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                    >
                                        {savingProfile ? (
                                            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                        ) : (
                                            <>
                                                <MdSave className="text-xl" />
                                                {t('saveChanges')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Saved Destinations */}
                    <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaHeart className="text-red-500" /> 
                            {t('savedDest')}
                        </h3>
                        {user.savedDestinations && user.savedDestinations.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {user.savedDestinations.map((dest, idx) => (
                                    <div 
                                        key={idx} 
                                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-100 hover:border-red-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <MdPlace className="text-red-500 text-xl" />
                                            <span className="font-semibold text-gray-800">{dest}</span>
                                        </div>
                                        <button
                                            onClick={() => removeSavedDestination(dest)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title={t('remove')}
                                        >
                                            <MdDelete className="text-lg" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 italic">{t('noSavedDestinations')}</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('accountActions')}</h3>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
                        >
                            <MdLogout className="text-xl" /> 
                            {t('logout')}
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <MdDelete className="text-xl" /> 
                            {t('deleteAccount')}
                        </button>
                        <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                            {t('deleteAccountWarning')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;