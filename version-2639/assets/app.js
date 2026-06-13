(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                showSlide(dotIndex);
                startHero();
            });
        });

        showSlide(0);
        startHero();

        var globalSearch = document.querySelector("[data-global-search]");
        var globalButton = document.querySelector("[data-global-search-button]");

        function openSearch() {
            if (!globalSearch) {
                return;
            }
            var value = globalSearch.value.trim();
            if (value) {
                window.location.href = "./ranking.html?q=" + encodeURIComponent(value);
            }
        }

        if (globalButton) {
            globalButton.addEventListener("click", openSearch);
        }

        if (globalSearch) {
            globalSearch.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    openSearch();
                }
            });
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var regionSelect = document.querySelector("[data-region-select]");
        var typeSelect = document.querySelector("[data-type-select]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var items = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-meta]"));
        var empty = document.querySelector("[data-empty-state]");
        var activeChip = "all";

        function setInitialQuery() {
            if (!filterInput) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                filterInput.value = query;
            }
        }

        function applyFilters() {
            if (!items.length) {
                return;
            }

            var query = normalize(filterInput ? filterInput.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;

            items.forEach(function (item) {
                var text = normalize(item.dataset.title + " " + item.dataset.tags + " " + item.dataset.meta);
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchRegion = !region || text.indexOf(region) !== -1;
                var matchType = !type || text.indexOf(type) !== -1;
                var matchChip = activeChip === "all" || text.indexOf(activeChip) !== -1;
                var matched = matchQuery && matchRegion && matchType && matchChip;

                item.classList.toggle("hidden-by-filter", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        setInitialQuery();

        if (filterInput) {
            filterInput.addEventListener("input", applyFilters);
        }

        if (regionSelect) {
            regionSelect.addEventListener("change", applyFilters);
        }

        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (node) {
                    node.classList.remove("active");
                });
                chip.classList.add("active");
                activeChip = normalize(chip.dataset.filterChip || "all");
                applyFilters();
            });
        });

        applyFilters();
    });

    window.setupMoviePlayer = function (source) {
        ready(function () {
            var wrap = document.querySelector(".video-wrap");
            var video = document.querySelector("#main-video");
            var button = document.querySelector(".play-layer");
            var hlsInstance = null;

            if (!wrap || !video || !source) {
                return;
            }

            function bindSource() {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (video.getAttribute("src") !== source) {
                        video.setAttribute("src", source);
                    }
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    }
                }
            }

            function start() {
                bindSource();
                wrap.classList.add("playing");
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {
                        wrap.classList.remove("playing");
                    });
                }
            }

            bindSource();

            if (button) {
                button.addEventListener("click", start);
            }

            video.addEventListener("play", function () {
                wrap.classList.add("playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    wrap.classList.remove("playing");
                }
            });
        });
    };
})();
