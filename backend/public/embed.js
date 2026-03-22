(function() {
  'use strict';

  // Config - with fallback if document.currentScript doesn't work
  var SCRIPT_TAG = document.currentScript ||
                   document.querySelector('script[src*="embed.js"]') ||
                   document.querySelector('script[data-api-key]');

  var API_KEY = SCRIPT_TAG?.getAttribute('data-api-key') || '';
  var API_URL = (SCRIPT_TAG?.getAttribute('data-api-url') || 'https://webflowwidget-production.up.railway.app').replace(/\/+$/, '');

  if (!API_KEY) {
    console.error('[Feedback Widget] Missing data-api-key attribute. SCRIPT_TAG:', SCRIPT_TAG);
    return;
  }

  // State
  var isActive = false;
  var screenshotDataUrl = null;
  var pinX = null;
  var pinY = null;
  var html2canvasLoaded = false;
  var tierFeatures = null; // loaded from API, used to gate widget features

  // Touch detection
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // Load html2canvas dynamically
  function loadHtml2Canvas() {
    if (html2canvasLoaded || typeof html2canvas !== 'undefined') {
      html2canvasLoaded = true;
      return Promise.resolve();
    }
    return new Promise(function(resolve) {
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = function() { html2canvasLoaded = true; resolve(); };
      script.onerror = function() { console.warn('[Feedback Widget] Could not load html2canvas'); resolve(); };
      document.head.appendChild(script);
    });
  }

  // Preload html2canvas in background
  loadHtml2Canvas();

  // Fetch tier info for feature gating
  function loadTierInfo() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_URL + '/feedback/tier?apiKey=' + encodeURIComponent(API_KEY));
    xhr.onload = function() {
      try {
        if (xhr.status === 200) {
          tierFeatures = JSON.parse(xhr.responseText);
        }
      } catch(e) { /* tier info not critical */ }
    };
    xhr.send();
  }
  loadTierInfo();

  // Check if a feature is available in the current tier
  function hasTierFeature(feature) {
    if (!tierFeatures || !tierFeatures.features) return false;
    return tierFeatures.features.indexOf(feature) !== -1;
  }

  // Styles
  var STYLES = '\
    .wf-feedback-btn {\
      position: fixed;\
      bottom: 20px;\
      right: 20px;\
      z-index: 2147483640;\
      width: 48px;\
      height: 48px;\
      border-radius: 50%;\
      background: #000;\
      color: #fff;\
      border: none;\
      cursor: pointer;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);\
      transition: transform 0.2s, box-shadow 0.2s;\
      font-size: 20px;\
      line-height: 1;\
      touch-action: manipulation;\
      -webkit-tap-highlight-color: transparent;\
      user-select: none;\
      -webkit-user-select: none;\
    }\
    .wf-feedback-btn:active {\
      transform: scale(0.95);\
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);\
    }\
    @media (hover: hover) and (pointer: fine) {\
      .wf-feedback-btn:hover {\
        transform: scale(1.05);\
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);\
      }\
    }\
    .wf-feedback-overlay {\
      position: fixed;\
      inset: 0;\
      z-index: 2147483641;\
      cursor: crosshair;\
      background: transparent;\
      touch-action: none;\
    }\
    .wf-feedback-pin {\
      position: fixed;\
      width: 24px;\
      height: 24px;\
      background: #ef4444;\
      border: 2px solid #fff;\
      border-radius: 50%;\
      transform: translate(-50%, -50%);\
      z-index: 2147483642;\
      pointer-events: none;\
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);\
    }\
    .wf-feedback-modal {\
      position: fixed;\
      z-index: 2147483643;\
      background: #fff;\
      border-radius: 12px;\
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);\
      width: 360px;\
      max-width: calc(100vw - 32px);\
      max-height: calc(100vh - 32px);\
      overflow-y: auto;\
      -webkit-overflow-scrolling: touch;\
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
      transition: transform 0.2s ease-out, opacity 0.2s ease-out;\
      will-change: transform;\
    }\
    .wf-feedback-modal[aria-hidden="true"] {\
      display: none;\
    }\
    .wf-feedback-modal-header {\
      padding: 16px 20px;\
      border-bottom: 1px solid #e5e7eb;\
      display: flex;\
      justify-content: space-between;\
      align-items: center;\
    }\
    .wf-feedback-modal-header h3 {\
      margin: 0;\
      font-size: 16px;\
      font-weight: 600;\
      color: #111;\
    }\
    .wf-feedback-swipe-handle {\
      display: none;\
      width: 36px;\
      height: 4px;\
      background: #d1d5db;\
      border-radius: 2px;\
      margin: 8px auto 0;\
    }\
    .wf-feedback-close {\
      background: none;\
      border: none;\
      font-size: 20px;\
      cursor: pointer;\
      color: #9ca3af;\
      padding: 4px;\
      min-width: 48px;\
      min-height: 48px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      line-height: 1;\
      touch-action: manipulation;\
      -webkit-tap-highlight-color: transparent;\
      border-radius: 8px;\
    }\
    .wf-feedback-close:active { background: #f3f4f6; }\
    @media (hover: hover) and (pointer: fine) {\
      .wf-feedback-close:hover { color: #374151; background: #f3f4f6; }\
    }\
    .wf-feedback-modal-body { padding: 20px; }\
    .wf-feedback-screenshot {\
      width: 100%;\
      border-radius: 8px;\
      border: 1px solid #e5e7eb;\
      margin-bottom: 12px;\
      position: relative;\
    }\
    .wf-feedback-screenshot img {\
      width: 100%;\
      display: block;\
      border-radius: 8px;\
    }\
    .wf-feedback-textarea {\
      width: 100%;\
      min-height: 80px;\
      padding: 12px 14px;\
      border: 1px solid #d1d5db;\
      border-radius: 8px;\
      font-size: 16px;\
      font-family: inherit;\
      resize: vertical;\
      outline: none;\
      box-sizing: border-box;\
      -webkit-appearance: none;\
      -moz-appearance: none;\
      appearance: none;\
    }\
    .wf-feedback-textarea:focus {\
      border-color: #000;\
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);\
    }\
    .wf-feedback-submit {\
      width: 100%;\
      padding: 14px;\
      margin-top: 12px;\
      background: #000;\
      color: #fff;\
      border: none;\
      border-radius: 8px;\
      font-size: 16px;\
      font-weight: 500;\
      cursor: pointer;\
      font-family: inherit;\
      min-height: 48px;\
      touch-action: manipulation;\
      -webkit-tap-highlight-color: transparent;\
      -webkit-appearance: none;\
    }\
    .wf-feedback-submit:active { background: #374151; }\
    @media (hover: hover) and (pointer: fine) {\
      .wf-feedback-submit:hover { background: #1f2937; }\
    }\
    .wf-feedback-submit:disabled { opacity: 0.5; cursor: not-allowed; }\
    .wf-feedback-success {\
      text-align: center;\
      padding: 24px 20px;\
      color: #059669;\
      font-size: 14px;\
    }\
    .wf-feedback-hint {\
      position: fixed;\
      top: 20px;\
      left: 50%;\
      transform: translateX(-50%);\
      z-index: 2147483642;\
      background: #000;\
      color: #fff;\
      padding: 10px 20px;\
      border-radius: 8px;\
      font-size: 14px;\
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);\
      text-align: center;\
      max-width: calc(100vw - 40px);\
    }\
    .wf-feedback-backdrop {\
      display: none;\
      position: fixed;\
      inset: 0;\
      z-index: 2147483642;\
      background: rgba(0,0,0,0.3);\
    }\
    \
    /* Mobile: < 480px */\
    @media (max-width: 479px) {\
      .wf-feedback-modal {\
        bottom: 0 !important;\
        left: 0 !important;\
        right: 0 !important;\
        top: auto !important;\
        width: 100%;\
        max-width: 100%;\
        max-height: 85vh;\
        border-radius: 16px 16px 0 0;\
      }\
      .wf-feedback-swipe-handle { display: block; }\
      .wf-feedback-backdrop { display: block; }\
      .wf-feedback-modal-body { padding: 16px; }\
      .wf-feedback-textarea { min-height: 60px; }\
    }\
    \
    /* Small mobile / large phone: 480-640px */\
    @media (min-width: 480px) and (max-width: 640px) {\
      .wf-feedback-modal {\
        bottom: 0 !important;\
        left: 0 !important;\
        right: 0 !important;\
        top: auto !important;\
        width: 100%;\
        max-width: 100%;\
        max-height: 80vh;\
        border-radius: 16px 16px 0 0;\
      }\
      .wf-feedback-swipe-handle { display: block; }\
      .wf-feedback-backdrop { display: block; }\
    }\
    \
    /* Tablet: 641-1024px */\
    @media (min-width: 641px) and (max-width: 1024px) {\
      .wf-feedback-modal {\
        width: 400px;\
        max-height: calc(100vh - 48px);\
      }\
    }\
    \
    /* Desktop: > 1024px (default styles apply) */\
    \
    /* Landscape on small screens */\
    @media (max-width: 640px) and (orientation: landscape) {\
      .wf-feedback-modal {\
        max-height: 95vh;\
      }\
      .wf-feedback-textarea { min-height: 50px; }\
      .wf-feedback-modal-body { padding: 12px 16px; }\
      .wf-feedback-modal-header { padding: 10px 16px; }\
    }\
    \
    /* Safe area insets for notched devices */\
    @supports (padding-bottom: env(safe-area-inset-bottom)) {\
      .wf-feedback-btn {\
        bottom: calc(20px + env(safe-area-inset-bottom));\
        right: calc(20px + env(safe-area-inset-right));\
      }\
      @media (max-width: 640px) {\
        .wf-feedback-modal {\
          padding-bottom: env(safe-area-inset-bottom);\
        }\
      }\
    }\
  ';

  // Inject styles
  var styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // Create trigger button
  var btn = document.createElement('button');
  btn.className = 'wf-feedback-btn';
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  btn.title = 'Leave feedback';
  btn.setAttribute('aria-label', 'Open feedback widget');
  document.body.appendChild(btn);

  // Use both click and touch events for the trigger button
  addTapHandler(btn, startFeedback);

  // Utility: add tap handler that works on both touch and mouse
  function addTapHandler(element, callback) {
    var touchHandled = false;

    element.addEventListener('touchend', function(e) {
      e.preventDefault(); // Prevent ghost click
      touchHandled = true;
      callback(e);
    }, { passive: false });

    element.addEventListener('click', function(e) {
      if (touchHandled) {
        touchHandled = false;
        return; // Already handled by touch
      }
      callback(e);
    });
  }

  // Utility: get coordinates from touch or mouse event
  function getEventCoords(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function startFeedback() {
    if (isActive) return;
    isActive = true;
    screenshotDataUrl = null;
    pinX = null;
    pinY = null;

    // Show hint
    var hint = document.createElement('div');
    hint.className = 'wf-feedback-hint';
    hint.textContent = isTouchDevice ? 'Tap anywhere to leave feedback' : 'Click anywhere to leave feedback';
    hint.id = 'wf-feedback-hint';
    hint.setAttribute('role', 'status');
    hint.setAttribute('aria-live', 'polite');
    document.body.appendChild(hint);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'wf-feedback-overlay';
    overlay.id = 'wf-feedback-overlay';
    overlay.setAttribute('role', 'button');
    overlay.setAttribute('aria-label', 'Select a point on the page to leave feedback');
    document.body.appendChild(overlay);

    btn.style.display = 'none';

    // Handle overlay placement via touch or click
    var overlayTouchHandled = false;

    overlay.addEventListener('touchend', function(e) {
      e.preventDefault();
      overlayTouchHandled = true;
      handleOverlayTap(e);
    }, { passive: false });

    overlay.addEventListener('click', function(e) {
      if (overlayTouchHandled) {
        overlayTouchHandled = false;
        return;
      }
      handleOverlayTap(e);
    });

    function handleOverlayTap(e) {
      var coords = getEventCoords(e);
      pinX = ((coords.x / window.innerWidth) * 100);
      pinY = ((coords.y / window.innerHeight) * 100);

      // Remove overlay and hint
      overlay.remove();
      var hintEl = document.getElementById('wf-feedback-hint');
      if (hintEl) hintEl.remove();

      // Show pin
      var pin = document.createElement('div');
      pin.className = 'wf-feedback-pin';
      pin.id = 'wf-feedback-pin';
      pin.style.left = coords.x + 'px';
      pin.style.top = coords.y + 'px';
      pin.setAttribute('aria-hidden', 'true');
      document.body.appendChild(pin);

      captureScreenshot().then(function() {
        showModal(coords.x, coords.y);
      });
    }

    // ESC to cancel
    function handleEsc(e) {
      if (e.key === 'Escape') {
        cancelFeedback();
        document.removeEventListener('keydown', handleEsc);
      }
    }
    document.addEventListener('keydown', handleEsc);
  }

  function captureScreenshot() {
    // Only capture if html2canvas is available
    if (typeof html2canvas === 'undefined') {
      return Promise.resolve();
    }

    // Hide our own UI elements during capture
    var feedbackEls = document.querySelectorAll('.wf-feedback-pin, .wf-feedback-btn');
    feedbackEls.forEach(function(el) { el.style.visibility = 'hidden'; });

    return html2canvas(document.documentElement, {
      useCORS: true,
      logging: false,
      scale: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
      width: window.innerWidth,    // Viewport only, not full scroll width
      height: window.innerHeight,  // Viewport only, not full scroll height
      x: window.scrollX,
      y: window.scrollY,
    }).then(function(canvas) {
      feedbackEls.forEach(function(el) { el.style.visibility = ''; });
      // Use JPEG for smaller payload (typically 60-80% smaller than PNG)
      screenshotDataUrl = canvas.toDataURL('image/jpeg', 0.7);
    }).catch(function(err) {
      feedbackEls.forEach(function(el) { el.style.visibility = ''; });
      console.warn('[Feedback Widget] Screenshot capture failed:', err.message);
      screenshotDataUrl = null;
    });
  }

  function showModal(clickX, clickY) {
    var isSmallScreen = window.innerWidth <= 640;

    // Create backdrop for mobile (positioned behind modal)
    if (isSmallScreen) {
      var backdrop = document.createElement('div');
      backdrop.className = 'wf-feedback-backdrop';
      backdrop.id = 'wf-feedback-backdrop';
      backdrop.style.display = 'block';
      backdrop.addEventListener('click', cancelFeedback);
      document.body.appendChild(backdrop);
    }

    var modal = document.createElement('div');
    modal.className = 'wf-feedback-modal';
    modal.id = 'wf-feedback-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Leave feedback');

    // Position modal near click point on desktop, bottom sheet on mobile
    if (!isSmallScreen) {
      var left = clickX + 20;
      var top = clickY - 20;
      if (left + 380 > window.innerWidth) left = clickX - 380;
      if (top + 400 > window.innerHeight) top = window.innerHeight - 420;
      if (top < 16) top = 16;
      if (left < 16) left = 16;
      modal.style.left = left + 'px';
      modal.style.top = top + 'px';
    }

    var screenshotHtml = '';
    if (screenshotDataUrl) {
      screenshotHtml = '<div class="wf-feedback-screenshot" aria-label="Screenshot of the page">' +
        '<img src="' + screenshotDataUrl + '" alt="Screenshot of the current page" />' +
        '</div>';
    }

    modal.innerHTML =
      '<div class="wf-feedback-swipe-handle" aria-hidden="true"></div>' +
      '<div class="wf-feedback-modal-header">' +
        '<h3 id="wf-feedback-modal-title">Leave Feedback</h3>' +
        '<button class="wf-feedback-close" id="wf-feedback-close" aria-label="Close feedback dialog">&times;</button>' +
      '</div>' +
      '<div class="wf-feedback-modal-body">' +
        screenshotHtml +
        '<label for="wf-feedback-text" class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;">Feedback description</label>' +
        '<textarea class="wf-feedback-textarea" id="wf-feedback-text" placeholder="Describe your feedback..." aria-label="Describe your feedback" autofocus></textarea>' +
        '<button class="wf-feedback-submit" id="wf-feedback-submit" aria-label="Submit feedback">Submit Feedback</button>' +
      '</div>';

    modal.setAttribute('aria-labelledby', 'wf-feedback-modal-title');

    document.body.appendChild(modal);

    // Add tap handlers to modal buttons
    addTapHandler(document.getElementById('wf-feedback-close'), cancelFeedback);
    addTapHandler(document.getElementById('wf-feedback-submit'), submitFeedback);

    // Swipe-to-dismiss for mobile bottom sheet
    if (isSmallScreen) {
      initSwipeToDismiss(modal);
    }

    // Focus trapping and keyboard navigation
    initFocusTrap(modal);

    // Focus textarea
    setTimeout(function() {
      var ta = document.getElementById('wf-feedback-text');
      if (ta) ta.focus();
    }, 100);
  }

  // Swipe-to-dismiss implementation
  function initSwipeToDismiss(modal) {
    var startY = 0;
    var currentY = 0;
    var isDragging = false;
    var DISMISS_THRESHOLD = 100; // px minimum swipe distance

    modal.addEventListener('touchstart', function(e) {
      // Only track swipe from the header area or swipe handle
      var target = e.target;
      var isHandle = target.classList.contains('wf-feedback-swipe-handle');
      var isHeader = target.closest('.wf-feedback-modal-header') || isHandle;
      // Also allow swipe if modal is scrolled to top
      var isScrolledToTop = modal.scrollTop <= 0;

      if (isHeader || (isScrolledToTop && !target.closest('.wf-feedback-textarea'))) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    }, { passive: true });

    modal.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      var deltaY = currentY - startY;

      // Only allow downward swipe
      if (deltaY > 0) {
        modal.style.transform = 'translateY(' + deltaY + 'px)';
        modal.style.opacity = Math.max(0.5, 1 - (deltaY / 300));
        e.preventDefault();
      }
    }, { passive: false });

    modal.addEventListener('touchend', function() {
      if (!isDragging) return;
      isDragging = false;
      var deltaY = currentY - startY;

      if (deltaY > DISMISS_THRESHOLD) {
        // Animate out then dismiss
        modal.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        modal.style.transform = 'translateY(100%)';
        modal.style.opacity = '0';
        setTimeout(cancelFeedback, 200);
      } else {
        // Snap back
        modal.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        modal.style.transform = '';
        modal.style.opacity = '';
        setTimeout(function() {
          modal.style.transition = '';
        }, 200);
      }
      currentY = 0;
    }, { passive: true });
  }

  // Focus trap: Tab cycles within modal, Escape closes
  function initFocusTrap(modal) {
    function handleKeydown(e) {
      if (e.key === 'Escape') {
        cancelFeedback();
        return;
      }
      if (e.key === 'Tab') {
        var focusable = modal.querySelectorAll(
          'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    modal._focusTrapHandler = handleKeydown;
    document.addEventListener('keydown', handleKeydown);
  }

  function submitFeedback() {
    var textarea = document.getElementById('wf-feedback-text');
    var submitBtn = document.getElementById('wf-feedback-submit');
    var annotation = textarea?.value?.trim();

    if (!annotation) {
      textarea.style.borderColor = '#ef4444';
      textarea.setAttribute('aria-invalid', 'true');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    var deviceInfo = getDeviceInfo();
    var payload = {
      url: window.location.href,
      pageTitle: document.title,
      x: pinX,
      y: pinY,
      annotation: annotation,
      screenshotUrl: screenshotDataUrl,
      deviceType: getDeviceType(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      browserName: deviceInfo.browserName,
      browserVersion: deviceInfo.browserVersion,
      osName: deviceInfo.osName,
      osVersion: deviceInfo.osVersion,
      userAgent: deviceInfo.userAgent,
      devicePixelRatio: deviceInfo.devicePixelRatio,
      screenWidth: deviceInfo.screenWidth,
      screenHeight: deviceInfo.screenHeight,
    };

    fetch(API_URL + '/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(payload),
    })
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    })
    .then(function() {
      // Show success
      var modal = document.getElementById('wf-feedback-modal');
      if (modal) {
        var body = modal.querySelector('.wf-feedback-modal-body');
        if (body) {
          body.innerHTML = '<div class="wf-feedback-success" role="status" aria-live="polite">' +
            '<div style="font-size:32px;margin-bottom:8px" aria-hidden="true">&#10003;</div>' +
            '<p>Thank you for your feedback!</p>' +
            '</div>';
        }
        setTimeout(cancelFeedback, 1500);
      }
    })
    .catch(function(err) {
      console.error('[Feedback Widget] Submit error:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Retry';

      // Store locally for batch sync later
      storeFeedbackLocally(payload);
    });
  }

  function storeFeedbackLocally(payload) {
    try {
      var stored = JSON.parse(sessionStorage.getItem('wf_feedback_queue') || '[]');
      // Don't store screenshots in sessionStorage (too large, ~5MB quota)
      var queuePayload = Object.assign({}, payload);
      delete queuePayload.screenshotUrl;
      stored.push(queuePayload);
      sessionStorage.setItem('wf_feedback_queue', JSON.stringify(stored));
    } catch (e) {
      // sessionStorage not available or quota exceeded
    }
  }

  function syncStoredFeedback() {
    try {
      var stored = JSON.parse(sessionStorage.getItem('wf_feedback_queue') || '[]');
      if (stored.length === 0) return;

      // Clear queue immediately, re-add failures
      sessionStorage.setItem('wf_feedback_queue', '[]');

      var pending = stored.length;
      var failures = [];

      stored.forEach(function(payload) {
        fetch(API_URL + '/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify(payload),
        })
        .then(function(res) {
          if (!res.ok) throw new Error('Server error');
          pending--;
          if (pending === 0 && failures.length > 0) {
            sessionStorage.setItem('wf_feedback_queue', JSON.stringify(failures));
          }
        })
        .catch(function() {
          failures.push(payload);
          pending--;
          if (pending === 0) {
            sessionStorage.setItem('wf_feedback_queue', JSON.stringify(failures));
          }
        });
      });
    } catch (e) {
      // ignore
    }
  }

  function cancelFeedback() {
    // Clean up focus trap listener
    var modal = document.getElementById('wf-feedback-modal');
    if (modal && modal._focusTrapHandler) {
      document.removeEventListener('keydown', modal._focusTrapHandler);
    }

    isActive = false;
    ['wf-feedback-overlay', 'wf-feedback-hint', 'wf-feedback-pin', 'wf-feedback-modal', 'wf-feedback-backdrop'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    btn.style.display = '';
    btn.setAttribute('aria-expanded', 'false');
  }

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getDeviceInfo() {
    var ua = navigator.userAgent;
    var info = {
      browserName: 'Unknown',
      browserVersion: '',
      osName: 'Unknown',
      osVersion: '',
      userAgent: ua,
      devicePixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };

    // Detect browser name and version
    if (/Edg\//i.test(ua)) {
      info.browserName = 'Edge';
      info.browserVersion = (ua.match(/Edg\/([\d.]+)/) || [])[1] || '';
    } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
      info.browserName = 'Opera';
      info.browserVersion = (ua.match(/(?:OPR|Opera)\/([\d.]+)/) || [])[1] || '';
    } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
      info.browserName = 'Chrome';
      info.browserVersion = (ua.match(/Chrome\/([\d.]+)/) || [])[1] || '';
    } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
      info.browserName = 'Safari';
      info.browserVersion = (ua.match(/Version\/([\d.]+)/) || [])[1] || '';
    } else if (/Firefox\//.test(ua)) {
      info.browserName = 'Firefox';
      info.browserVersion = (ua.match(/Firefox\/([\d.]+)/) || [])[1] || '';
    }

    // Detect OS name and version
    if (/Windows/.test(ua)) {
      info.osName = 'Windows';
      var winMatch = ua.match(/Windows NT ([\d.]+)/);
      if (winMatch) {
        var winVersions = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
        info.osVersion = winVersions[winMatch[1]] || winMatch[1];
      }
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      info.osName = 'iOS';
      var iosMatch = ua.match(/OS ([\d_]+)/);
      info.osVersion = iosMatch ? iosMatch[1].replace(/_/g, '.') : '';
    } else if (/Mac OS X/.test(ua)) {
      info.osName = 'macOS';
      var macMatch = ua.match(/Mac OS X ([\d_.]+)/);
      info.osVersion = macMatch ? macMatch[1].replace(/_/g, '.') : '';
    } else if (/Android/.test(ua)) {
      info.osName = 'Android';
      info.osVersion = (ua.match(/Android ([\d.]+)/) || [])[1] || '';
    } else if (/Linux/.test(ua)) {
      info.osName = 'Linux';
    } else if (/CrOS/.test(ua)) {
      info.osName = 'ChromeOS';
    }

    return info;
  }

  // Sync stored feedback on load
  syncStoredFeedback();

  // Sync when network comes back online
  window.addEventListener('online', syncStoredFeedback);
})();
