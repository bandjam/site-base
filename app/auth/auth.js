/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.artist.controller', [
    'ngLodash',
    'app.utils',
    'app.api.service'
])

.controller('artistController', [
    '$scope',
    '$rootScope',
    '$route',
    '$routeParams',
    '$location',
    '$window',
    'lodash',
    'utils',
    'api',
    function ( 
        $scope,
        $rootScope,
        $route,
        $routeParams,
        $location,
        $window,
        _,
        utils,
        api
    ) {
    'use strict';

    _.extend($scope, {
        FormData: {
        },
        ViewData: { 
        },
        go: go
    });

    function init () {
    };

        // fire on controller loaded

    function login() {
        var data = { 'AlbumName': $scope.FormData.AlbumName };
        var promise = api.apiRequest('addAlbum', 'POST', data);
        $scope.handleErrors(promise).then(function (data) {
            getAlbums();
            $scope.albumForm.$setPristine();
            $scope.FormData.AlbumName = "";
        }, function (error) {
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
        return false;
    };

    function go(url) {
        utils.go(url);
    }

    /**
     * Handles error notifications in case of a subsonic error or an HTTP error. Sets a 'serviceError' flag when
     * it is neither.
     * @param  {Promise} promise a Promise that must be resolved or rejected with an object : {'reason': a message that can be displayed to a user, 'httpError': the HTTP error code, 'subsonicError': the error Object sent by Subsonic}
     * @return {Promise}         the original promise passed as argument. That way we can chain it further !
     */
    // TODO: Hyz: Move this to a response interceptor ?
    $scope.handleErrors = function (promise) {
        promise.then(null, function (error) {
            var errorNotif;
            if (error.subsonicError !== undefined) {
                errorNotif = error.reason + ' ' + error.subsonicError.message;
            } else if (error.httpError !== undefined) {
                errorNotif = error.reason + ' HTTP error ' + error.httpError;
            } else {
                error.serviceError = true;
            }
            if (error.subsonicError !== undefined || error.httpError !== undefined) {
                //notifications.updateMessage(errorNotif, true);
            }
        });
       return promise;
    };

    /* Launch on Startup */
    /* End Startup */
}]);
