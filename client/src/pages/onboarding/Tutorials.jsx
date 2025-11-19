import React, { useState, useEffect } from 'react';
import onboardingService from '../../services/onboarding';

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [playingTutorial, setPlayingTutorial] = useState(null);

  const categories = [
    { id: 'all', name: 'All Tutorials', icon: '📚' },
    { id: 'website', name: 'Website Builder', icon: '🌐' },
    { id: 'courses', name: 'Online Courses', icon: '🎓' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
    { id: 'crm', name: 'CRM & Sales', icon: '📊' },
    { id: 'marketing', name: 'Marketing', icon: '📣' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  useEffect(() => {
    loadTutorials();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTutorials(tutorials);
    } else {
      setFilteredTutorials(tutorials.filter(t => t.category === selectedCategory));
    }
  }, [selectedCategory, tutorials]);

  const loadTutorials = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getTutorials();
      setTutorials(data);
      setFilteredTutorials(data);
    } catch (error) {
      console.error('Failed to load tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (tutorial) => {
    setPlayingTutorial(tutorial);

    // Track view
    onboardingService.updateTutorialProgress(tutorial.id, {
      currentStep: 0,
      tutorialTitle: tutorial.title,
      totalSteps: tutorial.totalSteps,
      category: tutorial.category
    }).catch(err => console.error('Failed to track tutorial view:', err));
  };

  const handleClose = () => {
    setPlayingTutorial(null);
  };

  const handleBookmark = async (tutorial) => {
    try {
      const isBookmarked = tutorial.progress?.bookmarked;

      await onboardingService.updateTutorialProgress(tutorial.id, {
        bookmarked: !isBookmarked,
        tutorialTitle: tutorial.title,
        totalSteps: tutorial.totalSteps,
        category: tutorial.category
      });

      // Update local state
      setTutorials(tutorials.map(t =>
        t.id === tutorial.id
          ? {
              ...t,
              progress: {
                ...t.progress,
                bookmarked: !isBookmarked
              }
            }
          : t
      ));
    } catch (error) {
      console.error('Failed to bookmark tutorial:', error);
    }
  };

  const handleComplete = async (tutorial) => {
    try {
      await onboardingService.updateTutorialProgress(tutorial.id, {
        completed: true,
        currentStep: tutorial.totalSteps,
        tutorialTitle: tutorial.title,
        totalSteps: tutorial.totalSteps,
        category: tutorial.category
      });

      // Update local state
      setTutorials(tutorials.map(t =>
        t.id === tutorial.id
          ? {
              ...t,
              progress: {
                ...t.progress,
                completed: true,
                completedAt: new Date(),
                currentStep: tutorial.totalSteps
              }
            }
          : t
      ));

      alert('✅ Tutorial marked as complete!');
    } catch (error) {
      console.error('Failed to complete tutorial:', error);
    }
  };

  const getProgressPercent = (tutorial) => {
    if (!tutorial.progress) return 0;
    if (tutorial.progress.completed) return 100;
    return Math.round((tutorial.progress.currentStep / tutorial.totalSteps) * 100);
  };

  const completedCount = tutorials.filter(t => t.progress?.completed).length;
  const totalCount = tutorials.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Video Tutorials</h1>
            <p className="text-2xl text-purple-100 mb-6">
              Master every feature with our step-by-step guides
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div>
                <span className="font-bold text-3xl">{totalCount}</span>
                <span className="text-purple-100 ml-2">Tutorials</span>
              </div>
              <div className="h-8 w-px bg-white bg-opacity-30"></div>
              <div>
                <span className="font-bold text-3xl">{completedCount}</span>
                <span className="text-purple-100 ml-2">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const count = category.id === 'all'
                ? tutorials.length
                : tutorials.filter(t => t.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                  {count > 0 && (
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-white bg-opacity-20'
                        : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tutorials Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tutorials...</p>
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => {
              const progressPercent = getProgressPercent(tutorial);
              const isCompleted = tutorial.progress?.completed;
              const isBookmarked = tutorial.progress?.bookmarked;

              return (
                <div
                  key={tutorial.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    {tutorial.thumbnail ? (
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl text-white">▶️</div>
                    )}

                    {/* Play button */}
                    <button
                      onClick={() => handlePlay(tutorial)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all group"
                    >
                      <div className="bg-white rounded-full p-4 transform scale-100 group-hover:scale-110 transition-transform shadow-lg">
                        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(tutorial)}
                      className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
                    >
                      <svg
                        className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-600'}`}
                        fill={isBookmarked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>

                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Completed
                      </div>
                    )}

                    {/* Progress bar */}
                    {progressPercent > 0 && progressPercent < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 bg-opacity-50">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg flex-1">
                        {tutorial.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {tutorial.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tutorial.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                          {tutorial.totalSteps} steps
                        </div>
                      </div>

                      {!isCompleted && progressPercent > 0 && (
                        <button
                          onClick={() => handleComplete(tutorial)}
                          className="text-purple-600 hover:text-purple-700 font-semibold text-xs"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {playingTutorial.title}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {playingTutorial.videoUrl ? (
                <video
                  src={playingTutorial.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-xl">Video coming soon!</p>
                  <p className="text-gray-400 mt-2">This tutorial is currently being produced</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">{playingTutorial.description}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleComplete(playingTutorial)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Mark as Complete
                </button>
                <button
                  onClick={() => handleBookmark(playingTutorial)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    playingTutorial.progress?.bookmarked
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {playingTutorial.progress?.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
