import React, { useState, useEffect, useMemo } from 'react';
import { getFarmers, saveFarmer, getLands, saveLand, getLandsForFarmer, deleteFarmer } from '../services/farmService';
import { getHistory } from '../services/historyService';
import { SOIL_TYPES } from '../constants';
import type { Farmer, Land, HistoryEntry, SoilType } from '../types';
import MapInput from '../components/MapInput';

interface FarmersPageProps {
    onSelectLand: (landId: string, farmerId: string) => void;
}

const FarmersPage: React.FC<FarmersPageProps> = ({ onSelectLand }) => {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [lands, setLands] = useState<Land[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
    const [newFarmerName, setNewFarmerName] = useState('');
    const [showAddLandForm, setShowAddLandForm] = useState(false);

    const initialNewLandState = {
        soilType: SOIL_TYPES[0],
        shape: '',
        area: 0,
    };
    const [newLand, setNewLand] = useState(initialNewLandState);

    useEffect(() => {
        const allFarmers = getFarmers();
        setFarmers(allFarmers);
        setLands(getLands());
        setHistory(getHistory());

        // Select the first farmer by default if they exist
        if (allFarmers.length > 0 && !selectedFarmerId) {
            setSelectedFarmerId(allFarmers[0].id);
        }

    }, [selectedFarmerId]);

    const handleAddFarmer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFarmerName.trim()) {
            const newFarmer = saveFarmer({ name: newFarmerName.trim() });
            setFarmers(prev => [...prev, newFarmer]);
            setNewFarmerName('');
            setSelectedFarmerId(newFarmer.id); // Select the new farmer
        }
    };
    
    const handleDeleteFarmer = (farmerId: string) => {
        const farmerToDelete = farmers.find(f => f.id === farmerId);
        if (!farmerToDelete) return;
    
        if (window.confirm(`Are you sure you want to delete ${farmerToDelete.name} and all their associated lands and history? This action cannot be undone.`)) {
            deleteFarmer(farmerId);
            
            const updatedFarmers = getFarmers();
            const updatedLands = getLands();
            const updatedHistory = getHistory();
    
            setFarmers(updatedFarmers);
            setLands(updatedLands);
            setHistory(updatedHistory);
    
            // If the deleted farmer was the selected one, update selection
            if (selectedFarmerId === farmerId) {
                setSelectedFarmerId(updatedFarmers.length > 0 ? updatedFarmers[0].id : null);
            }
        }
    };

    const handleSelectFarmer = (farmerId: string) => {
        setSelectedFarmerId(farmerId);
        setShowAddLandForm(false);
        setNewLand(initialNewLandState);
    };

    const handleAddLand = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFarmerId && newLand.area > 0) {
            const newLandData = saveLand({
                farmerId: selectedFarmerId,
                soilType: newLand.soilType,
                shape: newLand.shape,
                area: newLand.area,
            });
            setLands(prev => [...prev, newLandData]);
            setShowAddLandForm(false);
            setNewLand(initialNewLandState);
        } else {
            alert("Please draw the field shape on the map.");
        }
    };
    
    const selectedFarmer = useMemo(() => farmers.find(f => f.id === selectedFarmerId), [farmers, selectedFarmerId]);
    
    const landsForSelectedFarmer = useMemo(() => {
        if (!selectedFarmerId) return [];
        // getLandsForFarmer already filters lands from the main list, which is in creation order.
        // To be explicit and guarantee order, we sort by the ID, which contains a timestamp.
        return getLandsForFarmer(selectedFarmerId).sort((a, b) => a.id.localeCompare(b.id));
    }, [selectedFarmerId, lands]);

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center mb-8">Farm Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Farmers List */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Farmers</h2>
                    <form onSubmit={handleAddFarmer} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newFarmerName}
                            onChange={e => setNewFarmerName(e.target.value)}
                            placeholder="New farmer's name"
                            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400">Add</button>
                    </form>
                    <ul className="space-y-2">
                        {farmers.map(farmer => (
                             <li key={farmer.id} className="group relative rounded-md">
                                <button onClick={() => handleSelectFarmer(farmer.id)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedFarmerId === farmer.id ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'}`}>
                                    {farmer.name}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFarmer(farmer.id); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label={`Delete ${farmer.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Land Details */}
                <div className="md:col-span-2">
                    {!selectedFarmer ? (
                        <div className="flex items-center justify-center h-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">Select or add a farmer to manage their lands.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">Lands for {selectedFarmer.name}</h2>
                                <button onClick={() => setShowAddLandForm(prev => !prev)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                                    {showAddLandForm ? 'Cancel' : '+ Add New Land'}
                                </button>
                            </div>
                            {showAddLandForm && (
                                <form onSubmit={handleAddLand} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4 animate-fade-in">
                                    <h3 className="text-lg font-semibold">New Land Details</h3>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                                        <select value={newLand.soilType} onChange={e => setNewLand(p => ({...p, soilType: e.target.value as SoilType}))} className="w-full p-2 border border-gray-300 rounded-md sm:text-sm">
                                            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Shape</label>
                                        <MapInput onShapeChange={(shape, area) => setNewLand(p => ({...p, shape, area: parseFloat(area.toFixed(2))}))} />
                                        {newLand.area > 0 && <p className="text-xs text-gray-500 mt-1">Area: {newLand.area.toFixed(2)} hectares</p>}
                                    </div>
                                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Save Land</button>
                                </form>
                            )}

                            {landsForSelectedFarmer.length > 0 ? (
                                landsForSelectedFarmer.map((land, index) => (
                                    <button 
                                        key={land.id} 
                                        onClick={() => onSelectLand(land.id, selectedFarmer.id)}
                                        className="w-full text-left bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer block"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800">{`Land ${index + 1}`}</h3>
                                        <p className="text-sm text-gray-500">{land.area.toFixed(2)} hectares - {land.soilType} soil</p>
                                        <div className="mt-4 border-t pt-4">
                                            <p className="text-sm text-green-600 font-semibold flex items-center">
                                                View Details & History
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                !showAddLandForm && <p className="text-gray-500 text-center py-8">No lands added for this farmer yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmersPage;