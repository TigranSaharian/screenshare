// __________________
// getHTMLMediaElement.js

function getHTMLMediaElement(mediaElement, config) {
    config = config || {};

    if (!mediaElement.nodeName || (mediaElement.nodeName.toLowerCase() != 'audio' && mediaElement.nodeName.toLowerCase() != 'video')) {
        if (!mediaElement.getVideoTracks().length) {
            return getAudioElement(mediaElement, config);
        }

        var mediaStream = mediaElement;
        mediaElement = document.createElement(mediaStream.getVideoTracks().length ? 'video' : 'audio');

        try {
            mediaElement.setAttributeNode(document.createAttribute('autoplay'));
            mediaElement.setAttributeNode(document.createAttribute('playsinline'));
        } catch (e) {
            mediaElement.setAttribute('autoplay', true);
            mediaElement.setAttribute('playsinline', true);
        }

        if ('srcObject' in mediaElement) {
            mediaElement.srcObject = mediaStream;
        } else {
            mediaElement[!!navigator.mozGetUserMedia ? 'mozSrcObject' : 'src'] = !!navigator.mozGetUserMedia ? mediaStream : (window.URL || window.webkitURL).createObjectURL(mediaStream);
        }
    }

    if (mediaElement.nodeName && mediaElement.nodeName.toLowerCase() == 'audio') {
        return getAudioElement(mediaElement, config);
    }

    var buttons = config.buttons || ['mute-audio', 'mute-video', 'full-screen', 'volume-slider', 'stop'];
    buttons.has = function (element) {
        return buttons.indexOf(element) !== -1;
    };

    config.toggle = config.toggle || [];
    config.toggle.has = function (element) {
        return config.toggle.indexOf(element) !== -1;
    };

    var mediaElementContainer = document.createElement('div');
    mediaElementContainer.className = 'vnd--media-container';

    var mediaControls = document.createElement('div');
    mediaControls.className = 'media-controls';
    mediaElementContainer.appendChild(mediaControls);

    if (buttons.has('mute-audio')) {
        let mediaControlWrapper = document.createElement('div');
        mediaControlWrapper.className = 'media-control-wrapper';

        var muteAudio = document.createElement('div');
        muteAudio.className = 'control ' + (config.toggle.has('mute-audio') ? 'unmute-audio selected' : 'mute-audio');

        mediaControlWrapper.appendChild(muteAudio);
        mediaControls.appendChild(mediaControlWrapper);

        mediaControlWrapper.onclick = function () {
            if (muteAudio.className.indexOf('unmute-audio') != -1) {
                mediaControlWrapper.classList.remove('selected'); // = mediaControlWrapper.className.replace('unmute-audio selected', 'mute-audio');
                muteAudio.className = muteAudio.className.replace('unmute-audio', 'mute-audio');
                mediaElement.muted = false;
                mediaElement.volume = 1;
                if (config.onUnMuted) config.onUnMuted('audio');
            } else {
                mediaControlWrapper.classList.add('selected');
                muteAudio.className = muteAudio.className.replace('mute-audio', 'unmute-audio');
                mediaElement.muted = true;
                mediaElement.volume = 0;
                if (config.onMuted) config.onMuted('audio');
            }
        };
    }

    if (buttons.has('mute-video')) {
        let mediaControlWrapper = document.createElement('div');
        mediaControlWrapper.className = 'media-control-wrapper';

        var muteVideo = document.createElement('div');
        muteVideo.className = 'control ' + (config.toggle.has('mute-video') ? 'unmute-video selected' : 'mute-video');

        mediaControlWrapper.appendChild(muteVideo);
        mediaControls.appendChild(mediaControlWrapper);

        mediaControlWrapper.onclick = function () {
            if (muteVideo.className.indexOf('unmute-video') != -1) {
                mediaControlWrapper.classList.remove('selected');
                muteVideo.className = muteVideo.className.replace('unmute-video', 'mute-video');
                mediaElement.muted = false;
                mediaElement.volume = 1;
                mediaElement.play();
                if (config.onUnMuted) config.onUnMuted('video');
            } else {
                mediaControlWrapper.classList.add('selected');
                muteVideo.className = muteVideo.className.replace('mute-video', 'unmute-video');
                mediaElement.muted = true;
                mediaElement.volume = 0;
                mediaElement.pause();
                if (config.onMuted) config.onMuted('video');
            }
        };
    }

    if (buttons.has('take-snapshot')) {
        var takeSnapshot = document.createElement('div');
        takeSnapshot.className = 'control take-snapshot';
        mediaControls.appendChild(takeSnapshot);

        takeSnapshot.onclick = function () {
            if (config.onTakeSnapshot) config.onTakeSnapshot();
        };
    }

    if (buttons.has('stop')) {
        let mediaControlWrapper = document.createElement('div');
        mediaControlWrapper.className = 'media-control-wrapper';
        mediaControlWrapper.style.backgroundColor = '#cf000f';
        mediaControlWrapper.id = 'vnd_stop_stream';

        var stop = document.createElement('div');
        stop.className = 'control stop';
        mediaControlWrapper.appendChild(stop)
        mediaControls.appendChild(mediaControlWrapper);

        mediaControlWrapper.onclick = function () {
            config.container.innerHTML = '';
            if (config.onStope) config.onStope();
        };
    }

    var volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';

    if (buttons.has('record-audio')) {
        var recordAudio = document.createElement('div');
        recordAudio.className = 'control ' + (config.toggle.has('record-audio') ? 'stop-recording-audio selected' : 'record-audio');
        volumeControl.appendChild(recordAudio);

        recordAudio.onclick = function () {
            if (recordAudio.className.indexOf('stop-recording-audio') != -1) {
                recordAudio.className = recordAudio.className.replace('stop-recording-audio selected', 'record-audio');
                if (config.onRecordingStopped) config.onRecordingStopped('audio');
            } else {
                recordAudio.className = recordAudio.className.replace('record-audio', 'stop-recording-audio selected');
                if (config.onRecordingStarted) config.onRecordingStarted('audio');
            }
        };
    }

    if (buttons.has('record-video')) {
        var recordVideo = document.createElement('div');
        recordVideo.className = 'control ' + (config.toggle.has('record-video') ? 'stop-recording-video selected' : 'record-video');
        volumeControl.appendChild(recordVideo);

        recordVideo.onclick = function () {
            if (recordVideo.className.indexOf('stop-recording-video') != -1) {
                recordVideo.className = recordVideo.className.replace('stop-recording-video selected', 'record-video');
                if (config.onRecordingStopped) config.onRecordingStopped('video');
            } else {
                recordVideo.className = recordVideo.className.replace('record-video', 'stop-recording-video selected');
                if (config.onRecordingStarted) config.onRecordingStarted('video');
            }
        };
    }

    if (buttons.has('volume-slider')) {
        var volumeSlider = document.createElement('div');
        volumeSlider.className = 'control volume-slider';
        volumeControl.appendChild(volumeSlider);

        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 100;
        slider.onchange = function () {
            mediaElement.volume = '.' + slider.value.toString().substr(0, 1);
        };
        volumeSlider.appendChild(slider);
    }

    if (buttons.has('full-screen')) {
        let mediaControlWrapper = document.createElement('div');
        mediaControlWrapper.className = 'media-control-zoom-wrapper';

        var zoom = document.createElement('div');
        zoom.className = 'control ' + (config.toggle.has('zoom-in') ? 'zoom-out' : 'zoom-in');
        mediaControlWrapper.appendChild(zoom);

        if (!slider && !recordAudio && !recordVideo && zoom) {
            mediaControls.insertBefore(mediaControlWrapper, mediaControls.firstChild);
        } else volumeControl.appendChild(mediaControlWrapper);

        mediaControlWrapper.onclick = function () {
            if (zoom.className.indexOf('zoom-out') != -1) {
                mediaControlWrapper.classList.remove('selected');
                zoom.className = zoom.className.replace('zoom-out', 'zoom-in');
                exitFullScreen();
            } else {
                mediaControlWrapper.classList.add('selected')
                zoom.className = zoom.className.replace('zoom-in', 'zoom-out');
                launchFullscreen(mediaElementContainer.closest('.remote-stream'));
            }
        };

        function launchFullscreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }

        function exitFullScreen() {
            if (document.fullscreen) {
                document.exitFullscreen();
            }

            if (document.mozFullScreen) {
                document.mozCancelFullScreen();
            }

            if (document.webkitIsFullScreen) {
                document.webkitExitFullscreen();
            }
        }

        function screenStateChange(e) {
            mediaElementContainer = mediaElementContainer.closest('.remote-stream');
            if (e.srcElement != mediaElementContainer) return;

            var isFullScreeMode = document.webkitIsFullScreen || document.mozFullScreen || document.fullscreen;

            if (isFullScreeMode) mediaElementContainer.style.width = window.innerWidth - 20 + 'px';
            else mediaElementContainer.style.width = config.width + 'px';
            // mediaElementContainer.style.width = (isFullScreeMode ? (parent.innerWidth - 20) : config.width) + 'px';
            mediaElementContainer.style.display = isFullScreeMode ? 'block' : 'inline-block';

            if (config.height) {
                mediaBox.style.height = (isFullScreeMode ? (window.innerHeight - 20) : config.height) + 'px';
            }

            if (!isFullScreeMode && config.onZoomout) config.onZoomout();
            if (isFullScreeMode && config.onZoomin) config.onZoomin();

            if (!isFullScreeMode && zoom.className.indexOf('zoom-out') != -1) {
                mediaControlWrapper.classList.remove('selected');
                zoom.className = zoom.className.replace('zoom-out', 'zoom-in');
                if (config.onZoomout) config.onZoomout();
            }
            // setTimeout(adjustControls, 1000);
        }

        document.addEventListener('fullscreenchange', screenStateChange, false);
        document.addEventListener('mozfullscreenchange', screenStateChange, false);
        document.addEventListener('webkitfullscreenchange', screenStateChange, false);
    }

    if (buttons.has('volume-slider') || buttons.has('full-screen') || buttons.has('record-audio') || buttons.has('record-video')) {
        // mediaElementContainer.appendChild(volumeControl);
    }

    var mediaBox = document.createElement('div');
    mediaBox.className = 'media-box';
    mediaElementContainer.appendChild(mediaBox);

    if (config.title) {
        var h2 = document.createElement('h2');
        h2.innerHTML = config.title;
        h2.setAttribute('style', 'position: absolute;color:white;font-size:17px;text-shadow: 1px 1px black;padding:0;margin:0;text-align: left; margin-top: 10px; margin-left: 10px; display: block; border: 0;line-height:1.5;z-index:1;');
        mediaBox.appendChild(h2);
    }

    mediaBox.appendChild(mediaElement);

    // if (!config.width) config.width = (innerWidth / 2) - 50;

    mediaElementContainer.style.width = config.width + 'px';

    if (config.height) {
        mediaBox.style.height = config.height + 'px';
    }

    // mediaBox.querySelector('video').style.maxHeight = innerHeight + 'px';

    var times = 0;

    function adjustControls() {
        mediaControls.style.marginLeft = (mediaElementContainer.clientWidth - mediaControls.clientWidth - 2) + 'px';

        if (slider) {
            slider.style.width = (mediaElementContainer.clientWidth / 3) + 'px';
            volumeControl.style.marginLeft = (mediaElementContainer.clientWidth / 3 - 30) + 'px';

            if (zoom) zoom.style['border-top-right-radius'] = '5px';
        } else {
            volumeControl.style.marginLeft = (mediaElementContainer.clientWidth - volumeControl.clientWidth - 2) + 'px';
        }

        volumeControl.style.marginTop = (mediaElementContainer.clientHeight - volumeControl.clientHeight - 2) + 'px';

        if (times < 10) {
            times++;
            setTimeout(adjustControls, 1000);
        } else times = 0;
    }

    if (config.showOnMouseEnter || typeof config.showOnMouseEnter === 'undefined') {
        mediaElementContainer.onmouseenter = mediaElementContainer.onmousedown = function () {
            // adjustControls();
            mediaControls.style.opacity = 1;
            volumeControl.style.opacity = 1;
        };

        mediaElementContainer.onmouseleave = function () {
            mediaControls.style.opacity = 0;
            volumeControl.style.opacity = 0;
        };
    } else {
        setTimeout(function () {
            // adjustControls();
            setTimeout(function () {
                mediaControls.style.opacity = 1;
                volumeControl.style.opacity = 1;
            }, 300);
        }, 700);
    }

    // adjustControls();

    mediaElementContainer.toggle = function (clasName) {
        if (typeof clasName != 'string') {
            for (var i = 0; i < clasName.length; i++) {
                mediaElementContainer.toggle(clasName[i]);
            }
            return;
        }

        if (clasName == 'mute-audio' && muteAudio) muteAudio.onclick();
        if (clasName == 'mute-video' && muteVideo) muteVideo.onclick();

        if (clasName == 'record-audio' && recordAudio) recordAudio.onclick();
        if (clasName == 'record-video' && recordVideo) recordVideo.onclick();

        if (clasName == 'stop' && stop) stop.onclick();

        return this;
    };

    mediaElementContainer.media = mediaElement;

    return mediaElementContainer;
}
// __________________
// getAudioElement.js

function getAudioElement(mediaElement, config) {
    config = config || {};

    if (!mediaElement.nodeName || (mediaElement.nodeName.toLowerCase() != 'audio' && mediaElement.nodeName.toLowerCase() != 'video')) {
        var mediaStream = mediaElement;
        mediaElement = document.createElement('audio');

        try {
            mediaElement.setAttributeNode(document.createAttribute('autoplay'));
            mediaElement.setAttributeNode(document.createAttribute('controls'));
        } catch (e) {
            mediaElement.setAttribute('autoplay', true);
            mediaElement.setAttribute('controls', true);
        }

        if ('srcObject' in mediaElement) {
            mediaElement.mediaElement = mediaStream;
        } else {
            mediaElement[!!navigator.mozGetUserMedia ? 'mozSrcObject' : 'src'] = !!navigator.mozGetUserMedia ? mediaStream : (window.URL || window.webkitURL).createObjectURL(mediaStream);
        }
    }

    var buttons = config.buttons || ['mute-audio', 'volume-slider', 'stop'];
    buttons.has = function (element) {
        return buttons.indexOf(element) !== -1;
    };

    config.toggle = config.toggle || [];
    config.toggle.has = function (element) {
        return config.toggle.indexOf(element) !== -1;
    };

    var mediaElementContainer = document.createElement('div');
    mediaElementContainer.className = 'vnd--media-container';

    if (config.type === 'remote') {
        var mediaControls = document.createElement('div');
        mediaControls.className = 'media-controls';
        mediaElementContainer.appendChild(mediaControls);

        let audioControlWrapper = document.createElement('div');
        audioControlWrapper.className = 'media-control-wrapper';

        var muteAudio = document.createElement('div');
        muteAudio.className = 'control ' + (config.toggle.has('mute-audio') ? 'unmute-audio selected' : 'mute-audio');
        audioControlWrapper.appendChild(muteAudio);
        mediaControls.appendChild(audioControlWrapper);

        audioControlWrapper.onclick = function () {
            if (muteAudio.className.indexOf('unmute-audio') != -1) {
                audioControlWrapper.classList.remove('selected');
                muteAudio.className = muteAudio.className.replace('unmute-audio', 'mute-audio');
                mediaElement.muted = false;
                if (config.onUnMuted) config.onUnMuted('audio');
            } else {
                audioControlWrapper.classList.add('selected');
                muteAudio.className = muteAudio.className.replace('mute-audio', 'unmute-audio');
                mediaElement.muted = true;
                if (config.onMuted) config.onMuted('audio');
            }
        };

        if (!config.buttons || (config.buttons && config.buttons.indexOf('record-audio') != -1)) {
            var recordAudio = document.createElement('div');
            recordAudio.className = 'control ' + (config.toggle.has('record-audio') ? 'stop-recording-audio selected' : 'record-audio');
            mediaControls.appendChild(recordAudio);

            recordAudio.onclick = function () {
                if (recordAudio.className.indexOf('stop-recording-audio') != -1) {
                    recordAudio.className = recordAudio.className.replace('stop-recording-audio selected', 'record-audio');
                    if (config.onRecordingStopped) config.onRecordingStopped('audio');
                } else {
                    recordAudio.className = recordAudio.className.replace('record-audio', 'stop-recording-audio selected');
                    if (config.onRecordingStarted) config.onRecordingStarted('audio');
                }
            };
        }

        let stopControlWrapper = document.createElement('div');
        stopControlWrapper.className = 'media-control-wrapper';
        stopControlWrapper.style.backgroundColor = '#cf000f';
        stopControlWrapper.id = 'vnd_stop_stream';

        var stop = document.createElement('div');
        stop.className = 'control stop';
        stopControlWrapper.appendChild(stop)
        mediaControls.appendChild(stopControlWrapper);

        stopControlWrapper.onclick = function () {
            config.container.innerHTML = '';;
            if (config.onStope) config.onStope();
        };

        if (config.showOnMouseEnter || typeof config.showOnMouseEnter === 'undefined') {
            mediaElementContainer.onmouseenter = mediaElementContainer.onmousedown = function () {
                //adjustControls();
                mediaControls.style.opacity = 1;
            };

            mediaElementContainer.onmouseleave = function () {
                mediaControls.style.opacity = 0;
            };
        } else {
            setTimeout(function () {
                //adjustControls();
                setTimeout(function () {
                    mediaControls.style.opacity = 1;
                }, 300);
            }, 700);
        }

        var mediaBox = document.createElement('div');
        mediaBox.className = 'media-box';
        mediaBox.style.height = '53px';
        mediaElement.style.display = 'none';
        mediaElement.style.opacity = 0;
        mediaElementContainer.appendChild(mediaBox);
        mediaBox.appendChild(mediaElement);
    }

    mediaElementContainer.style.width = '95px';
    mediaElementContainer.style.borderRadius = '20px';

    var times = 0;

    function adjustControls() {
        mediaControls.style.marginLeft = (mediaElementContainer.clientWidth - mediaControls.clientWidth - 7) + 'px';
        mediaControls.style.marginTop = (mediaElementContainer.clientHeight - mediaControls.clientHeight - 6) + 'px';
        if (times < 10) {
            times++;
            setTimeout(adjustControls, 1000);
        } else times = 0;
    }
    //adjustControls();

    mediaElementContainer.toggle = function (clasName) {
        if (typeof clasName != 'string') {
            for (var i = 0; i < clasName.length; i++) {
                mediaElementContainer.toggle(clasName[i]);
            }
            return;
        }

        if (clasName == 'mute-audio' && muteAudio) muteAudio.onclick();
        if (clasName == 'record-audio' && recordAudio) recordAudio.onclick();
        if (clasName == 'stop' && stop) stop.onclick();

        return this;
    };

    mediaElementContainer.media = mediaElement;
    return mediaElementContainer;
}

const _getHTMLMediaElement = getHTMLMediaElement;
export { _getHTMLMediaElement as getHTMLMediaElement };

const _getAudioElement = getAudioElement;
export { _getAudioElement as getAudioElement }; 