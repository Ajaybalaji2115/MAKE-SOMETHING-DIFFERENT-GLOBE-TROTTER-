import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Globe } from 'lucide-react';
import api from '../lib/axios';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allCities, setAllCities] = useState([]);

    useEffect(() => {
        // Ideally load popular or random cities first
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await api.get('/cities');
            setAllCities(response.data);
            setResults(response.data);
        } catch (error) {
            console.error('Failed to fetch cities', error);
        }
    };

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.trim() === '') {
            setResults(allCities);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/cities/search?query=${val}`);
            setResults(response.data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Explore Destinations</h1>
                <p className="text-gray-500 mt-2">Find the perfect city for your next adventure.</p>
            </div>

            <div className="max-w-xl mx-auto mb-10">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg"
                        placeholder="Search for a city (e.g., Paris, Tokyo)..."
                        value={query}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((city) => (
                    <div key={city.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
                        <div className="h-56 bg-gray-200 relative">
                            {city.imageUrl ? (
                                <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                    <Globe size={64} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                                Cost Index: {city.costIndex || 'N/A'}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <MapPin size={20} className="text-blue-600" />
                                {city.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mb-3">{city.country}</p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                {city.description || 'Discover the beauty and culture of this amazing destination.'}
                            </p>
                            <button
                                className="w-full py-2 bg-gray-50 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                                onClick={() => alert(`Prepare to add ${city.name} to a trip (Feature coming in Itinerary Builder)`)}
                            >
                                Plan a Trip Here
                            </button>
                        </div>
                    </div>
                ))}
                {results.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        No cities found matching "{query}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
