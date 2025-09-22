import React, { useState, useEffect, useMemo } from 'react';
import { getFarmers, getLands } from '../services/farmService';
import { getHistory } from '../services/historyService';
import type { Farmer, Land, HistoryEntry } from '../types';
import MapInput from '../components/MapInput';

interface LandDetailPageProps {
    landId: string;
    farmerId: string;
    onBack: () => void;
}

const LandDetailPage: React.FC<LandDetailPageProps> = ({ landId, farmerId, onBack }) => {
    const [farmer, setFarmer] = useState<Farmer | null>(null);
    const [land, setLand] = useState<Land | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    
    useEffect(() => {
        const allFarmers = getFarmers();
        const allLands = getLands();
        const allHistory = getHistory();

        const currentFarmer = allFarmers.find(f => f.id === farmerId) || null;
        const currentLand = allLands.find(l => l.id === landId) || null;
        const landHistory = allHistory.filter(h => h.formData.landId === landId).sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());

        setFarmer(currentFarmer);
        setLand(currentLand);
        setHistory(landHistory);
    }, [landId, farmerId]);

    const landIndex = useMemo(() => {
        if (!land) return 0;
        const farmerLands = getLands().filter(l => l.farmerId === farmerId).sort((a, b) => a.id.localeCompare(b.id));
        return farmerLands.findIndex(l => l.id === landId) + 1;
    }, [land, farmerId]);

    if (!farmer || !land) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Loading land details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div>
                <button onClick={onBack} className="flex items-center text-sm font-medium text-green-600 hover:text-green-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Farm Management
                </button>
            </div>
            
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Land {landIndex}</h1>
                <p className="mt-2 text-lg text-gray-600">Owned by {farmer.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Land Details</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li><strong>Area:</strong> {land.area.toFixed(2)} hectares</li>
                        <li><strong>Soil Type:</strong> {land.soilType}</li>
                    </ul>
                    <div className="pt-4">
                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Field Shape</h3>
                         <MapInput onShapeChange={() => {}} initialShape={land.shape} readOnly={true} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Crop & Yield History</h2>
                     {history.length > 0 ? (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {history.map(entry => (
                                <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-green-700">{entry.formData.cropType}</p>
                                            <p className="text-sm text-gray-500">{new Date(entry.id).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-800">{entry.result.predictedYield.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">{entry.result.yieldUnit}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 pt-2 border-t">{entry.result.summary}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No prediction history available for this land.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandDetailPage;