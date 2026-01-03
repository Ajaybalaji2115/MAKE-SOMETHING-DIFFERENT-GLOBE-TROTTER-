import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Globe, Map as MapIcon, Plane } from 'lucide-react';
import api from '../lib/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
// delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allCities, setAllCities] = useState([]);
    const [expandedCityId, setExpandedCityId] = useState(null);

    const [mapLoading, setMapLoading] = useState(false);

    const toggleMap = async (cityId) => {
        if (expandedCityId === cityId) {
            setExpandedCityId(null);
            return;
        }

        setExpandedCityId(cityId);

        // Find the city
        const cityIndex = results.findIndex(c => c.id === cityId);
        if (cityIndex === -1) return;

        const city = results[cityIndex];

        // If city already has coordinates, no need to fetch
        if (city.latitude && city.longitude) {
            return;
        }

        setMapLoading(true);
        try {
            // Fetch coordinates from OpenStreetMap Nominatim API
            // We append 'city' and 'country' to be specific
            // Using a generic User-Agent is recommended for Nominatim, though browser usually handles it.
            // Note: Nominatim usage policy requires a valid User-Agent.
            // In a production backend, this should be proxied. For client-side demo:
            const query = `${city.name}, ${city.country || ''}`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                headers: {
                    'Accept-Language': 'en'
                }
            });

            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];

                // Update the city in results state with new coordinates
                const newResults = [...results];
                newResults[cityIndex] = {
                    ...city,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                };
                setResults(newResults);

                // Also update allCities if needed
                const allCitiesIndex = allCities.findIndex(c => c.id === cityId);
                if (allCitiesIndex !== -1) {
                    const newAllCities = [...allCities];
                    newAllCities[allCitiesIndex] = {
                        ...allCities[allCitiesIndex],
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon)
                    };
                    setAllCities(newAllCities);
                }
            }
        } catch (error) {
            console.error("Failed to fetch coordinates for city:", city.name, error);
        } finally {
            setMapLoading(false);
        }
    };

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
            console.log('Search results:', response.data);
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
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                <span>Cost Index: {city.costIndex || 'N/A'}</span>
                            </div>
                            <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
                                <Plane size={12} />
                                <span>Flight</span>
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
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 py-2 bg-gray-50 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                                    onClick={() => alert(`Prepare to add ${city.name} to a trip (Feature coming in Itinerary Builder)`)}
                                >
                                    Plan Trip
                                </button>
                                <button
                                    className={`flex-1 py-2 font-medium rounded-lg transition-colors border ${expandedCityId === city.id
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleMap(city.id)}
                                >
                                    {expandedCityId === city.id ? 'Hide Map' : 'View Map'}
                                </button>
                            </div>

                            {expandedCityId === city.id && (
                                <div className="mt-4 h-64 rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
                                    {mapLoading ? (
                                        <div className="absolute inset-0 z-10 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                                            <Globe className="animate-spin mb-2" size={24} />
                                            <span className="text-sm">Locating...</span>
                                        </div>
                                    ) : null}

                                    {city.latitude && city.longitude ? (
                                        <MapContainer
                                            center={[city.latitude, city.longitude]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[city.latitude, city.longitude]}>
                                                <Popup>
                                                    {city.name}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    ) : (
                                        !mapLoading && (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                <div className="text-center p-4">
                                                    <MapIcon size={32} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">Location data not available for this city.</p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
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