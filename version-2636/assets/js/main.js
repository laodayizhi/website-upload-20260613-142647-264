(function () {
  var panel = document.querySelector("[data-mobile-panel]");
  var toggle = document.querySelector("[data-menu-toggle]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (input && input.value.trim()) {
        form.action = "search.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    var setSlide = function (next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
    var empty = scope.querySelector("[data-empty-state]");
    var activeValue = "all";

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }

    var normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    var apply = function () {
      var query = normalize(input ? input.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year"));
        var textMatch = !query || haystack.indexOf(query) !== -1;
        var valueMatch = activeValue === "all" || haystack.indexOf(normalize(activeValue)) !== -1;
        var visible = textMatch && valueMatch;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeValue = button.getAttribute("data-filter-value") || "all";
        apply();
      });
    });

    apply();
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-start]");
    var hlsInstance = null;
    var initialized = false;

    var load = function () {
      if (!video || initialized) {
        return;
      }

      var source = video.getAttribute("data-video");
      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var play = function () {
      load();
      if (button) {
        button.hidden = true;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (button) {
            button.hidden = false;
          }
        });
      }
    };

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!initialized || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.hidden = true;
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.hidden = false;
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
