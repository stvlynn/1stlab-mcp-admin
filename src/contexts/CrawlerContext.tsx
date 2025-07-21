import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CrawlerProgress {
  isRunning: boolean;
  currentPage: number;
  totalPages: number;
  currentPageProjects: number;
  totalImported: number;
  error: string | null;
  message: string;
}

interface CrawlerContextType {
  progress: CrawlerProgress;
  startCrawl: () => void;
  updateProgress: (updates: Partial<CrawlerProgress>) => void;
  resetProgress: () => void;
}

const CrawlerContext = createContext<CrawlerContextType | undefined>(undefined);

const initialProgress: CrawlerProgress = {
  isRunning: false,
  currentPage: 0,
  totalPages: 0,
  currentPageProjects: 0,
  totalImported: 0,
  error: null,
  message: '',
};

export const CrawlerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<CrawlerProgress>(initialProgress);

  const startCrawl = () => {
    setProgress({
      ...initialProgress,
      isRunning: true,
      message: 'Starting crawler...',
    });
  };

  const updateProgress = (updates: Partial<CrawlerProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const resetProgress = () => {
    setProgress(initialProgress);
  };

  return (
    <CrawlerContext.Provider value={{ progress, startCrawl, updateProgress, resetProgress }}>
      {children}
    </CrawlerContext.Provider>
  );
};

export const useCrawler = () => {
  const context = useContext(CrawlerContext);
  if (!context) {
    throw new Error('useCrawler must be used within a CrawlerProvider');
  }
  return context;
};