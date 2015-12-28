/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.auth.controller', [
    'ngLodash',
    'app.utils',
    'app.auth.service'
])

.controller('authController', [
    '$scope',
    '$rootScope',
    '$route',
    '$routeParams',
    '$location',
    '$window',
    'lodash',
    'utils',
    'api',
    'auth',
    'session',
    'AUTH_EVENTS',
    function ( 
        $scope,
        $rootScope,
        $route,
        $routeParams,
        $location,
        $window,
        _,
        utils,
        api,
        auth,
        session,
        AUTH_EVENTS
    ) {
    'use strict';

    _.extend($scope, {
        FormData: {
            Login: {
                UserName: "test",
                UserPassword: "test"
            },
            Register: {
                UserName: "",
                UserPassword: "",
                UserEmail: ""
            }
        },
        ViewData: { 
        },
        go: go,
        login: login,
        register: register
    });

    function init () {
    };

    function go(url) {
        utils.go(url);
    }

    function handleRequest(res) {
        var token = res.data ? res.data.token : null;
        if(token) { console.log('JWT:', token); }
        //self.message = res.data.message;
    }

    function login() {
        var username = $scope.FormData.UserName;
        var password = $scope.FormData.UserPassword;
        auth.login(username, password).then(function (res) {
            session.create(res.data.userID, res.data.userName, res.data.userRole);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentUser(res.data.user);
        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    }
    function register() {
        auth.register($scope.FormData.Register).then(function (res) {
            session.create(res.data.userID, res.data.userName, res.data.userRole);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentUser(res.data.user);
        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    }
    function logout() {
        auth.logout && auth.logout()
    }

    /* Launch on Startup */
    /* End Startup */
}]);
