import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon, MapPin, Star, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Search = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [popularDestinations, setPopularDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch popular/random destinations on load
        fetchPopularDestinations();
    }, []);

    const fetchPopularDestinations = async () => {
        try {
            // Using a mock list or existing API if available. 
            // Since we don't have a dedicated "popular" endpoint, we can search for a common term or use hardcoded recommended ones.
            // For now, let's just show some static "popular" ones or fetch recommended if possible.
            // Let's reuse the recommended endpoint logic from Dashboard if accessible, or just search for "Beach" as a default.
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/recommendations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPopularDestinations(response.data.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch popular destinations', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            // Using the cities search text endpoint we saw in TripDetails or similar
            // If backend doesn't have a direct "search cities" public endpoint, we might need to mock or use what's available.
            // Assuming /api/cities/search?query=... exists based on TripDetails findings, or we use a mocked list for now if backend is limited.
            // Actually, based on previous files, we saw `api.get(/cities/search?query=${query})` in TripDetails.jsx.

            // Wait, TripDetails uses: `api.get(/cities/search?query=${query})`
            // But we don't have full visibility if that endpoint is secured or not, likely secured.
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/cities/search?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(response.data);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('discoverAdventure')}</h1>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                    {t('exploreCities')}
                </p>

                <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchDestinations')}
                        className="w-full px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-xl text-lg pl-12"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-full font-medium hover:bg-blue-700 transition flex items-center"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : t('search')}
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                {!searched && (
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-2xl font-bold text-gray-800">{t('recommendedForYou')}</h2>
                    </div>
                )}

                {searched && (
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-2xl font-bold text-gray-800">{t('searchResults')}</h2>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(searched ? results : popularDestinations).map((city) => (
                            <div key={city.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                <div className="h-48 bg-gray-200 relative">
                                    <img
                                        src={`https://source.unsplash.com/800x600/?${city.name},landmark`}
                                        alt={city.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 flex items-center">
                                        <Star size={12} className="text-yellow-400 mr-1 fill-current" />
                                        4.8
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{city.name}</h3>
                                    <p className="text-gray-500 flex items-center text-sm mb-4">
                                        <MapPin size={16} className="mr-1" /> {city.country}
                                    </p>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                        {city.description || `Discover the beauty and culture of ${city.name}. A perfect destination for your next adventure.`}
                                    </p>
                                    <button
                                        onClick={() => navigate('/new-trip')} // Or pre-fill new trip with this city
                                        className="w-full py-2.5 bg-gray-50 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                                    >
                                        <span>{t('startPlanning')}</span>
                                        <ArrowRight size={16} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searched && results.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">{t('noDestinationsFound')}</h3>
                        <p className="text-gray-500">{t('tryAdjustingSearch')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
