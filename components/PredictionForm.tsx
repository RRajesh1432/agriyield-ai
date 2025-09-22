import React from 'react';
import type { PredictionFormData, Farmer, Land } from '../types';
import { CROP_TYPES, SOIL_TYPES, FERTILIZER_TYPES } from '../constants';

interface PredictionFormProps {
    formData: PredictionFormData;
    setFormData: React.Dispatch<React.SetStateAction<PredictionFormData>>;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    farmers: Farmer[];
    lands: Land[];
    onFarmerSelect: (farmerId: string) => void;
    onLandSelect: (landId: string) => void;
}

const InputField: React.FC<{label: string; children: React.ReactNode}> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const PredictionForm: React.FC<PredictionFormProps> = ({ formData, setFormData, onSubmit, isLoading, farmers, lands, onFarmerSelect, onLandSelect }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const { name, value } = target;
        
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: target.type === 'number' ? parseFloat(value) : value }));
        }
    };

    const handleFarmerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFarmerSelect(e.target.value);
    }
    
    const handleLandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onLandSelect(e.target.value);
    }

    const availableLands = formData.farmerId ? lands.filter(l => l.farmerId === formData.farmerId) : [];
    
    return (
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputField label="Select Farmer (Optional)">
                    <select name="farmerId" value={formData.farmerId || ''} onChange={handleFarmerChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        <option value="">-- Select a Farmer --</option>
                        {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </InputField>

                <InputField label="Select Land (Optional)">
                    <select name="landId" value={formData.landId || ''} onChange={handleLandChange} disabled={!formData.farmerId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm disabled:bg-gray-100">
                        <option value="">-- Select Land --</option>
                        {availableLands.map((l, index) => <option key={l.id} value={l.id}>{`Land ${index + 1} - ${l.area.toFixed(2)} ha`}</option>)}
                    </select>
                </InputField>
            </div>
             <hr/>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                <InputField label="Crop Type">
                    <select name="cropType" value={formData.cropType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        {CROP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </InputField>

                <InputField label="Soil Type">
                    <select name="soilType" value={formData.soilType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        {SOIL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </InputField>

                <InputField label="Fertilizer Type">
                    <select name="fertilizerType" value={formData.fertilizerType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        {FERTILIZER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </InputField>

                 <div className="md:col-span-2 lg:col-span-3">
                    <InputField label="Task Description">
                        <input
                            type="text"
                            name="taskDescription"
                            value={formData.taskDescription}
                            onChange={handleChange}
                            placeholder="e.g., Pre-planting soil analysis, mid-season nutrient check"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </InputField>
                </div>
                
                <InputField label="Average Annual Rainfall">
                    <div className="relative mt-1">
                        <input 
                            type="number" 
                            name="rainfall" 
                            value={formData.rainfall} 
                            onChange={handleChange} 
                            required 
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">(mm)</span>
                        </div>
                    </div>
                </InputField>

                <InputField label="Average Temperature">
                     <div className="relative mt-1">
                        <input 
                            type="number" 
                            name="temperature" 
                            value={formData.temperature} 
                            onChange={handleChange} 
                            required 
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">(°C)</span>
                        </div>
                    </div>
                </InputField>

                <InputField label="Area">
                    <>
                        <div className="relative mt-1">
                            <input 
                               type="number" 
                               name="area" 
                               value={formData.area} 
                               readOnly 
                               className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-gray-100 cursor-not-allowed pr-24"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">(hectares)</span>
                            </div>
                        </div>
                         <p className="mt-1 text-xs text-gray-500">Calculated from map or selected land.</p>
                    </>
                </InputField>
            </div>
            
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="pesticideUsage" name="pesticideUsage" type="checkbox" checked={formData.pesticideUsage} onChange={handleChange} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="pesticideUsage" className="font-medium text-gray-700">Pesticide Usage</label>
                    <p className="text-gray-500">Check if pesticides are used on this crop.</p>
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                    {isLoading ? 'Generating Prediction...' : 'Get Yield Prediction'}
                </button>
            </div>
        </form>
    );
};

export default PredictionForm;