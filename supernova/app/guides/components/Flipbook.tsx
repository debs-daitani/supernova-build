'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { GuidePage, getGuideSections } from '../data/venued-guide';

interface FlipbookProps {
  title: string;
  pages: GuidePage[];
  backUrl?: string;
}

export default function Flipbook({ title, pages, backUrl = '/guides' }: FlipbookProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContents, setShowContents] = useState(false);

  const sections = getGuideSections(pages);

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex === currentPage || isAnimating) return;

    setDirection(pageIndex > currentPage ? 'next' : 'prev');
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentPage(pageIndex);
      setIsAnimating(false);
      setShowContents(false);
    }, 150);
  }, [currentPage, isAnimating]);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, pages.length, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(0);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(pages.length - 1);
  }, [pages.length, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'Home') {
        goToFirstPage();
      } else if (e.key === 'End') {
        goToLastPage();
      } else if (e.key === 'Escape') {
        setShowContents(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, goToFirstPage, goToLastPage]);

  const currentPageData = pages[currentPage];

  // Group pages by section for table of contents
  const tocSections = sections.map(section => ({
    name: section,
    pages: pages
      .map((page, index) => ({ ...page, index }))
      .filter(page => page.section === section)
  }));

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(backUrl)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Guides</span>
          </button>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <button
            onClick={() => setShowContents(!showContents)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            {showContents ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Table of Contents - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-[#1a1a1a] rounded-xl border border-[#3d3d3d] p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contents</h3>
            {tocSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4">
                <h4 className="text-xs font-semibold text-[#00F0E9] uppercase tracking-wider mb-2">
                  {section.name}
                </h4>
                <ul className="space-y-1">
                  {section.pages.map((page) => (
                    <li key={page.id}>
                      <button
                        onClick={() => goToPage(page.index)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentPage === page.index
                            ? 'bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 text-white border-l-2 border-[#00F0E9]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {page.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Table of Contents - Mobile Overlay */}
        {showContents && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
            <div className="h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Contents</h3>
                <button
                  onClick={() => setShowContents(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              {tocSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h4 className="text-xs font-semibold text-[#00F0E9] uppercase tracking-wider mb-3">
                    {section.name}
                  </h4>
                  <ul className="space-y-2">
                    {section.pages.map((page) => (
                      <li key={page.id}>
                        <button
                          onClick={() => goToPage(page.index)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-base transition-colors ${
                            currentPage === page.index
                              ? 'bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {page.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#3d3d3d] overflow-hidden">
            {/* Page Section Header */}
            <div className="px-6 py-3 bg-gradient-to-r from-[#FF008E]/10 to-[#00F0E9]/10 border-b border-[#3d3d3d]">
              <span className="text-xs font-semibold text-[#00F0E9] uppercase tracking-wider">
                {currentPageData.section}
              </span>
            </div>

            {/* Page Content with Animation */}
            <div className="relative min-h-[500px]">
              <div
                className={`p-6 md:p-8 transition-all duration-150 ease-out ${
                  isAnimating
                    ? direction === 'next'
                      ? 'opacity-0 translate-x-5'
                      : 'opacity-0 -translate-x-5'
                    : 'opacity-100 translate-x-0'
                }`}
              >
                <div
                  className="prose prose-invert max-w-none
                    [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-6
                    [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4
                    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#00F0E9] [&_h3]:mt-6 [&_h3]:mb-3
                    [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2
                    [&_li]:text-gray-300
                    [&_strong]:text-white [&_strong]:font-semibold
                    [&_em]:text-gray-400 [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: currentPageData.content }}
                />
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="px-6 py-4 bg-[#0d0d0d] border-t border-[#3d3d3d] flex items-center justify-between">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed
                  bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 0}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Go to first page"
                >
                  <Home size={18} />
                </button>
                <span className="text-gray-400 text-sm">
                  Page <span className="text-white font-medium">{currentPage + 1}</span> of{' '}
                  <span className="text-white font-medium">{pages.length}</span>
                </span>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === pages.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: currentPage === pages.length - 1 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #FF008E, #00F0E9)',
                  color: currentPage === pages.length - 1 ? 'white' : 'black'
                }}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="hidden md:flex justify-center mt-4 text-xs text-gray-500 gap-4">
            <span>Use arrow keys to navigate</span>
            <span>|</span>
            <span>Home/End for first/last page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
