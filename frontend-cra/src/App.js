import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import axios from "axios";

// Pages
import { HomePage } from "@/pages/HomePage";
import { EbookReader } from "@/components/ebook/EbookReader";
import { ContentCreator } from "@/components/creator/ContentCreator";

// Data
import { sampleChapters } from "@/data/sampleContent";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'reader'
  const [savedChapters, setSavedChapters] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [homeTab, setHomeTab] = useState('demo');

  // All chapters = sample + saved
  const allChapters = [...sampleChapters, ...savedChapters];

  // Format chapter from API to match expected structure
  const formatChapter = useCallback((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    subject: chapter.subject,
    description: chapter.description,
    created_at: chapter.created_at,
    favorite: chapter.favorite ?? false,
    topics: (chapter.topics || []).map(topic => ({
      id: topic.id,
      title: topic.title,
      subtitle: topic.subtitle || 'Interactive Learning Content',
      content: topic.content,
      illustration: topic.illustration,
      hotspots: (topic.hotspots || []).map(h => ({
        id: h.id,
        x: h.x,
        y: h.y,
        label: h.label,
        icon: h.icon || 'sparkles',
        color: h.color || 'primary',
        title: h.title,
        description: h.description,
        funFact: h.fun_fact || h.funFact
      })),
      annotations: topic.annotations || []
    }))
  }), []);

  // Fetch saved chapters from backend
  const fetchChapters = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/chapters`);
      const chapters = response.data || [];
      
      // Format chapters to match expected structure
      const formattedChapters = chapters.map(formatChapter);
      setSavedChapters(formattedChapters);
    } catch (error) {
      console.log('No saved chapters found or API not available:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formatChapter]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleStartReading = (chapterIndex = 0) => {
    const nextTab = chapterIndex >= sampleChapters.length ? 'library' : 'demo';
    setHomeTab(nextTab);
    setActiveChapterIndex(chapterIndex);
    setCurrentView('reader');
  };

  const handleBack = () => {
    setCurrentView('home');
    // Refresh chapters when coming back
    fetchChapters();
  };

  const handleGoLibrary = () => {
    setHomeTab('library');
    setCurrentView('home');
    fetchChapters();
  };

  const handleOpenCreator = () => {
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
  };

  const handleContentCreated = (chapter) => {
    console.log('Content created:', chapter);
    
    // Format and add the new chapter
    const formattedChapter = formatChapter(chapter);
    setSavedChapters(prev => [...prev, formattedChapter]);
    
    // Close creator and navigate to reader showing the new chapter
    setShowCreator(false);
    
    // Set to show the newly created chapter (last in list)
    const newIndex = sampleChapters.length + savedChapters.length;
    setTimeout(() => {
      setActiveChapterIndex(newIndex);
      setCurrentView('reader');
      toast.success('Chapter created and saved!');
    }, 100);
  };

  const handleDeleteChapter = (chapterId) => {
    // Remove from local state
    setSavedChapters(prev => prev.filter(ch => ch.id !== chapterId));
  };

  const handleToggleFavorite = (chapterId, favorite) => {
    setSavedChapters(prev => prev.map(ch => (
      ch.id === chapterId ? { ...ch, favorite } : ch
    )));
  };

  const handleChaptersUpdate = (updatedChapters) => {
    // Refresh from server to get latest data
    fetchChapters();
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
              savedChapters={savedChapters}
              onRefreshChapters={fetchChapters}
              onDeleteChapter={handleDeleteChapter}
              onToggleFavorite={handleToggleFavorite}
              initialTab={homeTab}
              onTabChange={setHomeTab}
              isLoading={isLoading}
            />
          )}
          
          {currentView === 'reader' && (
            <EbookReader
              key="reader"
              onBack={handleBack}
              onGoLibrary={handleGoLibrary}
              chapters={allChapters}
              initialChapterIndex={activeChapterIndex}
              onChaptersUpdate={handleChaptersUpdate}
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
