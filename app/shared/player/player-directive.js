
angular.module('app.player.directive', [
    'app.player.service',
    'app.common.globals'
])

.service('players', function () {
    return {
        instance: new Array()
    }
})

.directive('plyr', [
  '$timeout', 'players', 'player',
  function ($timeout, players, playerService) {
    function lowercaseFirstLetter(string) {
      return string.charAt(0).toLowerCase() + string.slice(1);
    }

    return {
      scope: {
        playerSrc:'@'
      },
      /* jshint camelcase: false */
      link: function postLink(scope, element, attrs) {
        // Player
        plyr.setup({
            debug:  true,
            volume: 9,
            title:  "Demo",
            tooltips: true,
            captions: {
                defaultActive: true
            },
            onSetup: function() {
                if(!("media" in this)) { 
                    return;
                }

                var p  = this,
                    type    = p.media.tagName.toLowerCase(),
                    toggle  = document.querySelector("[data-toggle='fullscreen']");

                console.log("✓ Setup done for <" + type + ">");

                if(type === "video" && toggle) {
                    toggle.addEventListener("click", p.toggleFullscreen, false);
                }
            }
        });
        var src = scope.playerSrc;

        var player = element[0].plyr;
        var media = player.media;
        var playerID = element[0].id

        //player.source([{ src: src, type: "audio/mp3" }]);

        var callbacks = {
            playing: function() {
                console.log("Player:playing");
            },
            ended: function() {
                console.log('Player:ended');
                playerService.songEnded();
            },
            loadstart: function() {
                console.log('Player:loadstart ' + media.currentSrc);
            },
            timeupdate: function (event) {
                // Scrobble song once percentage is reached
                //var p = event.jPlayer.status.currentPercentAbsolute;
                //var isPlaying = !event.jPlayer.status.paused;
            },
            error: function(err) {
                var msg = {
                    id: err.file.id,
                    text: err.file.name + ' Error: ' + err.message
                }
                scope.$emit('editNotification', msg);
            }
        };

        if(callbacks) {
          var callbackMethods = ['playing', 'ended', 'loadstart', 'error', 'destroy'];
          angular.forEach(callbackMethods, function(method) {
            var callback = (callbacks[lowercaseFirstLetter(method)] || angular.noop);
            media.addEventListener(method, function() {
                callback.apply(null, arguments);
                if (!scope.$$phase && !scope.$root.$$phase) {
                    scope.$apply();
                }
            });
          });
        }

        /*
        scope.$watch(function () {
            return playerService.getPlayingSong();
        }, function (newSong) {
            if(newSong !== undefined) {
                scope.currentSong = newSong;
                //Page.setTitleSong(newSong);

                player.source([{ src: src, type: "audio/mp3" }]);
                player.play();
            }
        });
        */
        //uploaders.instance[scope.index] = uploader;
        //uploaders.instance.push(uploader);
      }
    };
  }
]);