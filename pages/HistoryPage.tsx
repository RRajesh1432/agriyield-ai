import React, { useState, useEffect, useMemo } from 'react';
import { getHistory, clearHistory } from '../services/historyService';
import { getFarmers, getLands } from '../services/farmService';
import type { HistoryEntry, Farmer, Land } from '../types';

interface HistoryItemProps {
    entry: HistoryEntry;
    farmerName?: string;
    landName?: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ entry, farmerName, landName }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const title = [farmerName, landName, `${entry.formData.cropType} - ${entry.formData.area.toFixed(2)} ha`]
        .filter(Boolean)
        .join(' - ');

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <button
                className="w-full text-left p-4 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-green-700">{title}</p>
                        <p className="text-sm text-gray-500">{entry.timestamp}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xl font-bold text-gray-800">{entry.result.predictedYield.toFixed(2)} {entry.result.yieldUnit}</p>
                         <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 animate-fade-in">
                    <h4 className="font-semibold mb-2">Inputs:</h4>
                    <ul className="text-sm text-gray-700 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(entry.formData).map(([key, value]) => {
                             if (key === 'farmerId' || key === 'landId' || key === 'fieldShape') return null;
                             return <li key={key}><strong>{key}:</strong> {String(value)}</li>
                        })}
                    </ul>
                     <h4 className="font-semibold mt-4 mb-2">Summary:</h4>
                     <p className="text-sm text-gray-700">{entry.result.summary}</p>
                </div>
            )}
        </div>
    );
};

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [lands, setLands] = useState<Land[]>([]);

    useEffect(() => {
        setHistory(getHistory());
        setFarmers(getFarmers());
        setLands(getLands());
    }, []);

    const farmerNameMap = useMemo(() => new Map(farmers.map(f => [f.id, f.name])), [farmers]);
    
    const landIdentifierMap = useMemo(() => {
        const identifierMap = new Map<string, string>();
        const landsByFarmer = lands.reduce((acc, land) => {
            if (!acc[land.farmerId]) {
                acc[land.farmerId] = [];
            }
            acc[land.farmerId].push(land);
            return acc;
        }, {} as Record<string, Land[]>);

        Object.values(landsByFarmer).forEach(farmerLands => {
            farmerLands.forEach((land, index) => {
                identifierMap.set(land.id, `Land ${index + 1}`);
            });
        });
        return identifierMap;
    }, [lands]);

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to clear all prediction history? This action cannot be undone.")) {
            clearHistory();
            setHistory([]);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
                 {history.length > 0 && (
                    <button 
                        onClick={handleClearHistory}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Clear History
                    </button>
                )}
            </div>
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(entry => (
                        <HistoryItem 
                            key={entry.id} 
                            entry={entry} 
                            farmerName={entry.formData.farmerId ? farmerNameMap.get(entry.formData.farmerId) : undefined}
                            landName={entry.formData.landId ? landIdentifierMap.get(entry.formData.landId) : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold text-gray-700">No History Found</h2>
                    <p className="mt-2 text-gray-500">Your past predictions will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
