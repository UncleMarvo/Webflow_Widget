(function() {
  'use strict';

  // Config
  var SCRIPT_TAG = document.currentScript;
  var API_KEY = SCRIPT_TAG?.getAttribute('data-api-key') || '';
  var API_URL = SCRIPT_TAG?.getAttribute('data-api-url') || 'http://localhost:3001';

  if (!API_KEY) {
    console.warn('[Feedback Widget] Missing data-api-key attribute');
    return;
  }

  // State
  var isActive = false;
  var screenshotDataUrl = null;
  var pinX = null;
  var pinY = null;
  var html2canvasLoaded = false;

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
    }\
    .wf-feedback-btn:hover {\
      transform: scale(1.05);\
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);\
    }\
    .wf-feedback-overlay {\
      position: fixed;\
      inset: 0;\
      z-index: 2147483641;\
      cursor: crosshair;\
      background: transparent;\
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
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
    .wf-feedback-close {\
      background: none;\
      border: none;\
      font-size: 20px;\
      cursor: pointer;\
      color: #9ca3af;\
      padding: 0;\
      line-height: 1;\
    }\
    .wf-feedback-close:hover { color: #374151; }\
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
      padding: 10px 12px;\
      border: 1px solid #d1d5db;\
      border-radius: 8px;\
      font-size: 14px;\
      font-family: inherit;\
      resize: vertical;\
      outline: none;\
      box-sizing: border-box;\
    }\
    .wf-feedback-textarea:focus {\
      border-color: #000;\
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);\
    }\
    .wf-feedback-submit {\
      width: 100%;\
      padding: 10px;\
      margin-top: 12px;\
      background: #000;\
      color: #fff;\
      border: none;\
      border-radius: 8px;\
      font-size: 14px;\
      font-weight: 500;\
      cursor: pointer;\
      font-family: inherit;\
    }\
    .wf-feedback-submit:hover { background: #1f2937; }\
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
      padding: 8px 16px;\
      border-radius: 8px;\
      font-size: 14px;\
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);\
    }\
    @media (max-width: 640px) {\
      .wf-feedback-modal {\
        bottom: 0 !important;\
        left: 0 !important;\
        right: 0 !important;\
        top: auto !important;\
        width: 100%;\
        max-width: 100%;\
        border-radius: 12px 12px 0 0;\
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
  document.body.appendChild(btn);

  btn.addEventListener('click', startFeedback);

  function startFeedback() {
    if (isActive) return;
    isActive = true;
    screenshotDataUrl = null;
    pinX = null;
    pinY = null;

    // Show hint
    var hint = document.createElement('div');
    hint.className = 'wf-feedback-hint';
    hint.textContent = 'Click anywhere to leave feedback';
    hint.id = 'wf-feedback-hint';
    document.body.appendChild(hint);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'wf-feedback-overlay';
    overlay.id = 'wf-feedback-overlay';
    document.body.appendChild(overlay);

    btn.style.display = 'none';

    overlay.addEventListener('click', function(e) {
      pinX = ((e.clientX / window.innerWidth) * 100);
      pinY = ((e.clientY / window.innerHeight) * 100);

      // Remove overlay and hint
      overlay.remove();
      var hintEl = document.getElementById('wf-feedback-hint');
      if (hintEl) hintEl.remove();

      // Show pin
      var pin = document.createElement('div');
      pin.className = 'wf-feedback-pin';
      pin.id = 'wf-feedback-pin';
      pin.style.left = e.clientX + 'px';
      pin.style.top = e.clientY + 'px';
      document.body.appendChild(pin);

      captureScreenshot().then(function() {
        showModal(e.clientX, e.clientY);
      });
    });

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
    var modal = document.createElement('div');
    modal.className = 'wf-feedback-modal';
    modal.id = 'wf-feedback-modal';

    // Position modal near click point
    var left = clickX + 20;
    var top = clickY - 20;
    if (left + 380 > window.innerWidth) left = clickX - 380;
    if (top + 400 > window.innerHeight) top = window.innerHeight - 420;
    if (top < 16) top = 16;
    if (left < 16) left = 16;

    modal.style.left = left + 'px';
    modal.style.top = top + 'px';

    var screenshotHtml = '';
    if (screenshotDataUrl) {
      screenshotHtml = '<div class="wf-feedback-screenshot"><img src="' + screenshotDataUrl + '" alt="Screenshot" /></div>';
    }

    modal.innerHTML = '<div class="wf-feedback-modal-header">' +
      '<h3>Leave Feedback</h3>' +
      '<button class="wf-feedback-close" id="wf-feedback-close">&times;</button>' +
      '</div>' +
      '<div class="wf-feedback-modal-body">' +
      screenshotHtml +
      '<textarea class="wf-feedback-textarea" id="wf-feedback-text" placeholder="Describe your feedback..." autofocus></textarea>' +
      '<button class="wf-feedback-submit" id="wf-feedback-submit">Submit Feedback</button>' +
      '</div>';

    document.body.appendChild(modal);

    document.getElementById('wf-feedback-close').addEventListener('click', cancelFeedback);
    document.getElementById('wf-feedback-submit').addEventListener('click', submitFeedback);

    // Focus textarea
    setTimeout(function() {
      var ta = document.getElementById('wf-feedback-text');
      if (ta) ta.focus();
    }, 100);
  }

  function submitFeedback() {
    var textarea = document.getElementById('wf-feedback-text');
    var submitBtn = document.getElementById('wf-feedback-submit');
    var annotation = textarea?.value?.trim();

    if (!annotation) {
      textarea.style.borderColor = '#ef4444';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

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
          body.innerHTML = '<div class="wf-feedback-success">' +
            '<div style="font-size:32px;margin-bottom:8px">&#10003;</div>' +
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
    isActive = false;
    ['wf-feedback-overlay', 'wf-feedback-hint', 'wf-feedback-pin', 'wf-feedback-modal'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    btn.style.display = '';
  }

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // Sync stored feedback on load
  syncStoredFeedback();

  // Sync when network comes back online
  window.addEventListener('online', syncStoredFeedback);
})();
