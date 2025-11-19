import React, { useState, useEffect } from 'react';
import testimonialsService from '../../services/testimonials';

/**
 * TestimonialWidget - Flexible testimonial display component
 *
 * Props:
 * - widgetId: (optional) ID of a pre-configured widget from the database
 * - type: 'carousel' | 'grid' | 'single' | 'wall' (default: 'carousel')
 * - category: Filter by category
 * - featuredOnly: Show only featured testimonials
 * - minRating: Minimum rating to display
 * - maxItems: Maximum number of testimonials to show
 * - showPhoto: Show author photos
 * - showRating: Show star ratings
 * - showRole: Show author role/company
 * - theme: 'light' | 'dark'
 */
export default function TestimonialWidget({
  widgetId,
  type = 'carousel',
  category,
  featuredOnly = false,
  minRating,
  maxItems = 3,
  showPhoto = true,
  showRating = true,
  showRole = true,
  theme = 'light',
  autoRotate = true,
  rotateInterval = 5000
}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [widgetConfig, setWidgetConfig] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, [widgetId, category, featuredOnly, minRating]);

  useEffect(() => {
    if (type === 'carousel' && autoRotate && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [type, autoRotate, rotateInterval, testimonials.length]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);

      if (widgetId) {
        // Load widget configuration and testimonials
        const data = await testimonialsService.renderWidget(widgetId);
        setWidgetConfig(data.widget);
        setTestimonials(data.testimonials || []);
      } else {
        // Load testimonials with custom params
        const params = { limit: maxItems };
        if (category) params.category = category;
        if (featuredOnly) params.featured = true;
        if (minRating) params.minRating = minRating;

        const data = await testimonialsService.getTestimonials(params);
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use widget config if available
  const config = widgetConfig || {
    widgetType: type,
    showPhoto,
    showRating,
    showRole,
    theme,
    maxItems
  };

  const renderStars = (rating) => {
    if (!rating || !config.showRating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderTestimonialCard = (testimonial, index) => {
    const isDark = config.theme === 'dark';

    return (
      <div
        key={testimonial.id}
        className={`${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-lg shadow-lg p-6`}
      >
        {/* Rating */}
        {config.showRating && testimonial.rating && (
          <div className="mb-4">{renderStars(testimonial.rating)}</div>
        )}

        {/* Content */}
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed italic`}>
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center">
          {config.showPhoto && testimonial.authorPhoto ? (
            <img
              src={testimonial.authorPhoto}
              alt={testimonial.authorName}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
          ) : config.showPhoto ? (
            <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-purple-900' : 'bg-purple-100'} flex items-center justify-center mr-4`}>
              <span className={`${isDark ? 'text-purple-300' : 'text-purple-600'} font-semibold text-lg`}>
                {testimonial.authorName.charAt(0)}
              </span>
            </div>
          ) : null}
          <div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {testimonial.authorName}
            </div>
            {config.showRole && testimonial.authorRole && (
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {testimonial.authorRole}
                {testimonial.authorCompany && ` at ${testimonial.authorCompany}`}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show anything if no testimonials
  }

  // Carousel Layout
  if (config.widgetType === 'carousel') {
    return (
      <div className="relative">
        {renderTestimonialCard(testimonials[currentIndex], currentIndex)}

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-purple-600 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
              className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid Layout
  if (config.widgetType === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => renderTestimonialCard(testimonial, index))}
      </div>
    );
  }

  // Single Layout
  if (config.widgetType === 'single') {
    return renderTestimonialCard(testimonials[0], 0);
  }

  // Wall Layout (compact grid)
  if (config.widgetType === 'wall') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`${
              config.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } rounded-lg shadow p-4`}
          >
            {config.showRating && testimonial.rating && (
              <div className="mb-2">{renderStars(testimonial.rating)}</div>
            )}
            <p className={`text-sm ${config.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3 line-clamp-3`}>
              "{testimonial.content}"
            </p>
            <div className="text-sm">
              <div className="font-semibold">{testimonial.authorName}</div>
              {config.showRole && testimonial.authorRole && (
                <div className={`text-xs ${config.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {testimonial.authorRole}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
