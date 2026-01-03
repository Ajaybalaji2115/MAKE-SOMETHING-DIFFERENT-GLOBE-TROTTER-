import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, DollarSign, Image as ImageIcon, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

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
            alert('Failed to load trip details');
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
            setCoverPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
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
            return response.data.imageUrl; // URL string
        } catch (error) {
            console.error('Image upload failed:', error);
            return null; // Handle error gracefully, maybe keep old URL if edit?
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                alert('End date cannot be before start date');
                setLoading(false);
                return;
            }

            let coverPhotoUrl = previewUrl; // Default to existing preview (if editing and no new file)

            if (coverPhoto) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) coverPhotoUrl = uploadedUrl;
            } else if (isEditMode && !coverPhoto) {
                // Keep existing URL is handled by state init, assuming previewUrl holds it
                // We don't need to re-upload if not changed
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
            } else {
                await axios.post('http://localhost:8080/api/trips', tripData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            navigate('/my-trips');
        } catch (error) {
            console.error('Failed to save trip:', error);
            alert('Failed to save trip. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center text-gray-500">Loading trip details...</div>;

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? t('editTrip') : t('planNewTrip')}</h1>
                <p className="text-gray-500 mt-2">{isEditMode ? t('updateTripDetails') : t('startJourney')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('tripName')}</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t('tripDescPlaceholder')}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t('descPlaceholder')}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    min={!isEditMode ? today : undefined}
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    min={formData.startDate || (!isEditMode ? today : undefined)}
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('estBudget')}</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="budget"
                                    required
                                    min="0"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                        {/* File Upload for Cover Photo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('coverPhoto')}</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="file"
                                    name="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {previewUrl && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">{t('preview')}:</p>
                            <div className="h-48 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2 disabled:bg-blue-400"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                <span>{t('creating')}</span>
                            </>
                        ) : (
                            <>
                                <MapPin size={20} />
                                <span>{isEditMode ? t('updateTrip') : t('startPlanning')}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTrip;
