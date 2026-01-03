import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

const TripContext = createContext();

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};

export const TripProvider = ({ children, tripId }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrip = useCallback(async () => {
        if (!tripId) return;
        setLoading(true);
        try {
            const response = await api.get(`/trips/${tripId}`);
            setTrip(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching trip:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        fetchTrip();
    }, [fetchTrip]);

    const addActivity = async (stopId, activityData) => {
        try {
            await api.post(`/trips/${tripId}/stops/${stopId}/activities`, activityData);
            await fetchTrip();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const updateActivity = async (activityId, updates) => {
        try {
            const stop = trip?.stops?.find(s => s.activities?.some(a => a.id === activityId));
            if (!stop) throw new Error("Stop not found for activity");

            await api.put(`/trips/${tripId}/stops/${stop.id}/activities/${activityId}`, { ...updates });
            await fetchTrip(); // Re-fetch to sync state
            return true;
        } catch (err) {
            console.error("Failed to update activity", err);
            return false;
        }
    };

    const updateTrip = async (tripId, updates) => {
        try {
            await api.put(`/trips/${tripId}`, updates);
            await fetchTrip();
            return true;
        } catch (err) {
            console.error("Failed to update trip", err);
            return false;
        }
    };

    const deleteActivity = async (activityId) => {
        try {
            const stop = trip?.stops?.find(s => s.activities?.some(a => a.id === activityId));
            if (!stop) return;

            await api.delete(`/trips/${tripId}/stops/${stop.id}/activities/${activityId}`);
            await fetchTrip();
        } catch (err) {
            console.error(err);
        }
    };

    const addStop = async (stopData) => {
        try {
            await api.post(`/trips/${tripId}/stops`, stopData);
            await fetchTrip();
            return { success: true };
        } catch (err) {
            console.error(err);
            // Return error message if available from backend
            const msg = err.response?.data?.message || "Failed to add stop";
            return { success: false, message: msg };
        }
    };

    const deleteStop = async (stopId) => {
        try {
            await api.delete(`/trips/${tripId}/stops/${stopId}`);
            await fetchTrip();
        } catch (err) {
            console.error(err);
        }
    };

    const updateStop = async (stopId, updates) => {
        try {
            await api.put(`/trips/${tripId}/stops/${stopId}`, updates);
            await fetchTrip();
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, message: err.message };
        }
    };

    // Budget Calculations
    const totalCost = trip?.stops?.reduce((acc, stop) =>
        acc + (stop.activities?.reduce((s, a) => s + (a.cost || 0), 0) || 0) + (stop.transportCost || 0), 0) || 0;

    const budgetStats = {
        totalBudget: trip?.budget || 0,
        totalSpent: totalCost,
        remaining: (trip?.budget || 0) - totalCost,
        isOverBudget: totalCost > (trip?.budget || 0)
    };

    const value = {
        trip,
        loading,
        error,
        fetchTrip,
        addActivity,
        updateActivity,
        deleteActivity,
        addStop,
        deleteStop,
        updateStop,
        updateTrip,
        budgetStats
    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
};