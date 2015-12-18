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

    function handleRequest(res) {
        var token = res.data ? res.data.token : null;
        if(token) { console.log('JWT:', token); }
        self.message = res.data.message;
    }

    function login() {
        api.login(self.username, self.password)
          .then(handleRequest, handleRequest)
    }
    function register() {
        api.register(self.username, self.password)
          .then(handleRequest, handleRequest)
    }
    function getQuote() {
        auth.getQuote()
          .then(handleRequest, handleRequest)
    }
    function logout() {
        auth.logout && auth.logout()
    }
    function isAuthed() {
        return auth.isAuthed ? auth.isAuthed() : false
    }

    /* Launch on Startup */
    /* End Startup */
}]);
