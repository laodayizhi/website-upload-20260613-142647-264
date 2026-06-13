import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(player) {
    var video = player.querySelector("video");
    var startButton = player.querySelector("[data-play-button]");
    var source = player.getAttribute("data-video-src");
    var hlsInstance = null;

    if (!video || !startButton || !source) {
        return;
    }

    function loadSource() {
        if (video.getAttribute("data-loaded") === "true") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        video.setAttribute("data-loaded", "true");
    }

    function play() {
        loadSource();
        player.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.setAttribute("controls", "controls");
            });
        }
    }

    startButton.addEventListener("click", play);
    video.addEventListener("play", function () {
        player.classList.add("is-playing");
    });
    video.addEventListener("error", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
