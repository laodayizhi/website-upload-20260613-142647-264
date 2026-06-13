(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var region = panel.querySelector('[data-filter-region]');
      var reset = panel.querySelector('[data-filter-reset]');
      var section = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var count = section.querySelector('[data-filter-count]');

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var matchedRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
          var visibleNow = matchedKeyword && matchedYear && matchedRegion;
          card.classList.toggle('hidden-by-filter', !visibleNow);
          if (visibleNow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部影片';
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (region) {
            region.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  function initSearch() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function paramsQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function render(query) {
      var keyword = normalize(query);
      input.value = query;
      if (!keyword) {
        results.innerHTML = '';
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.oneLine
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 120);

      summary.textContent = '找到 ' + matched.length + ' 条相关结果。';
      results.innerHTML = matched.map(function (item) {
        return '' +
          '<article class="movie-card">' +
            '<a class="poster-link" href="' + item.url + '">' +
              '<div class="poster-frame">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.classList.add('image-hidden')">' +
                '<span class="duration">' + item.duration + '</span>' +
              '</div>' +
            '</a>' +
            '<div class="movie-card-body">' +
              '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
              '<p>' + escapeHtml(item.oneLine) + '</p>' +
              '<div class="movie-meta">' +
                '<span>' + item.year + '</span>' +
                '<span>' + escapeHtml(item.region) + '</span>' +
                '<span>' + escapeHtml(item.type) + '</span>' +
              '</div>' +
            '</div>' +
          '</article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState({}, '', nextUrl);
      render(query);
    });

    render(paramsQuery());
  }

  function initPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-video-src');
    var hls = null;
    var loaded = false;

    function playVideo() {
      if (!video || !source) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
        loaded = true;
      } else {
        video.play().catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (button) {
      button.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayer();
  });
})();
