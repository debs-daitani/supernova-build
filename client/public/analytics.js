/**
 * Client-Side Analytics Tracking Library
 * Include this script on your website to automatically track events
 *
 * Usage:
 * <script src="/analytics.js"></script>
 * <script>
 *   Analytics.init({ apiUrl: '/api/analytics' });
 * </script>
 */

(function(window) {
  'use strict';

  // Configuration
  const config = {
    apiUrl: '/api/analytics',
    autoTrack: true,
    trackClicks: true,
    trackForms: true,
    trackScrollDepth: true,
    trackVideos: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    debug: false
  };

  // State
  let sessionId = null;
  let pageViewId = null;
  let scrollDepthTracked = new Set();
  let hasConsent = true; // Default to true, update based on consent management

  /**
   * Generate unique ID
   */
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get or create session ID
   */
  function getSessionId() {
    if (sessionId) return sessionId;

    // Check localStorage
    const stored = localStorage.getItem('analytics_session');
    const timestamp = localStorage.getItem('analytics_session_time');

    if (stored && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < config.sessionTimeout) {
        sessionId = stored;
        updateSessionTimestamp();
        return sessionId;
      }
    }

    // Create new session
    sessionId = generateId();
    localStorage.setItem('analytics_session', sessionId);
    updateSessionTimestamp();

    // Initialize session on server
    initializeSession();

    return sessionId;
  }

  /**
   * Update session timestamp
   */
  function updateSessionTimestamp() {
    localStorage.setItem('analytics_session_time', Date.now().toString());
  }

  /**
   * Get or create cookie ID (for consent tracking)
   */
  function getCookieId() {
    let cookieId = localStorage.getItem('analytics_cookie_id');
    if (!cookieId) {
      cookieId = generateId();
      localStorage.setItem('analytics_cookie_id', cookieId);
    }
    return cookieId;
  }

  /**
   * Extract UTM parameters from URL
   */
  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    return Object.keys(utm).length > 0 ? utm : null;
  }

  /**
   * Send event to server
   */
  async function sendEvent(eventData) {
    if (!hasConsent) {
      if (config.debug) console.log('Analytics: Tracking disabled (no consent)');
      return;
    }

    try {
      updateSessionTimestamp();

      const data = {
        sessionId: getSessionId(),
        ...eventData,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${config.apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (config.debug) {
        console.log('Analytics event tracked:', data);
      }

      return await response.json();
    } catch (error) {
      if (config.debug) {
        console.error('Analytics tracking error:', error);
      }
    }
  }

  /**
   * Initialize session on server
   */
  async function initializeSession() {
    try {
      await fetch(`${config.apiUrl}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: getSessionId(),
          landingPage: window.location.pathname,
          referrer: document.referrer || null,
          utmParams: getUtmParams()
        })
      });
    } catch (error) {
      if (config.debug) {
        console.error('Session initialization error:', error);
      }
    }
  }

  /**
   * Track page view
   */
  function trackPageView() {
    pageViewId = generateId();

    sendEvent({
      eventType: 'page_view',
      eventCategory: 'website',
      eventAction: 'view',
      pagePath: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer || null,
      utmParams: getUtmParams()
    });
  }

  /**
   * Track custom event
   */
  function track(eventType, eventData = {}) {
    const {
      category = 'custom',
      action = eventType,
      label = null,
      value = null,
      metadata = null
    } = eventData;

    sendEvent({
      eventType,
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      metadata
    });
  }

  /**
   * Track click event
   */
  function trackClick(element) {
    const tagName = element.tagName.toLowerCase();
    const href = element.getAttribute('href');
    const text = element.textContent?.trim().substring(0, 100);
    const id = element.id;
    const classes = element.className;

    sendEvent({
      eventType: 'click',
      eventCategory: 'engagement',
      eventAction: 'click',
      eventLabel: text || id || href,
      pagePath: window.location.pathname,
      metadata: {
        tagName,
        href,
        id,
        classes
      }
    });
  }

  /**
   * Track form submission
   */
  function trackFormSubmit(form) {
    const formId = form.id || form.name || 'unnamed';
    const action = form.action;

    sendEvent({
      eventType: 'form_submit',
      eventCategory: 'engagement',
      eventAction: 'submit',
      eventLabel: formId,
      pagePath: window.location.pathname,
      metadata: {
        formId,
        action
      }
    });
  }

  /**
   * Track scroll depth
   */
  function trackScrollDepth(percentage) {
    if (scrollDepthTracked.has(percentage)) return;

    scrollDepthTracked.add(percentage);

    sendEvent({
      eventType: 'scroll',
      eventCategory: 'engagement',
      eventAction: 'scroll',
      eventLabel: `${percentage}%`,
      eventValue: percentage,
      pagePath: window.location.pathname
    });
  }

  /**
   * Track video play
   */
  function trackVideoPlay(video) {
    const src = video.src || video.currentSrc;

    sendEvent({
      eventType: 'video_play',
      eventCategory: 'engagement',
      eventAction: 'play',
      eventLabel: src,
      pagePath: window.location.pathname,
      metadata: {
        duration: video.duration,
        currentTime: video.currentTime
      }
    });
  }

  /**
   * Setup auto-tracking
   */
  function setupAutoTracking() {
    // Track page view on load
    trackPageView();

    // Track clicks
    if (config.trackClicks) {
      document.addEventListener('click', (e) => {
        const element = e.target.closest('a, button');
        if (element) {
          trackClick(element);
        }
      }, true);
    }

    // Track form submissions
    if (config.trackForms) {
      document.addEventListener('submit', (e) => {
        trackFormSubmit(e.target);
      }, true);
    }

    // Track scroll depth
    if (config.trackScrollDepth) {
      let ticking = false;

      function checkScrollDepth() {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        // Track at 25%, 50%, 75%, 100%
        [25, 50, 75, 100].forEach(threshold => {
          if (scrollPercentage >= threshold) {
            trackScrollDepth(threshold);
          }
        });

        ticking = false;
      }

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(checkScrollDepth);
          ticking = true;
        }
      });
    }

    // Track video plays
    if (config.trackVideos) {
      document.addEventListener('play', (e) => {
        if (e.target.tagName === 'VIDEO') {
          trackVideoPlay(e.target);
        }
      }, true);
    }

    // Track page visibility (when user leaves/returns)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - could end session here
        updateSessionTimestamp();
      } else {
        // Page is visible again
        updateSessionTimestamp();
      }
    });

    // End session on page unload
    window.addEventListener('beforeunload', () => {
      // Send beacon to end session
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${config.apiUrl}/session/${getSessionId()}/end`,
          JSON.stringify({})
        );
      }
    });
  }

  /**
   * Initialize analytics
   */
  function init(options = {}) {
    // Merge options with config
    Object.assign(config, options);

    // Check consent
    const cookieId = getCookieId();
    // In a real implementation, check consent status from server or localStorage
    // For now, assume consent is granted

    if (config.debug) {
      console.log('Analytics initialized', { sessionId: getSessionId(), config });
    }

    // Setup auto-tracking
    if (config.autoTrack) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAutoTracking);
      } else {
        setupAutoTracking();
      }
    }
  }

  /**
   * Consent management
   */
  function setConsent(granted) {
    hasConsent = granted;
    const cookieId = getCookieId();

    // Update consent on server
    fetch(`${config.apiUrl}/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cookieId,
        hasConsented: granted
      })
    }).catch(err => {
      if (config.debug) {
        console.error('Consent update error:', err);
      }
    });
  }

  /**
   * Opt out of tracking
   */
  function optOut() {
    hasConsent = false;
    const cookieId = getCookieId();

    // Update opt-out status on server
    fetch(`${config.apiUrl}/opt-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cookieId })
    }).catch(err => {
      if (config.debug) {
        console.error('Opt-out error:', err);
      }
    });

    // Clear local data
    localStorage.removeItem('analytics_session');
    localStorage.removeItem('analytics_session_time');
  }

  /**
   * Track funnel step
   */
  function trackFunnelStep(funnelId, step) {
    fetch(`${config.apiUrl}/funnels/${funnelId}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        step
      })
    }).catch(err => {
      if (config.debug) {
        console.error('Funnel tracking error:', err);
      }
    });
  }

  // Public API
  window.Analytics = {
    init,
    track,
    trackPageView,
    setConsent,
    optOut,
    trackFunnelStep,
    getSessionId
  };

  // Auto-initialize if data-auto-init attribute is present
  const script = document.currentScript;
  if (script && script.getAttribute('data-auto-init') !== 'false') {
    init();
  }

})(window);
