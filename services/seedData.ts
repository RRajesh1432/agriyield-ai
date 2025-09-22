import { Farmer, Land, HistoryEntry, CropType, SoilType, FertilizerType } from '../types';

// GeoJSON for a simple square field
const fieldShape1 = '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-87.62,41.88],[-87.63,41.88],[-87.63,41.89],[-87.62,41.89],[-87.62,41.88]]]}}';
// GeoJSON for a rectangular field
const fieldShape2 = '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-95.36,29.76],[-95.38,29.76],[-95.38,29.78],[-95.36,29.78],[-95.36,29.76]]]}}';
// GeoJSON for a slightly irregular field
const fieldShape3 = '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-118.24,34.05],[-118.25,34.05],[-118.25,34.07],[-118.245,34.065],[-118.24,34.05]]]}}';


export const DEFAULT_FARMERS: Farmer[] = [
    { id: 'farmer-1', name: 'John Appleseed' },
    { id: 'farmer-2', name: 'Maria Garcia' },
];

export const DEFAULT_LANDS: Land[] = [
    { id: 'land-1-1', farmerId: 'farmer-1', shape: fieldShape1, area: 78.41, soilType: SoilType.Loamy },
    { id: 'land-2-1', farmerId: 'farmer-2', shape: fieldShape2, area: 157.53, soilType: SoilType.Sandy },
    { id: 'land-2-2', farmerId: 'farmer-2', shape: fieldShape3, area: 125.10, soilType: SoilType.Clay },
];

export const DEFAULT_HISTORY: HistoryEntry[] = [
    {
        id: 'hist-1',
        timestamp: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toLocaleString(), // 2 months ago
        formData: {
            farmerId: 'farmer-1',
            landId: 'land-1-1',
            cropType: CropType.Corn,
            fieldShape: fieldShape1,
            soilType: SoilType.Loamy,
            rainfall: 600,
            temperature: 25,
            pesticideUsage: true,
            fertilizerType: FertilizerType['Nitrogen-based'],
            area: 78.41,
            // FIX: Added missing 'taskDescription' property.
            taskDescription: 'Routine yield check for corn crop.',
        },
        result: {
            predictedYield: 9.5,
            yieldUnit: 'tons/hectare',
            confidenceScore: 0.92,
            summary: 'Excellent conditions for Corn. High rainfall and nitrogen fertilizer are major positive factors.',
            weatherImpactAnalysis: 'Favorable temperatures and adequate rainfall suggest a strong growing season with minimal weather-related stress.',
            recommendations: [{ title: 'Monitor for Nitrogen Leaching', description: 'With high rainfall, consider split applications of nitrogen to prevent leaching.', impact: 'Medium' }],
            riskFactors: ['Potential for fungal diseases due to humidity.'],
        }
    },
    {
        id: 'hist-2',
        timestamp: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toLocaleString(), // 5 months ago
        formData: {
            farmerId: 'farmer-2',
            landId: 'land-2-1',
            cropType: CropType.Cotton,
            fieldShape: fieldShape2,
            soilType: SoilType.Sandy,
            rainfall: 350,
            temperature: 30,
            pesticideUsage: true,
            fertilizerType: FertilizerType['Potassium-based'],
            area: 157.53,
            // FIX: Added missing 'taskDescription' property.
            taskDescription: 'Pre-season planning for cotton.',
        },
        result: {
            predictedYield: 1.8,
            yieldUnit: 'bales/hectare',
            confidenceScore: 0.88,
            summary: 'Good yield prediction for Cotton in sandy soil, benefiting from high temperatures.',
            weatherImpactAnalysis: 'High average temperatures are ideal for cotton growth, but lower rainfall may require supplemental irrigation.',
            recommendations: [{ title: 'Optimize Irrigation', description: 'Sandy soil drains quickly. Ensure consistent moisture levels during the flowering stage.', impact: 'High' }],
            riskFactors: ['Heat stress during peak summer.', 'Nutrient deficiency in sandy soil.'],
        }
    },
    {
        id: 'hist-3',
        timestamp: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toLocaleString(), // 8 months ago
        formData: {
            farmerId: 'farmer-2',
            landId: 'land-2-2',
            cropType: CropType.Soybean,
            fieldShape: fieldShape3,
            soilType: SoilType.Clay,
            rainfall: 550,
            temperature: 24,
            pesticideUsage: false,
            fertilizerType: FertilizerType.Organic,
            area: 125.10,
            // FIX: Added missing 'taskDescription' property.
            taskDescription: 'Analysis for organic soybean cultivation.',
        },
        result: {
            predictedYield: 3.2,
            yieldUnit: 'tons/hectare',
            confidenceScore: 0.85,
            summary: 'Solid Soybean yield prediction. Clay soil offers good water retention.',
            weatherImpactAnalysis: 'Consistent rainfall and moderate temperatures create a low-risk environment for this crop.',
            recommendations: [{ title: 'Improve Soil Aeration', description: 'Clay soil can become compacted. Consider cover crops or minimum tillage to improve structure.', impact: 'Medium' }],
            riskFactors: ['Poor drainage in heavy clay soil after exceptionally heavy rain.'],
        }
    }
];