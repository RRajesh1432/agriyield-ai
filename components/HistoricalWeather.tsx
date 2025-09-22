import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricalWeatherData } from '../types';
import Loader from './Loader';

interface HistoricalWeatherProps {
    onFetch: (region: string) => void;
    data: HistoricalWeatherData | null;
    isLoading: boolean;
    error: string | null;
}

const ChartCard: React.FC<{ title: string; data: any[]; dataKey: string; stroke: string; unit: string }> = ({ title, data, dataKey, stroke, unit }) => (
    <div>
        <h4 className="text-md font-semibold text-gray-700 text-center mb-2">{title}</h4>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => `${(value as number).toFixed(1)} ${unit}`} />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} name={`${title.split('(')[0].trim()} (${unit})`} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

const HistoricalWeather: React.FC<HistoricalWeatherProps> = ({ onFetch, data, isLoading, error }) => {
    const [region, setRegion] = useState('');

    const handleFetch = (e: React.FormEvent) => {
        e.preventDefault();
        if (region) {
            onFetch(region);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Historical Weather Data</h2>
            <p className="text-sm text-gray-500">
                Enter a city or region to fetch historical weather trends for context.
            </p>
            <form onSubmit={handleFetch} className="flex gap-2">
                <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., Napa Valley, California"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    aria-label="Region for weather data"
                />
                <button
                    type="submit"
                    disabled={isLoading || !region}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? '...' : 'Fetch'}
                </button>
            </form>

            {isLoading && <Loader message="Fetching weather data..." />}
            {error && <div className="text-center p-2 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
            
            {data && (
                 <div className="space-y-4 pt-4 animate-fade-in">
                    <ChartCard 
                        title="Avg. Monthly Temperature (°C)"
                        data={data.monthlyTemperature}
                        dataKey="value"
                        stroke="#ef4444"
                        unit="°C"
                    />
                     <ChartCard 
                        title="Avg. Monthly Rainfall (mm)"
                        data={data.monthlyRainfall}
                        dataKey="value"
                        stroke="#3b82f6"
                        unit="mm"
                    />
                </div>
            )}
        </div>
    );
};

export default HistoricalWeather;