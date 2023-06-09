"use strict";

import RTCMultiConnection from '../dist/RTCMulticonnection';
import { getHTMLMediaElement } from '../dev/getHTMLMediaElement';

var connection = null;
var mediaElement = null;
export class Screenshare {
    constructor(options) {
        this.options = options;
        this.connection = connection;
        this.InitConnection(this.options);
    }

    InitConnection(options) {
        connection = new RTCMultiConnection();
        this.connection = connection;
        connection.socketURL = 'https://vs.mindalay.com/';
        connection.enableLogs = false;
        connection.socketMessageEvent = options.roomId;
        connection.videosContainer = options.mediaContainer;

        connection.iceServers = [{
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        }];

        connection.session = {
            screen: true,
            oneway: true
        };

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };

        connection.onstream = function (event) {
            let existing = document.getElementById(event.streamid);
            if (existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }

            let video = document.createElement('video');
            getVideoElement(event, video);
            video.srcObject = event.stream;
            if (event.type === 'local') {
                mediaElement = getHTMLMediaElement(video, {
                    buttons: options.mediaControls,
                    // width: options.width,
                    type: event.type,
                    container: options.mediaContainer,
                    showOnMouseEnter: false,
                    onStope: stop,
                });
            } else {
                mediaElement = getHTMLMediaElement(video, {
                    buttons: options.mediaControls,
                    // width: options.width,
                    type: event.type,
                    container: options.mediaContainer,
                    showOnMouseEnter: false,
                });
            }
            mediaElement.id = event.streamid;
            mediaElement.classList.add(`${event.type}-stream`);

            mediaElement && connection.videosContainer.appendChild(mediaElement);

            setTimeout(function () {
                mediaElement && mediaElement.media.play();
            }, 5000);

            if (mediaElement) mediaElement.id = event.streamid;
        };

        if (navigator.connection && navigator.connection.downlink <= 0.115) {
            alert("2G connection: slow internet connection")
        };

        connection.onstreamended = function (event) {
            var mediaElement = document.getElementById(event.streamid);
            if (mediaElement) {
                mediaElement.parentNode.removeChild(mediaElement);
                stop();
            }
        };

        function getVideoElement(event, video) {
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            };

            if (event.type === 'local') {
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                };
            };
        }

        var stop = function onStopStream() {
            // disconnect with all users
            connection.getAllParticipants().forEach(function (pid) {
                connection.disconnectWith(pid);
            });

            // stop all local cameras
            connection.attachStreams.forEach(function (localStream) {
                localStream.stop();
            });

            // close socket.io connection
            connection.closeSocket();

            if (options.connection) {
                options.connection.invoke("stopScreenshare", options.entityId);
            }
        }
    }

    openRoom() {
        connection.open(connection.socketMessageEvent);
    }

    joinRoom() {
        connection.join(connection.socketMessageEvent);
    }

    openOrJoin() {
        connection.openOrJoin(connection.socketMessageEvent);
    }
}