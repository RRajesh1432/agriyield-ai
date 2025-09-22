import type { Farmer, Land } from '../types';
import { DEFAULT_FARMERS, DEFAULT_LANDS, DEFAULT_HISTORY } from './seedData';
import { HISTORY_KEY, deleteHistoryForFarmer } from './historyService';


const FARMERS_KEY = 'agriYieldFarmers';
const LANDS_KEY = 'agriYieldLands';

// Function to seed initial data if localStorage is empty
export const initializeAppData = () => {
  if (!localStorage.getItem(FARMERS_KEY) && !localStorage.getItem(LANDS_KEY)) {
    console.log("First time visit. Seeding default farm data...");
    localStorage.setItem(FARMERS_KEY, JSON.stringify(DEFAULT_FARMERS));
    localStorage.setItem(LANDS_KEY, JSON.stringify(DEFAULT_LANDS));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_HISTORY));
  }
};

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Farmer Functions
export const getFarmers = (): Farmer[] => {
  try {
    const farmersJson = localStorage.getItem(FARMERS_KEY);
    return farmersJson ? JSON.parse(farmersJson) : [];
  } catch (error) {
    console.error('Failed to parse farmers from localStorage', error);
    return [];
  }
};

export const saveFarmer = (farmerData: { name: string }): Farmer => {
  const farmers = getFarmers();
  const newFarmer: Farmer = { id: generateId(), ...farmerData };
  const updatedFarmers = [...farmers, newFarmer];
  localStorage.setItem(FARMERS_KEY, JSON.stringify(updatedFarmers));
  return newFarmer;
};

export const deleteFarmer = (farmerIdToDelete: string): void => {
  try {
    // 1. Delete associated history
    deleteHistoryForFarmer(farmerIdToDelete);

    // 2. Delete associated lands
    const currentLands = getLands();
    const updatedLands = currentLands.filter(land => land.farmerId !== farmerIdToDelete);
    localStorage.setItem(LANDS_KEY, JSON.stringify(updatedLands));

    // 3. Delete the farmer
    const currentFarmers = getFarmers();
    const updatedFarmers = currentFarmers.filter(farmer => farmer.id !== farmerIdToDelete);
    localStorage.setItem(FARMERS_KEY, JSON.stringify(updatedFarmers));

  } catch (error) {
    console.error(`Failed to delete farmer ${farmerIdToDelete} and their data`, error);
  }
};

// Land Functions
export const getLands = (): Land[] => {
  try {
    const landsJson = localStorage.getItem(LANDS_KEY);
    return landsJson ? JSON.parse(landsJson) : [];
  } catch (error) {
    console.error('Failed to parse lands from localStorage', error);
    return [];
  }
};

export const saveLand = (landData: Omit<Land, 'id'>): Land => {
  const lands = getLands();
  const newLand: Land = { id: generateId(), ...landData };
  const updatedLands = [...lands, newLand];
  localStorage.setItem(LANDS_KEY, JSON.stringify(updatedLands));
  return newLand;
};

export const getLandsForFarmer = (farmerId: string): Land[] => {
  const allLands = getLands();
  return allLands.filter(land => land.farmerId === farmerId);
};
