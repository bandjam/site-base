/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.api.controller', [
    'app.api.service'
])

.controller('apiController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$window',
    'globals',
    'api',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $window,
        _,
        globals,
        api
    ) {
    'use strict';

    _.extend($scope, {
    });

    $scope.getArtists = function (folder) {
        var savedFolder = $scope.SelectedMusicFolder;
        if (isNaN(folder) && savedFolder) {
            folder = savedFolder.id;
        }
        var promise = subsonic.getArtists(folder);
        $scope.handleErrors(promise).then(function (data) {
            $scope.index = data.index;
            $scope.shortcut = data.shortcut;
        }, function (error) {
            $scope.index = [];
            $scope.shortcut = [];
            if (error.serviceError === true) {
                notifications.updateMessage(error.reason, true);
            }
        });
    };

    /* Launch on Startup */
    $scope.getArtists();
    /* End Startup */
}]);
