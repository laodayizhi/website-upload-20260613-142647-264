(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-filter-input]');
        const year = scope.querySelector('[data-year-filter]');
        const region = scope.querySelector('[data-region-filter]');
        const list = scope.parentElement.querySelector('[data-card-list]');
        const count = scope.querySelector('[data-result-count]');

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('.movie-card'));

        function applyFilter() {
            const keyword = normalize(input ? input.value : '');
            const selectedYear = year ? year.value : '';
            const selectedRegion = region ? region.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchYear = !selectedYear || card.dataset.year === selectedYear;
                const matchRegion = !selectedRegion || card.dataset.region === selectedRegion;
                const isVisible = matchKeyword && matchYear && matchRegion;

                card.classList.toggle('is-filtered-out', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' 部';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
        if (region) {
            region.addEventListener('change', applyFilter);
        }

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && input) {
            input.value = q;
            applyFilter();
        }
    });

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        }, { once: true });
    });
})();
