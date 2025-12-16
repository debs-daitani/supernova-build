// ============================================
// VENUED Landing Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initScrollAnimations();
    initSmoothScroll();
    initCTATracking();
    initScrollDepthTracking();
    initNavbarScroll();
});

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    // Add fade-in class to elements we want to animate
    const animatedElements = document.querySelectorAll(
        '.problem-card, .feature-block, .dv-feature, .rock-terminology, .entourage-item'
    );

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all animated elements
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// CTA Click Tracking
// ============================================
function initCTATracking() {
    const ctaButtons = document.querySelectorAll('.cta-button, .nav-cta');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonLocation = getButtonLocation(this);

            // Track the click
            trackEvent('cta_click', {
                button_text: buttonText,
                button_location: buttonLocation,
                destination_url: this.href
            });

            // Log for debugging
            console.log('CTA Click:', {
                button_text: buttonText,
                button_location: buttonLocation,
                destination_url: this.href
            });
        });
    });
}

function getButtonLocation(button) {
    // Determine which section the button is in
    const sections = ['hero', 'problem', 'solution', 'features', 'daitaniverse', 'final-cta', 'nav'];

    for (const section of sections) {
        if (button.closest(`.${section}`) || button.closest(`section.${section}`) || button.closest(`.${section}-cta`)) {
            return section;
        }
    }

    if (button.classList.contains('nav-cta')) {
        return 'navigation';
    }

    return 'unknown';
}

// ============================================
// Scroll Depth Tracking
// ============================================
function initScrollDepthTracking() {
    const thresholds = [25, 50, 75, 100];
    const tracked = new Set();

    function getScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        return Math.round((scrollTop / documentHeight) * 100);
    }

    function checkScrollDepth() {
        const scrollPercentage = getScrollPercentage();

        thresholds.forEach(threshold => {
            if (scrollPercentage >= threshold && !tracked.has(threshold)) {
                tracked.add(threshold);
                trackEvent('scroll_depth', {
                    depth_percentage: threshold
                });
                console.log('Scroll Depth:', threshold + '%');
            }
        });
    }

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                checkScrollDepth();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// Navbar Scroll Effect
// ============================================
function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.scrollY;

        // Add shadow when scrolled
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.boxShadow = 'none';
        }

        // Hide/show navbar on scroll direction (optional - commented out for now)
        // if (currentScroll > lastScroll && currentScroll > 100) {
        //     nav.style.transform = 'translateY(-100%)';
        // } else {
        //     nav.style.transform = 'translateY(0)';
        // }

        lastScroll = currentScroll;
    });
}

// ============================================
// Analytics Helper
// ============================================
function trackEvent(eventName, eventData) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }

    // Vercel Analytics (if using)
    if (typeof va !== 'undefined') {
        va('event', { name: eventName, data: eventData });
    }

    // Custom analytics endpoint (optional)
    // You can add your own analytics tracking here
    // fetch('/api/analytics', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ event: eventName, data: eventData, timestamp: new Date().toISOString() })
    // });
}

// ============================================
// UTM Parameter Handling
// ============================================
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const utmData = {};

    utmParams.forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            utmData[param] = value;
        }
    });

    if (Object.keys(utmData).length > 0) {
        // Store UTM params in session storage
        sessionStorage.setItem('venued_utm', JSON.stringify(utmData));

        // Track page view with UTM data
        trackEvent('page_view', {
            page_location: window.location.href,
            page_title: document.title,
            ...utmData
        });

        // Append UTM params to all CTA links
        document.querySelectorAll('.cta-button, .nav-cta').forEach(link => {
            if (link.href && link.href.includes('daitaniverse.space')) {
                const url = new URL(link.href);
                Object.entries(utmData).forEach(([key, value]) => {
                    url.searchParams.set(key, value);
                });
                link.href = url.toString();
            }
        });

        console.log('UTM Parameters:', utmData);
    }
})();

// ============================================
// Page Load Performance
// ============================================
window.addEventListener('load', function() {
    // Track page load time
    if (window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        trackEvent('page_load', {
            load_time_ms: loadTime
        });
        console.log('Page load time:', loadTime + 'ms');
    }
});

// ============================================
// Keyboard Navigation
// ============================================
document.addEventListener('keydown', function(e) {
    // Escape key to go back to top
    if (e.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ============================================
// Prefers Reduced Motion
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-normal', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');

    // Remove floating animation from dashboard preview
    const dashboardPreview = document.querySelector('.dashboard-preview');
    if (dashboardPreview) {
        dashboardPreview.style.animation = 'none';
    }
}

console.log('VENUED Landing Page loaded successfully');
