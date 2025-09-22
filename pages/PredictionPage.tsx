import React, { useState, useEffect } from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultsDisplay from '../components/ResultsDisplay';
import Loader from '../components/Loader';
import { predictYield, getHistoricalWeather } from '../services/geminiService';
import { savePredictionToHistory } from '../services/historyService';
import { getFarmers, getLands } from '../services/farmService';
import { CropType, SoilType, FertilizerType } from '../types';
import type { PredictionFormData, PredictionResult, HistoricalWeatherData, Farmer, Land } from '../types';
import MapInput from '../components/MapInput';
import HistoricalWeather from '../components/HistoricalWeather';

const initialFormData: PredictionFormData = {
    cropType: CropType.Wheat,
    fieldShape: '',
    soilType: SoilType.Loamy,
    rainfall: 450,
    temperature: 22,
    pesticideUsage: false,
    fertilizerType: FertilizerType['Nitrogen-based'],
    area: 0,
    taskDescription: '',
};

const PredictionPage: React.FC = () => {
    const [formData, setFormData] = useState<PredictionFormData>(initialFormData);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [weatherData, setWeatherData] = useState<HistoricalWeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [lands, setLands] = useState<Land[]>([]);

    useEffect(() => {
        setFarmers(getFarmers());
        setLands(getLands());
    }, []);

    const handleShapeChange = (shapeGeoJSON: string, areaHectares: number) => {
        setFormData(prev => ({
            ...prev,
            fieldShape: shapeGeoJSON,
            area: parseFloat(areaHectares.toFixed(2))
        }));
    };
    
    const handleFarmerSelect = (farmerId: string) => {
        setFormData(prev => ({
            ...initialFormData,
            farmerId: farmerId,
        }));
    };

    const handleLandSelect = (landId: string) => {
        const land = lands.find(l => l.id === landId);
        if (land) {
            setFormData(prev => ({
                ...prev,
                landId: land.id,
                fieldShape: land.shape,
                area: land.area,
                soilType: land.soilType
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                landId: '',
                fieldShape: '',
                area: 0,
            }));
        }
    };

    const fetchWeatherData = async (region: string) => {
        setIsWeatherLoading(true);
        setWeatherError(null);
        setWeatherData(null);
        try {
            const data = await getHistoricalWeather(region);
            setWeatherData(data);
        } catch (err) {
            setWeatherError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsWeatherLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const predictionResult = await predictYield(formData, farmers, lands);
            setResult(predictionResult);
            // Save to history
            const historyEntry = {
                id: new Date().toISOString(),
                timestamp: new Date().toLocaleString(),
                formData,
                result: predictionResult,
            };
            savePredictionToHistory(historyEntry);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI-Powered Yield Prediction</h1>
                <p className="mt-2 text-lg text-gray-600">Enter your farm's data to get an intelligent yield forecast and recommendations.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <PredictionForm 
                        formData={formData} 
                        setFormData={setFormData} 
                        onSubmit={handleSubmit} 
                        isLoading={isLoading}
                        farmers={farmers}
                        lands={lands}
                        onFarmerSelect={handleFarmerSelect}
                        onLandSelect={handleLandSelect}
                    />
                </div>
                <div className="lg:col-span-2 space-y-8">
                     <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Define Field Shape</h2>
                        <p className="text-sm text-gray-500">
                            Draw a new field or select a saved one to see its shape. You can edit the shape of a selected field.
                        </p>
                        <MapInput 
                            key={formData.landId || 'new-map'}
                            onShapeChange={handleShapeChange}
                            initialShape={formData.fieldShape} 
                        />
                    </div>
                     <HistoricalWeather 
                        onFetch={fetchWeatherData}
                        data={weatherData}
                        isLoading={isWeatherLoading}
                        error={weatherError}
                    />
                </div>
            </div>

            {isLoading && <Loader message="Our AI is analyzing your data..." />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {result && <ResultsDisplay result={result} />}
        </div>
    );
};

export default PredictionPage;