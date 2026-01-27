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
  const [allChapters, setAllChapters] = useState([...sampleChapters]);
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Fetch saved chapters from backend on mount
  const fetchChapters = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/chapters`);
      const savedChapters = response.data || [];
      
      if (savedChapters.length > 0) {
        // Merge saved chapters with sample chapters
        setAllChapters([...sampleChapters, ...savedChapters]);
      }
    } catch (error) {
      console.log('No saved chapters found or API not available');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleStartReading = (chapterIndex = 0) => {
    setActiveChapterIndex(chapterIndex);
    setCurrentView('reader');
  };

  const handleBack = () => {
    setCurrentView('home');
    // Refresh chapters when coming back
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
    
    // Format the chapter to match the expected structure
    const formattedChapter = {
      id: chapter.id,
      title: chapter.title,
      subject: chapter.subject,
      description: chapter.description,
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
    };
    
    // Add the new chapter to the list
    setAllChapters(prev => [...prev, formattedChapter]);
    
    // Close creator and navigate to reader showing the new chapter
    setShowCreator(false);
    
    // Set to show the newly created chapter (last in list)
    setTimeout(() => {
      setActiveChapterIndex(allChapters.length); // Will be the new chapter's index
      setCurrentView('reader');
      toast.success('Chapter created successfully!');
    }, 100);
  };

  return (
    <div className="app-container min-h-screen bg-background">
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <HomePage
              key="home"
              onStartReading={() => handleStartReading(0)}
              onUploadContent={handleOpenCreator}
              chapters={allChapters}
              isLoading={isLoading}
            />
          )}
          
          {currentView === 'reader' && (
            <EbookReader
              key="reader"
              onBack={handleBack}
              chapters={allChapters}
              initialChapterIndex={activeChapterIndex}
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
