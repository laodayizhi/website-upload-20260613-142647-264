(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        if (!input) {
            return;
        }
        var typeSelect = document.querySelector("[data-type-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var empty = document.querySelector("[data-empty-state]");

        function applyFilter() {
            var query = normalize(input.value);
            var typeValue = typeSelect ? normalize(typeSelect.value) : "";
            var yearValue = yearSelect ? normalize(yearSelect.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchType = !typeValue || cardType === typeValue;
                var matchYear = !yearValue || cardYear === yearValue;
                var matched = matchQuery && matchType && matchYear;
                card.classList.toggle("hidden-by-filter", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        input.addEventListener("input", applyFilter);
        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            input.value = q;
        }
        applyFilter();
    }

    function setupPosterFallback() {
        var images = document.querySelectorAll(".poster-frame img, .related-thumb img");
        images.forEach(function (img) {
            img.addEventListener("error", function () {
                img.style.display = "none";
                var frame = img.closest(".poster-frame");
                if (frame) {
                    frame.classList.add("poster-fallback");
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupPageFilter();
        setupPosterFallback();
    });
}());
