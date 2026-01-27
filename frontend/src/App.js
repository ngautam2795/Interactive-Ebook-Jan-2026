import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

// Pages
import { HomePage } from "@/pages/HomePage";
import { EbookReader } from "@/components/ebook/EbookReader";
import { ContentUploader } from "@/components/upload/ContentUploader";

// Data
import { sampleChapters } from "@/data/sampleContent";

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'reader', 'uploader'
  const [customChapters, setCustomChapters] = useState(null);
  const [showUploader, setShowUploader] = useState(false);

  const handleStartReading = () => {
    setCurrentView('reader');
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  const handleOpenUploader = () => {
    setShowUploader(true);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
  };

  const handleContentParsed = (chapters) => {
    setCustomChapters(chapters);
    setShowUploader(false);
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
              onUploadContent={handleOpenUploader}
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

        {/* Content Uploader Modal */}
        <AnimatePresence>
          {showUploader && (
            <ContentUploader
              onClose={handleCloseUploader}
              onContentParsed={handleContentParsed}
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
