(function () {
  'use strict';

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation drawer & morphing hamburger
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Toggle navigation menu');
      backdrop.classList.toggle('active', open);
      document.body.classList.toggle('nav-open', open);
      document.documentElement.classList.toggle('nav-open', open);
    };

    // Lock background scroll on mobile touch while drawer is open
    document.addEventListener('touchmove', function (e) {
      if (document.body.classList.contains('nav-open') && !e.target.closest('#site-nav')) {
        e.preventDefault();
      }
    }, { passive: false });

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });

    backdrop.addEventListener('click', function () {
      setOpen(false);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Keep Tab focus inside the open drawer (toggle + nav links)
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
      var items = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll('a[href], button')));
      var first = items[0], last = items[items.length - 1];
      if (!nav.contains(document.activeElement) && document.activeElement !== toggle) {
        e.preventDefault(); first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && nav.classList.contains('open')) {
        setOpen(false);
      }
    });
  }

  // Header border once the page scrolls
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Highlight current section in nav
  var links = document.querySelectorAll('.site-nav ul a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[entry.target.id].setAttribute('aria-current', 'page');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // Contact form: validation and status messages
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    var say = function (msg, type) {
      status.textContent = msg;
      status.className = 'form-status ' + type;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website && form.website.value) return; // honeypot caught a bot

      var bad = [];
      form.querySelectorAll('[required]').forEach(function (f) {
        var ok = f.value.trim() && (f.type !== 'email' || /^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) bad.push(f);
      });
      if (bad.length) {
        say('Check the highlighted fields and try again.', 'err');
        bad[0].focus();
        return;
      }

      say('Sending…', '');
      // TODO: replace with the real endpoint. Example:
      // fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      //   .then(function (r) { if (!r.ok) throw new Error(); say('Message sent. I will reply by email.', 'ok'); form.reset(); })
      //   .catch(function () { say('Message not sent. Email anthonyaughenbaugh@gmail.com instead.', 'err'); });
      say('Form handler not connected yet. See the TODO in main.js.', 'err');
    });
  }

  // Gallery category filter (for projects.html)
  var filterButtons = document.querySelectorAll('.filter-btn, .filter-cell');
  var galleryCards = document.querySelectorAll('#project-gallery .gallery-card');
  if (filterButtons.length && galleryCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        filterButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        galleryCards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Project Image Lightbox Viewer
  var gallery = document.getElementById('project-gallery');
  var lightbox = document.getElementById('gallery-lightbox');
  if (gallery && lightbox) {
    var lbImg = document.getElementById('lightbox-img');
    var lbCount = document.getElementById('lightbox-count');
    var lbCat = document.getElementById('lightbox-cat');
    var lbTitle = document.getElementById('lightbox-title');
    var lbDesc = document.getElementById('lightbox-desc');
    var lastActiveTrigger = null;
    var currentIndex = 0;

    function getVisibleCards() {
      return Array.from(gallery.querySelectorAll('.gallery-card')).filter(function (card) {
        return window.getComputedStyle(card).display !== 'none';
      });
    }

    function showItem(index) {
      var visible = getVisibleCards();
      if (!visible.length) return;
      if (index < 0) index = visible.length - 1;
      if (index >= visible.length) index = 0;
      currentIndex = index;

      var card = visible[currentIndex];
      var img = card.querySelector('.gallery-img');
      var title = card.querySelector('.gallery-title');
      var cat = card.querySelector('.gallery-cat');
      var tag = card.querySelector('.gallery-tag');

      if (img && lbImg) {
        lbImg.src = img.getAttribute('data-full') || img.src;
        lbImg.alt = img.alt || '';
      }
      if (lbCount) {
        lbCount.textContent = (currentIndex + 1) + ' of ' + visible.length;
      }
      if (lbCat && cat) {
        lbCat.textContent = cat.textContent.trim();
      }
      if (lbTitle && title) {
        lbTitle.textContent = title.textContent.trim();
      }
      if (lbDesc && tag) {
        lbDesc.textContent = tag.textContent.trim();
      }
    }

    function openLightbox(triggerEl) {
      lastActiveTrigger = triggerEl;
      var card = triggerEl.closest('.gallery-card');
      var visible = getVisibleCards();
      var idx = visible.indexOf(card);
      if (idx === -1) idx = 0;
      showItem(idx);

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      lightbox.focus();
    }

    function closeLightbox() {
      if (!lightbox.classList.contains('active')) return;
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      if (lastActiveTrigger) {
        lastActiveTrigger.focus();
      }
    }

    gallery.addEventListener('click', function (e) {
      var trigger = e.target.closest('.gallery-card-trigger, .gallery-card');
      if (trigger) {
        e.preventDefault();
        openLightbox(trigger);
      }
    });

    lightbox.addEventListener('click', function (e) {
      var actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      var action = actionBtn.getAttribute('data-action');
      if (action === 'close') {
        closeLightbox();
      } else if (action === 'prev') {
        showItem(currentIndex - 1);
      } else if (action === 'next') {
        showItem(currentIndex + 1);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showItem(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        showItem(currentIndex + 1);
      }
    });

    var touchStartX = 0;
    var touchEndX = 0;
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) showItem(currentIndex - 1);
        else showItem(currentIndex + 1);
      }
    }, { passive: true });
  }

  // Design switcher: ensure active link matches current filename
  var designLinks = document.querySelectorAll('.design-link');
  if (designLinks.length) {
    var rawPath = window.location.pathname.split('/').pop() || 'index.html';
    var curPage = rawPath.split('?')[0].split('#')[0] || 'index.html';
    designLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === curPage) {
        designLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'page');
      }
    });
  }
})();
