import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PredictionPage from './pages/PredictionPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CropExplorerPage from './pages/CropExplorerPage';
import AboutPage from './pages/AboutPage';
import Chatbot from './components/Chatbot'; // Import the new component
import type { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('predict');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for chatbot

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'predict':
        return <PredictionPage />;
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
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>

      {/* Chatbot components */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-110"
          aria-label="Open chat assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default App;