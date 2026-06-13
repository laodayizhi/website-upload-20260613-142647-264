import { H as Hls } from './hls-vendor.js';

function showMessage(message) {
    const playerShell = document.querySelector('.player-shell');
    if (!playerShell) {
        return;
    }

    let notice = playerShell.querySelector('.player-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.className = 'player-notice';
        notice.style.position = 'absolute';
        notice.style.left = '16px';
        notice.style.right = '16px';
        notice.style.bottom = '16px';
        notice.style.zIndex = '5';
        notice.style.padding = '12px 16px';
        notice.style.borderRadius = '16px';
        notice.style.background = 'rgba(0, 0, 0, 0.72)';
        notice.style.color = '#fff';
        notice.style.fontWeight = '700';
        playerShell.appendChild(notice);
    }
    notice.textContent = message;
}

function playSource(video, src) {
    if (!video || !src) {
        showMessage('当前页面未找到可用播放源。');
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
                showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
                showMessage('视频加载失败，请检查播放源或网络环境。');
                hls.destroy();
            }
        });
        return;
    }

    showMessage('当前浏览器不支持 HLS 播放。');
}

document.querySelectorAll('[data-play-src]').forEach(function (button) {
    button.addEventListener('click', function () {
        const targetId = button.getAttribute('data-player-target');
        const video = document.getElementById(targetId);
        const source = button.getAttribute('data-play-src');
        const cover = document.querySelector('[data-player-cover]');

        if (cover) {
            cover.classList.add('is-hidden');
        }
        playSource(video, source);
    });
});
