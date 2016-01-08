/**
* app.player.service Module
*
* Manages the player and playing queue. Use it to play a song, go to next track or add songs to the queue.
*/
angular.module('app.player.service', [
    'ngLodash',
    'app.common.globals'
])

.factory('player', [
    'lodash', 
    '$rootScope',
    'globals',
    function (_, $rootScope) {
    'use strict';

    var playerVolume = 1.0;

    var player = {
        // playingIndex and playingSong aren't meant to be used, they only are public for unit-testing purposes
        _playingIndex: -1,
        _playingSong: undefined,
        queue: [],
        restartSong: false,
        loadSong: false,
        settings: {
            repeat: "none",
            repeatValues: ["queue", "song", "none"]
        },

        getPlayer: function(id) {
            return document.querySelectorAll(".player")[id].plyr;
        },

        play: function (song) {
            // Find the song's index in the queue, if it's in there
            var index = player.indexOfSong(song);
            player._playingIndex = (index !== undefined) ? index : -1;
            var nextID;
            var activePlayer = $rootScope.ViewData.activePlayer;
            if (activePlayer == 0) {
                nextID = 1;
            } else {
                nextID = 0;
            }
            console.log('PLAYER: ' + activePlayer);
            console.log('SONG: ' + JSON.stringify(song));
            var plyrNext = player.getPlayer(nextID);
            var plyrActive = player.getPlayer(activePlayer);
            //var mediaNext = plyrNext.media;
            //var mediaActive = plyrActive.media;
            plyrNext.source([
                { src: song.Url, type: song.MimeType }
            ]); 
            player._playingSong = song;
            $rootScope.ViewData.activePlayer = nextID;
            plyrNext.play();

            var nextSong = player.getNextTrack();
            if (nextSong) {
                plyrActive.source([
                    { src: nextSong.Url, type: nextSong.MimeType }
                ]);
            }
        },

        togglePause: function () {
            var plyrActive = player.getPlayer($rootScope.ViewData.activePlayer);
            if ($rootScope.ViewData.pauseSong) {
                plyrActive.play();
                $rootScope.ViewData.pauseSong = false;
            } else {
                plyrActive.pause();
                $rootScope.ViewData.pauseSong = true;
            }
        },

        playFirstSong: function () {
            player._playingIndex = 0;
            player.play(player.queue[0]);
        },

        load: function (song) {
            player.loadSong = true;
            player.play(song);
        },

        restart: function () {
            player.restartSong = true;
        },

        // Called from the player directive at the end of the current song
        songEnded: function () {
            if (player.settings.repeat === "song") {
                // repeat current track
                player.restart();
            } else if (player.isLastSongPlaying() === true) {
                if (player.settings.repeat === "queue") {
                    // Loop to first track in queue
                    player.playFirstSong();
                }
            } else {
                player.nextTrack();
            }
        },

        getNextTrack: function () {
            // Find the song's index in the queue, in case it changed (with a drag & drop)
            var index = player.indexOfSong(player._playingSong);
            player._playingIndex = (index !== undefined) ? index : -1;

            if ((player._playingIndex + 1) < player.queue.length) {
                var nextTrack = player.queue[player._playingIndex + 1];
                return nextTrack;
            } else {
                return false;
            }
        },

        nextTrack: function () {
            // Find the song's index in the queue, in case it changed (with a drag & drop)
            var index = player.indexOfSong(player._playingSong);
            player._playingIndex = (index !== undefined) ? index : -1;

            if ((player._playingIndex + 1) < player.queue.length) {
                var nextTrack = player.queue[player._playingIndex + 1];
                player._playingIndex++;
                player.play(nextTrack);
            }
        },

        previousTrack: function () {
            // Find the song's index in the queue, in case it changed (with a drag & drop)
            var index = player.indexOfSong(player._playingSong);
            player._playingIndex = (index !== undefined) ? index : -1;

            if ((player._playingIndex - 1) > 0) {
                var previousTrack = player.queue[player._playingIndex - 1];
                player._playingIndex--;
                player.play(previousTrack);
            } else if (player.queue.length > 0) {
                player.playFirstSong();
            }
        },

        emptyQueue: function () {
            player.queue = [];
            return player;
        },

        shuffleQueue: function () {
            var shuffled = _.without(player.queue, player._playingSong);
            shuffled = _.shuffle(shuffled);
            if (player._playingSong !== undefined) {
                shuffled.unshift(player._playingSong);
                player._playingIndex = 0;
            }
            player.queue = shuffled;
            return player;
        },

        playSong: function (song) {
            player.queue.push(song);
            player.play(song);
            return player;
        },

        addSong: function (song) {
            player.queue.push(song);
            return player;
        },

        addSongs: function (songs) {
            player.queue = player.queue.concat(songs);
            return player;
        },

        removeSong: function (song) {
            var index = player.queue.indexOf(song);
            player.queue.splice(index, 1);
            return player;
        },

        removeSongs: function (songs) {
            player.queue = _.difference(player.queue, songs);
            return player;
        },

        reorderQueue: function (oldIndex, newIndex) {
            if (oldIndex < 0 || oldIndex >= player.queue.length || newIndex < 0 || newIndex >= player.queue.length) {
                return player;
            }
            var song = player.queue[oldIndex];
            player.queue.splice(oldIndex, 1);
            player.queue.splice(newIndex, 0, song);
            return player;
        },

        getPlayingSong: function () {
            return player._playingSong;
        },

        isLastSongPlaying: function () {
            return ((player._playingIndex + 1) === player.queue.length);
        },

        indexOfSong: function (song) {
            for (var i = player.queue.length - 1; i >= 0; i--) {
                if (angular.equals(song, player.queue[i])) {
                    return i;
                }
            }
            return undefined;
        },

        turnVolumeUp: function () {
            var volume = playerVolume;
            if ((volume + 0.1) > 1 || volume < 0) {
                volume = 0.9;
            }
            volume += 0.1;
            playerVolume = Math.round(volume * 100) / 100;
            return volume;
        },

        turnVolumeDown: function () {
            var volume = playerVolume;
            if (volume > 1 || (volume - 0.1) < 0) {
                volume = 0.1;
            }
            volume -= 0.1;
            playerVolume = Math.round(volume * 100) / 100;
            return volume;
        },

        getVolume: function () {
            return playerVolume;
        },

        setVolume: function (volume) {
            if (volume > 1) {
                volume = 1;
            } else if (volume < 0) {
                volume = 0;
            }
            playerVolume = Math.round(volume * 100) / 100;
            return player;
        }
    };

    return player;
}]);
