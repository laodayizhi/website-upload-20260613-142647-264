document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-player]").forEach((player) => {
        const video = player.querySelector("video");
        const cover = player.querySelector("[data-play-cover]");
        const streamUrl = player.getAttribute("data-stream") || "";
        let initialized = false;
        let hls = null;

        const attachStream = () => {
            if (!video || !streamUrl || initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        };

        const play = () => {
            attachStream();
            if (cover) {
                cover.hidden = true;
            }
            if (video) {
                const result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(() => {
                        if (cover) {
                            cover.hidden = false;
                        }
                    });
                }
            }
        };

        if (cover) {
            cover.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", () => {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", () => {
                if (cover) {
                    cover.hidden = true;
                }
            });
        }

        window.addEventListener("beforeunload", () => {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
});
