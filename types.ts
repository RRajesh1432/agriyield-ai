export enum CropType {
  Wheat = 'Wheat',
  Corn = 'Corn',
  Rice = 'Rice',
  Soybean = 'Soybean',
  Cotton = 'Cotton',
  Sugarcane = 'Sugarcane',
  Potatoes = 'Potatoes',
}

export enum SoilType {
  Loamy = 'Loamy',
  Sandy = 'Sandy',
  Clay = 'Clay',
  Silty = 'Silty',
  Peaty = 'Peaty',
}

export enum FertilizerType {
  'Nitrogen-based' = 'Nitrogen-based',
  'Phosphorus-based' = 'Phosphorus-based',
  'Potassium-based' = 'Potassium-based',
  'Organic' = 'Organic',
  'None' = 'None',
}

export interface Farmer {
  id: string;
  name: string;
}

export interface Land {
  id: string;
  farmerId: string;
  area: number; // hectares
  shape: string; // GeoJSON
  soilType: SoilType;
}

export interface PredictionFormData {
  cropType: CropType;
  fieldShape: string; // Will store GeoJSON string of the polygon
  soilType: SoilType;
  rainfall: number;
  temperature: number;
  pesticideUsage: boolean;
  fertilizerType: FertilizerType;
  area: number; // This will now be calculated from the map
  taskDescription: string;
  farmerId?: string;
  landId?: string;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  potentialYieldIncrease?: number;
}

export interface PredictionResult {
  predictedYield: number;
  yieldUnit: string;
  confidenceScore: number;
  summary: string;
  weatherImpactAnalysis: string;
  recommendations: Recommendation[];
  riskFactors: string[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  formData: PredictionFormData;
  result: PredictionResult;
}

export interface CropInfo {
  cropName: string;
  description: string;
  idealConditions: {
    soilType: string[];
    temperatureRange: string;
    annualRainfall: string;
  };
  commonPests: string[];
  growingCycle: string;
}

export type Page = 'predict' | 'farmers' | 'history' | 'analytics' | 'explorer' | 'about';

export interface WeatherDataPoint {
  month: string;
  value: number;
}

export interface HistoricalWeatherData {
  monthlyTemperature: WeatherDataPoint[];
  monthlyRainfall: WeatherDataPoint[];
}