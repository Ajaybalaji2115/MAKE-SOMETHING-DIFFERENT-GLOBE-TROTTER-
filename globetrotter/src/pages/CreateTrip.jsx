import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaCalendarAlt, 
  FaDollarSign, 
  FaImage, 
  FaPlane, 
  FaSpinner,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCheck
} from 'react-icons/fa';

const CreateTrip = () => {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        budget: '',
        description: '',
    });
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchTripDetails();
        }
    }, [isEditMode, id]);

    const fetchTripDetails = async () => {
        setInitialLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const trip = response.data;
            setFormData({
                name: trip.name,
                startDate: trip.startDate,
                endDate: trip.endDate,
                budget: trip.budget,
                description: trip.description || '',
            });
            if (trip.coverPhotoUrl) {
                setPreviewUrl(trip.coverPhotoUrl);
            }
        } catch (error) {
            console.error('Failed to fetch trip details:', error);
            toast.error('Failed to load trip details');
            navigate('/my-trips');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setCoverPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
            toast.success('Image selected successfully');
        }
    };

    const uploadImage = async () => {
        if (!coverPhoto) return null;

        const formData = new FormData();
        formData.append('file', coverPhoto);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/trips/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.imageUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            toast.error('Failed to upload image');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const loadingToast = toast.loading(isEditMode ? 'Updating trip...' : 'Creating trip...');

        try {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                toast.error('End date cannot be before start date', { id: loadingToast });
                setLoading(false);
                return;
            }

            let coverPhotoUrl = previewUrl;

            if (coverPhoto) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) coverPhotoUrl = uploadedUrl;
            }

            const tripData = {
                ...formData,
                budget: parseFloat(formData.budget),
                coverPhotoUrl: coverPhotoUrl
            };

            const token = localStorage.getItem('token');

            if (isEditMode) {
                await axios.put(`http://localhost:8080/api/trips/${id}`, tripData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Trip updated successfully!', { id: loadingToast });
            } else {
                await axios.post('http://localhost:8080/api/trips', tripData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Trip created successfully!', { id: loadingToast });
            }

            navigate('/my-trips');
        } catch (error) {
            console.error('Failed to save trip:', error);
            toast.error('Failed to save trip. Please try again.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Loading trip details...</p>
                </div>
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <FaPlane className="text-4xl text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        {isEditMode ? t('editTrip') : t('planNewTrip')}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {isEditMode ? t('updateTripDetails') : t('startJourney')}
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-10 space-y-6">
                        {/* Trip Name */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FaMapMarkerAlt className="text-blue-600" />
                                {t('tripName')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t('tripDescPlaceholder')}
                                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                            />
                        </div>

                        {/* Description */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FaFileAlt className="text-purple-600" />
                                {t('description')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder={t('descPlaceholder')}
                                rows="4"
                                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FaCalendarAlt className="text-green-600" />
                                    {t('startDate')}
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    min={!isEditMode ? today : undefined}
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all duration-200 text-gray-800"
                                />
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FaCalendarAlt className="text-red-600" />
                                    {t('endDate')}
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    min={formData.startDate || (!isEditMode ? today : undefined)}
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all duration-200 text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Budget & Cover Photo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FaDollarSign className="text-yellow-600" />
                                    {t('estBudget')}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        name="budget"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 outline-none transition-all duration-200 text-gray-800"
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FaImage className="text-pink-600" />
                                    {t('coverPhoto')}
                                </label>
                                <input
                                    type="file"
                                    name="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white hover:file:from-blue-700 hover:file:to-purple-700 file:cursor-pointer file:transition-all"
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        {previewUrl && (
                            <div className="group animate-fadeIn">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <FaCheck className="text-green-600" />
                                    {t('preview')}
                                </label>
                                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border-4 border-gray-200 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <img 
                                        src={previewUrl} 
                                        alt="Cover Preview" 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 md:px-10 py-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin text-xl" />
                                    <span>{isEditMode ? 'Updating...' : t('creating')}</span>
                                </>
                            ) : (
                                <>
                                    <FaCheck className="text-xl" />
                                    <span>{isEditMode ? t('updateTrip') : t('startPlanning')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTrip;