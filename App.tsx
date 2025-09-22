import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PredictionPage from './pages/PredictionPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CropExplorerPage from './pages/CropExplorerPage';
import AboutPage from './pages/AboutPage';
import FarmersPage from './pages/FarmersPage';
import LandDetailPage from './pages/LandDetailPage';
import type { Page } from './types';
import { initializeAppData } from './services/farmService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('predict');
  const [selectedLand, setSelectedLand] = useState<{ landId: string; farmerId: string } | null>(null);

  useEffect(() => {
    // Pre-populate app with default data if it's the first visit
    initializeAppData();
  }, []);

  const handleSetCurrentPage = (page: Page) => {
    setCurrentPage(page);
    setSelectedLand(null); // Reset land view when navigating
  };

  const handleSelectLand = (landId: string, farmerId: string) => {
    setSelectedLand({ landId, farmerId });
  };

  const renderPage = useCallback(() => {
    if (selectedLand) {
      return <LandDetailPage 
        landId={selectedLand.landId} 
        farmerId={selectedLand.farmerId} 
        onBack={() => setSelectedLand(null)} 
      />;
    }

    switch (currentPage) {
      case 'predict':
        return <PredictionPage />;
      case 'farmers':
        return <FarmersPage onSelectLand={handleSelectLand} />;
      case 'history':
        return <HistoryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'explorer':
        return <CropExplorerPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <PredictionPage />;
    }
  }, [currentPage, selectedLand]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header currentPage={currentPage} setCurrentPage={handleSetCurrentPage} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;