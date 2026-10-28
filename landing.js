(function () {
  'use strict';

  var isMobile = function () {
    return window.innerWidth <= 768;
  };

  /* ==========================================================================
     OPTION 1: Expanding Panels (index-1.html)
     ========================================================================== */
  function initOption1() {
    var container = document.querySelector('.stage .panels') || document.querySelector('.panels');
    if (!container) return;
    var panels = container.querySelectorAll('.panel');
    if (!panels.length) return;

    // Add hint label to panels if not present
    panels.forEach(function (p) {
      if (!p.querySelector('.panel-hint')) {
        var lbl = p.querySelector('.panel-label');
        if (lbl) {
          var hint = document.createElement('span');
          hint.className = 'panel-hint';
          hint.textContent = 'Explore sheet \u2192';
          lbl.appendChild(hint);
        }
      }
    });

    var cur = -1;

    function setActive(idx) {
      if (idx === cur) return;
      cur = idx;
      panels.forEach(function (p, i) {
        p.classList.toggle('is-active', i === cur);
      });
    }

    // Calculate zone index based on scroll progress with a hysteresis deadband
    function getZoneFromProgress(progress, currentIdx, total) {
      if (total <= 1) return 0;
      if (progress <= 0.04) return 0;
      if (progress >= 0.94) return total - 1;

      var segment = 1 / total;
      var hysteresis = segment * 0.28; // 28% deadband gives rock-solid stability

      if (currentIdx >= 0 && currentIdx < total) {
        var minBound = (currentIdx * segment) - (currentIdx > 0 ? hysteresis : 0);
        var maxBound = ((currentIdx + 1) * segment) + (currentIdx < total - 1 ? hysteresis : 0);
        if (progress >= minBound && progress <= maxBound) {
          return currentIdx;
        }
      }

      var raw = Math.floor(progress / segment);
      return Math.min(Math.max(raw, 0), total - 1);
    }

    // Scroll-driven expansion: perfectly decoupled from layout height animations
    var ticking = false;
    function updateOnScroll() {
      if (!isMobile()) return;
      var scrollY = window.scrollY || window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight;
      var winHeight = window.innerHeight;
      var maxScroll = docHeight - winHeight;

      if (maxScroll <= 10) {
        setActive(0);
        ticking = false;
        return;
      }

      var progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      var targetIdx = getZoneFromProgress(progress, cur, panels.length);
      setActive(targetIdx);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    }, { passive: true });

    // Tap support: tap to expand and smoothly scroll to that tile's zone; if already expanded, tap navigates
    panels.forEach(function (p, i) {
      p.addEventListener('click', function (e) {
        if (isMobile()) {
          if (!p.classList.contains('is-active')) {
            e.preventDefault();
            setActive(i);
            var docHeight = document.documentElement.scrollHeight;
            var winHeight = window.innerHeight;
            var maxScroll = docHeight - winHeight;
            if (maxScroll > 0) {
              var targetScroll = (i / (panels.length - 1)) * maxScroll;
              window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
          }
        }
      });
    });

    // Initial check on load
    if (isMobile()) {
      setTimeout(updateOnScroll, 120);
    }

    window.addEventListener('resize', function () {
      if (isMobile()) {
        updateOnScroll();
      } else {
        panels.forEach(function (p) { p.classList.remove('is-active'); });
      }
    });
  }

  /* ==========================================================================
     OPTION 2: Callouts on Portrait (index-2.html)
     ========================================================================== */
  function initOption2() {
    var callout = document.querySelector('.callout');
    if (!callout) return;
    var balls = callout.querySelectorAll('.ball');
    var svg = callout.querySelector('svg');
    if (!balls.length || !svg) return;

    var lines = svg.querySelectorAll('line');
    var circles = svg.querySelectorAll('circle');

    var cur = 0;
    var timer = null;

    function setActive(idx) {
      cur = (idx + balls.length) % balls.length;

      balls.forEach(function (b, i) {
        b.classList.toggle('is-active', i === cur);
      });
      lines.forEach(function (l, i) {
        l.classList.toggle('is-active', i === cur);
      });
      circles.forEach(function (c, i) {
        c.classList.toggle('is-active', i === cur);
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        setActive(cur + 1);
      }, 2600);
    }

    function stopTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function pauseTemporarily(ms) {
      stopTimer();
      setTimeout(startTimer, ms || 4500);
    }

    balls.forEach(function (b, i) {
      b.addEventListener('click', function (e) {
        if (isMobile() && !b.classList.contains('is-active')) {
          e.preventDefault();
          setActive(i);
          pauseTemporarily(5000);
        }
      });
      b.addEventListener('mouseenter', function () {
        if (!isMobile()) setActive(i);
      });
    });

    setActive(0);
    startTimer();
  }

  /* ==========================================================================
     OPTION 3: Sheet Index with Side-by-Side Images (index-3.html)
     ========================================================================== */
  function initOption3() {
    var container = document.querySelector('.sheet-index-wrap') || document.querySelector('.split-land');
    if (!container) return;
    var rows = container.querySelectorAll('.rows a, .row-link');
    if (!rows.length) return;

    var cur = -1;

    function setActive(idx) {
      if (idx === cur) return;
      cur = idx;
      rows.forEach(function (r, i) {
        r.classList.toggle('is-active', i === cur);
      });
    }

    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () {
        if (!isMobile()) setActive(i);
      });
      r.addEventListener('focus', function () {
        setActive(i);
      });
    });

    // Scroll-driven active state
    var ticking = false;
    function updateOnScroll() {
      var scrollY = window.scrollY || window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight;
      var winHeight = window.innerHeight;

      // Top boundary: always highlight About (0) when at the top
      if (scrollY <= 60) {
        setActive(0);
        ticking = false;
        return;
      }

      // Bottom boundary: always highlight Contact (last item) when scrolled to bottom
      if (scrollY + winHeight >= docHeight - 80) {
        setActive(rows.length - 1);
        ticking = false;
        return;
      }

      // Otherwise highlight whichever row is closest to viewport focal center
      var focalPoint = winHeight * 0.46;
      var bestIdx = 0;
      var bestDist = Infinity;

      rows.forEach(function (r, i) {
        var rect = r.getBoundingClientRect();
        var rMid = rect.top + rect.height / 2;
        var dist = Math.abs(focalPoint - rMid);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      setActive(bestIdx);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    }, { passive: true });

    // Initial check on load
    setTimeout(updateOnScroll, 100);

    window.addEventListener('resize', function () {
      updateOnScroll();
    });
  }

  /* ==========================================================================
     OPTION 4: Title Block (index.html)
     ========================================================================== */
  function initOption4() {
    // Sheet inspector removed per user request
    return;
  }

  /* ==========================================================================
     OPTION 5: Scroll-Drawn Toolpath (index-5.html)
     ========================================================================== */
  function initOption5() {
    var path = document.getElementById('path');
    if (!path) return;
    var line = path.querySelector('.path-line');
    var stns = path.querySelectorAll('.stn');
    var layers = document.querySelectorAll('.layer');
    var cap = document.getElementById('cap');
    if (!stns.length) return;

    var cur = -1;
    var draw = function () {
      var r = path.getBoundingClientRect();
      var focal = window.innerHeight * (isMobile() ? 0.5 : 0.6);
      var y = focal - r.top;
      if (line) line.style.height = Math.max(0, Math.min(r.height, y)) + 'px';

      var newCur = -1;
      stns.forEach(function (s, i) {
        var triggerOffset = isMobile() ? s.offsetTop + 40 : s.offsetTop + s.offsetHeight / 2;
        var on = triggerOffset < y;
        s.classList.toggle('on', on);
        if (on) newCur = i;
      });

      if (newCur !== cur) {
        cur = newCur;
        layers.forEach(function (l, i) {
          l.classList.toggle('on', i === cur);
        });
        if (cap) {
          cap.textContent = cur < 0 ? 'Fig. 00 \u2014 Anthony Aughenbaugh' : 'Fig. 0' + (cur + 1) + ' \u2014 ' + (stns[cur].dataset.name || '');
        }
      }
    };

    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();

    // Subtle mobile simulated tour if user hasn't scrolled
    var autoTourRan = false;
    if (isMobile()) {
      var autoTimer = setTimeout(function () {
        if (autoTourRan || window.scrollY > 40) return;
        autoTourRan = true;
        // Preview stations 0 through 2 gently
        var step = 0;
        var stepInterval = setInterval(function () {
          if (step >= stns.length || window.scrollY > 40) {
            clearInterval(stepInterval);
            return;
          }
          stns[step].classList.add('on');
          var img = stns[step].querySelector('.stn-img');
          if (img) img.style.opacity = '1';
          step++;
        }, 1200);
      }, 1500);

      window.addEventListener('scroll', function () {
        clearTimeout(autoTimer);
      }, { passive: true, once: true });
    }
  }

  /* ==========================================================================
     Cursor-following preview (peek) for standard index lists
     ========================================================================== */
  function initPeek() {
    var peek = document.querySelector('.peek');
    if (!peek) return;
    document.querySelectorAll('.index a').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        peek.style.backgroundImage = 'url(' + a.dataset.img + ')';
        peek.classList.add('on');
      });
      a.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
      a.addEventListener('mousemove', function (e) {
        peek.style.left = (e.clientX + 24) + 'px';
        peek.style.top = (e.clientY - 90) + 'px';
      });
    });
  }

  // Initialize all options on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  function initAll() {
    initOption1();
    initOption2();
    initOption3();
    initOption4();
    initOption5();
    initPeek();
  }

})();
