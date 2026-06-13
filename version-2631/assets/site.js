(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var search = document.querySelector('[data-page-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var sortFilter = document.querySelector('[data-sort-filter]');
    var count = document.querySelector('[data-filter-count]');

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var keyword = normalize(search && search.value);
      var year = normalize(yearFilter && yearFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var isMatch = true;
        var haystack = cardText(card);

        if (keyword && haystack.indexOf(keyword) === -1) {
          isMatch = false;
        }

        if (year && normalize(card.getAttribute('data-year')) !== year) {
          isMatch = false;
        }

        if (region && normalize(card.getAttribute('data-region')) !== region) {
          isMatch = false;
        }

        if (type && normalize(card.getAttribute('data-type')) !== type) {
          isMatch = false;
        }

        if (category && normalize(card.getAttribute('data-category')) !== category) {
          isMatch = false;
        }

        card.classList.toggle('is-hidden', !isMatch);

        if (isMatch) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部影片';
      }
    }

    function sortCards() {
      var value = sortFilter ? sortFilter.value : 'default';
      var sorted = cards.slice();

      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (value === 'score-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        });
      }

      if (value === 'title-asc') {
        sorted.sort(function (a, b) {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')));
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });

      apply();
    }

    [search, yearFilter, regionFilter, typeFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (sortFilter) {
      sortFilter.addEventListener('change', sortCards);
    }

    apply();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-movie-card data-title="', escapeHtml(movie.title), '" data-year="', escapeHtml(movie.year), '" data-region="', escapeHtml(movie.region), '" data-type="', escapeHtml(movie.type), '" data-genre="', escapeHtml(movie.genre), '" data-category="', escapeHtml(movie.category), '" data-score="', escapeHtml(movie.score), '">',
      '<a class="movie-poster" href="', escapeHtml(movie.url), '" aria-label="观看', escapeHtml(movie.title), '">',
      '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '海报" loading="lazy">',
      '<span class="year-badge">', escapeHtml(movie.year), '</span>',
      '<span class="poster-shade"></span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="', escapeHtml(movie.url), '">', escapeHtml(movie.title), '</a></h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="movie-meta-line"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span><span>', escapeHtml(movie.category), '</span></div>',
      '<div class="tag-row">', tags, '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (!input || !results || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    function search() {
      var query = normalize(input.value);

      if (!query) {
        summary.textContent = '输入关键词后显示搜索结果。';
        return;
      }

      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags && movie.tags.join(' '),
          movie.oneLine
        ].join(' ')).indexOf(query) !== -1;
      }).slice(0, 120);

      summary.textContent = '关键词“' + input.value + '”找到 ' + matches.length + ' 个结果';
      results.innerHTML = matches.map(movieCardTemplate).join('');
    }

    input.addEventListener('input', search);
    search();
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initSearchPage();
  });
}());
