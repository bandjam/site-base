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
    '$state',
    '$stateParams',
    '$location',
    '$window',
    'lodash',
    'globals',
    'utils',
    'api',
    'auth',
    'session',
    'AUTH_EVENTS',
    function ( 
        $scope,
        $rootScope,
        $state,
        $stateParams,
        $location,
        $window,
        _,
        globals,
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
            var User = { 
                userID: res.data.userID,
                userName: res.data.userName,
                userRole: res.data.userRole
            };
            if (globals.settings.Debug) {
                console.log('LOGIN: ' + JSON.stringify(User));
            }
            session.create(User);
            $rootScope.setCurrentUser(User);
            $rootScope.isAuthenticated = true;
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $location.path('/account').replace();
        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    }
    function register() {
        auth.register($scope.FormData.Register).then(function (res) {
            session.create(res.data.userID, res.data.userName, res.data.userRole);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $rootScope.setCurrentUser(res.data.user);
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
