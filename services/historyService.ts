import type { HistoryEntry } from '../types';

export const HISTORY_KEY = 'agriYieldHistory';

export const getHistory = (): HistoryEntry[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Failed to parse history from localStorage', error);
    return [];
  }
};

export const savePredictionToHistory = (entry: HistoryEntry): void => {
  try {
    const history = getHistory();
    // Add to the beginning of the array
    const updatedHistory = [entry, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
// FIX: Added curly braces to the catch block to correct syntax error.
    console.error('Failed to save prediction to localStorage', error);
  }
};

export const clearHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Failed to clear history from localStorage', error);
    }
};

export const deleteHistoryForFarmer = (farmerId: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(entry => entry.formData.farmerId !== farmerId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error(`Failed to delete history for farmer ${farmerId}`, error);
  }
};