(function () {
    window.setupPlayer = function (source) {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-play-button]');
        if (!shell || !video || !button || !source) {
            return;
        }

        var loaded = false;
        var hls = null;

        var load = function () {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
            }
        };

        var play = function () {
            load();
            shell.classList.add('is-playing');
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };

        button.addEventListener('click', play);
        shell.addEventListener('click', function (event) {
            if (event.target === shell || event.target === button || event.target.closest('[data-play-button]')) {
                play();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
