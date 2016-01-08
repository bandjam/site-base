/**
* app.notifications Module
*
* Provides access to the notification UI.
*/
angular.module('app.notifications', [
    'app.utils',
    'app.common.globals'
    ])

.service('notification', [
    '$rootScope', 
    '$window', 
    '$interval', 
    'globals', 
    'utils',
    function(
        $rootScope, 
        $window, 
        $interval, 
        globals, 
        utils) {
        'use strict';

        var notification = {

            updateMessage: function (msg, autohide) {
                if (msg !== '') {
                    var id = $rootScope.Messages.push(msg) - 1;
                    $('#messages').fadeIn();
                    if (autohide) {
                        setTimeout(function () {
                            $('#msg_' + id).fadeOut(function () { $(this).remove(); });
                        }, globals.settings.Timeout);
                    }
                }
            },
            editMessage: function(item) { 
                var index = utils.findIndexByKeyValue($rootScope.Messages, 'id', item.id);
                $rootScope.Messages.splice(index, 1);
                $rootScope.Messages.splice(index, 0, item);
            },
            removeMessage: function(item) { 
                var index = $rootScope.Messages.indexOf(item);
                $rootScope.Messages.splice(index, 1);     
            },
            addMessage: function(data) {
                if (typeof data.text != 'undefined') {
                    $rootScope.Messages.push(data); 
                } else {
                    var msg = {
                        id: $rootScope.Messages.length + 1,
                        text: data
                    }
                    $rootScope.Messages.push(msg); 
                }
            },
            requestPermissionIfRequired: function () {
                if (notification.isSupported() && !notification.hasPermission()) {
                    window.Notify.requestPermission();
                }
            },
            hasPermission: function () {
                return !$window.Notify.needsPermission();
            },
            isSupported: function () {
                return window.Notify.isSupported();
            },
            showNotification: function (song) {
                if (notification.hasPermission()) {
                    var notification = new Notify(utils.toHTML.un(song.name), {
                        body: utils.toHTML.un(song.artist + " - " + song.album),
                        icon: song.coverartthumb,
                        notifyClick: function () {
                            player.nextTrack();
                            this.close();
                            $rootScope.$apply();
                        }
                    });
                    $interval(function() {
                        notification.close();
                    }, globals.settings.Timeout);
                    notification.show();
                } else {
                    console.log("showNotification: No Permission");
                }
            }
        }

        return notification;
}]);
