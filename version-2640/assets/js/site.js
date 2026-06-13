document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", () => {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;
        let timer = null;

        const show = (nextIndex) => {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        const start = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll("[data-site-search-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[type='search'], input[name='q']");
            const query = input ? input.value.trim() : "";
            const url = query ? `./library.html?q=${encodeURIComponent(query)}` : "./library.html";
            window.location.href = url;
        });
    });

    document.querySelectorAll("[data-movie-section]").forEach((section) => {
        const grid = section.querySelector("[data-movie-grid]");
        if (!grid) {
            return;
        }

        const cards = Array.from(grid.children).filter((item) => item.matches(".movie-card, .rank-item"));
        const search = section.querySelector("[data-movie-search]");
        const filters = Array.from(section.querySelectorAll("[data-movie-filter]"));
        const sort = section.querySelector("[data-movie-sort]");
        const empty = section.querySelector("[data-empty-state]");

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (query && search) {
            search.value = query;
        }

        const cardValue = (card, key) => (card.dataset[key] || "").toLowerCase();

        const apply = () => {
            const text = search ? search.value.trim().toLowerCase() : "";
            const activeFilters = filters.map((filter) => ({
                key: filter.dataset.movieFilter,
                value: filter.value.trim().toLowerCase()
            })).filter((filter) => filter.value);

            let visibleCards = cards.filter((card) => {
                const haystack = [
                    cardValue(card, "title"),
                    cardValue(card, "year"),
                    cardValue(card, "type"),
                    cardValue(card, "region"),
                    cardValue(card, "genre")
                ].join(" ");
                const textMatch = !text || haystack.includes(text);
                const filterMatch = activeFilters.every((filter) => cardValue(card, filter.key).includes(filter.value));
                return textMatch && filterMatch;
            });

            const sortMode = sort ? sort.value : "default";
            visibleCards = visibleCards.slice().sort((a, b) => {
                if (sortMode === "year-desc") {
                    return Number(cardValue(b, "year")) - Number(cardValue(a, "year"));
                }
                if (sortMode === "year-asc") {
                    return Number(cardValue(a, "year")) - Number(cardValue(b, "year"));
                }
                if (sortMode === "heat-desc") {
                    return Number(cardValue(b, "heat")) - Number(cardValue(a, "heat"));
                }
                if (sortMode === "title-asc") {
                    return cardValue(a, "title").localeCompare(cardValue(b, "title"), "zh-Hans-CN");
                }
                return cards.indexOf(a) - cards.indexOf(b);
            });

            cards.forEach((card) => {
                card.hidden = true;
            });
            visibleCards.forEach((card) => {
                card.hidden = false;
                grid.appendChild(card);
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCards.length === 0);
            }
        };

        if (search) {
            search.addEventListener("input", apply);
        }
        filters.forEach((filter) => filter.addEventListener("change", apply));
        if (sort) {
            sort.addEventListener("change", apply);
        }
        apply();
    });
});
