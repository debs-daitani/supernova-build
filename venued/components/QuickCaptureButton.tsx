'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Lightbulb, CheckSquare, StickyNote } from 'lucide-react';

interface InboxItem {
  id: number;
  text: string;
  tag: 'task' | 'idea' | 'note' | null;
  timestamp: number;
  processed: boolean;
}

export default function QuickCaptureButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'task' | 'idea' | 'note' | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setText('');
        setSelectedTag(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSave = () => {
    if (!text.trim()) return;

    const item: InboxItem = {
      id: Date.now(),
      text: text.trim(),
      tag: selectedTag,
      timestamp: Date.now(),
      processed: false
    };

    // Get existing inbox items
    const existingItems = JSON.parse(localStorage.getItem('venued_inbox') || '[]');

    // Add new item to beginning
    const updatedItems = [item, ...existingItems];

    // Save to localStorage
    localStorage.setItem('venued_inbox', JSON.stringify(updatedItems));

    // Reset and close
    setText('');
    setSelectedTag(null);
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const tags = [
    { value: 'task' as const, label: 'Task', icon: CheckSquare, color: 'bg-neon-cyan text-black' },
    { value: 'idea' as const, label: 'Idea', icon: Lightbulb, color: 'bg-vivid-yellow-green text-black' },
    { value: 'note' as const, label: 'Note', icon: StickyNote, color: 'bg-vivid-pink text-black' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
        style={{
          backgroundColor: '#00F0E9',
          boxShadow: '0 0 20px rgba(255, 0, 142, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#D3FF2C';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 142, 0.8), 0 4px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#00F0E9';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 142, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)';
        }}
        aria-label="Quick Capture"
      >
        <Plus className="w-7 h-7 text-black" strokeWidth={3} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setText('');
              setSelectedTag(null);
            }
          }}
        >
          {/* Modal Content */}
          <div className="w-full max-w-md bg-dark-grey-azure rounded-2xl border border-magenta/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-supernova text-white">Quick Capture</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setText('');
                  setSelectedTag(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Capture your thought..."
                className="w-full h-32 p-4 bg-[#3d3d3d]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-magenta/50 focus:ring-1 focus:ring-magenta/30 font-josefin"
              />

              {/* Tag Selector */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400 font-josefin">Tag (optional)</p>
                <div className="flex gap-2">
                  {tags.map((tag) => {
                    const Icon = tag.icon;
                    const isSelected = selectedTag === tag.value;
                    return (
                      <button
                        key={tag.value}
                        onClick={() => setSelectedTag(isSelected ? null : tag.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          isSelected
                            ? tag.color
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keyboard Hint */}
              <p className="text-xs text-gray-500 text-center font-josefin">
                Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">Enter</kbd> to save
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: text.trim() ? '#FF008E' : '#666',
                  boxShadow: text.trim() ? '0 0 20px rgba(255, 0, 142, 0.4)' : 'none'
                }}
              >
                Capture It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
