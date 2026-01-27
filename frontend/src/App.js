import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

// Pages
import { HomePage } from "@/pages/HomePage";
import { EbookReader } from "@/components/ebook/EbookReader";
import { ContentCreator } from "@/components/creator/ContentCreator";

// Data
import { sampleChapters } from "@/data/sampleContent";

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'reader', 'uploader'
  const [customChapters, setCustomChapters] = useState(null);
  const [showCreator, setShowCreator] = useState(false);

  const handleStartReading = () => {
    setCurrentView('reader');
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  const handleOpenCreator = () => {
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
  };

  const handleContentCreated = (chapter) => {
    // Add the new chapter to custom chapters
    setCustomChapters(prev => prev ? [...prev, chapter] : [chapter]);
    setShowCreator(false);
    setCurrentView('reader');
  };

  return (
    <div className="app-container min-h-screen bg-background">
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <HomePage
              key="home"
              onStartReading={handleStartReading}
              onUploadContent={handleOpenCreator}
            />
          )}
          
          {currentView === 'reader' && (
            <EbookReader
              key="reader"
              onBack={handleBack}
              chapters={customChapters || sampleChapters}
            />
          )}
        </AnimatePresence>

        {/* Content Creator Modal */}
        <AnimatePresence>
          {showCreator && (
            <ContentCreator
              onClose={handleCloseCreator}
              onContentCreated={handleContentCreated}
            />
          )}
        </AnimatePresence>

        {/* Toast notifications */}
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
