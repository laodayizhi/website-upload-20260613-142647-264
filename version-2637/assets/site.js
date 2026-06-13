(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-dot]'));
        var current = 0;
        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        showSlide(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    document.querySelectorAll('[data-filter-zone]').forEach(function (zone) {
        var search = zone.querySelector('[data-search]');
        var category = zone.querySelector('[data-category-filter]');
        var type = zone.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(zone.querySelectorAll('[data-card]'));
        var normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };
        var apply = function () {
            var term = normalize(search && search.value);
            var categoryValue = normalize(category && category.value);
            var typeValue = normalize(type && type.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type
                ].join(' '));
                var matchTerm = !term || haystack.indexOf(term) !== -1;
                var matchCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
                var matchType = !typeValue || normalize(card.dataset.type) === typeValue;
                card.hidden = !(matchTerm && matchCategory && matchType);
            });
        };
        [search, category, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        var toggleBackTop = function () {
            backTop.classList.toggle('is-visible', window.scrollY > 600);
        };
        window.addEventListener('scroll', toggleBackTop, { passive: true });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        toggleBackTop();
    }
})();
