(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function bindMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-btn]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function bindHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function bindFilters() {
        document.querySelectorAll("[data-catalog-filter]").forEach(function (bar) {
            var grid = bar.parentElement.querySelector("[data-filter-grid]");
            if (!grid) {
                return;
            }
            var keyword = bar.querySelector("[data-filter-keyword]");
            var year = bar.querySelector("[data-filter-year]");
            var type = bar.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(grid.children);
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            var queryInput = bar.querySelector("[data-query-input]");
            if (queryInput && query) {
                queryInput.value = query;
            }

            function match(card) {
                var key = keyword ? keyword.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                if (key && text.indexOf(key) === -1) {
                    return false;
                }
                if (yearValue && cardYear.indexOf(yearValue) === -1) {
                    return false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1) {
                    return false;
                }
                return true;
            }

            function apply() {
                cards.forEach(function (card) {
                    card.hidden = !match(card);
                });
            }

            [keyword, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.initMoviePlayer = function (videoSource) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var state = document.querySelector("[data-player-state]");
        if (!video || !videoSource) {
            return;
        }
        var attached = false;
        var hls = null;

        function showState(message) {
            if (state) {
                state.textContent = message;
                state.hidden = false;
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoSource);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showState("视频暂时无法播放");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoSource;
            } else {
                showState("视频暂时无法播放");
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function toggle() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        bindSearchForms();
        bindMobileMenu();
        bindHero();
        bindFilters();
    });
})();
