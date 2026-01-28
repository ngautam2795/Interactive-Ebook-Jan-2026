"use client";

import { useState, useEffect, useCallback } from "react";
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function AppClient() {
  const [currentView, setCurrentView] = useState("home");
  const [savedChapters, setSavedChapters] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [homeTab, setHomeTab] = useState("demo");

  const allChapters = [...sampleChapters, ...savedChapters];

  const formatChapter = useCallback((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    subject: chapter.subject,
    description: chapter.description,
    created_at: chapter.created_at,
    favorite: chapter.favorite ?? false,
    topics: (chapter.topics || []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      subtitle: topic.subtitle || "Interactive Learning Content",
      content: topic.content,
      illustration: topic.illustration,
      hotspots: (topic.hotspots || []).map((hotspot) => ({
        id: hotspot.id,
        x: hotspot.x,
        y: hotspot.y,
        label: hotspot.label,
        icon: hotspot.icon || "sparkles",
        color: hotspot.color || "primary",
        title: hotspot.title,
        description: hotspot.description,
        funFact: hotspot.fun_fact || hotspot.funFact,
      })),
      annotations: topic.annotations || [],
    })),
  }), []);

  const fetchChapters = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/chapters`);
      const chapters = response.data || [];
      const formattedChapters = chapters.map(formatChapter);
      setSavedChapters(formattedChapters);
    } catch (error) {
      console.log("No saved chapters found or API not available:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formatChapter]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleStartReading = (chapterIndex = 0) => {
    const nextTab = chapterIndex >= sampleChapters.length ? "library" : "demo";
    setHomeTab(nextTab);
    setActiveChapterIndex(chapterIndex);
    setCurrentView("reader");
  };

  const handleBack = () => {
    setCurrentView("home");
    fetchChapters();
  };

  const handleGoLibrary = () => {
    setHomeTab("library");
    setCurrentView("home");
    fetchChapters();
  };

  const handleOpenCreator = () => {
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
  };

  const handleContentCreated = (chapter) => {
    const formattedChapter = formatChapter(chapter);
    setSavedChapters((prev) => [...prev, formattedChapter]);
    setShowCreator(false);

    const newIndex = sampleChapters.length + savedChapters.length;
    setTimeout(() => {
      setActiveChapterIndex(newIndex);
      setCurrentView("reader");
      toast.success("Chapter created and saved!");
    }, 100);
  };

  const handleDeleteChapter = (chapterId) => {
    setSavedChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
  };

  const handleToggleFavorite = (chapterId, favorite) => {
    setSavedChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, favorite } : chapter
      )
    );
  };

  const handleChaptersUpdate = () => {
    fetchChapters();
  };

  return (
    <div className="app-container min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentView === "home" && (
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

        {currentView === "reader" && (
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

      <AnimatePresence>
        {showCreator && (
          <ContentCreator onClose={handleCloseCreator} onContentCreated={handleContentCreated} />
        )}
      </AnimatePresence>

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default AppClient;
