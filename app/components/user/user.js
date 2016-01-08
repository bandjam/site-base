/**
* app.user.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.user.controller', [
    'ngLodash',
    'app.common.globals',
    'app.utils',
    'app.api.service',
    'app.model'
])

.controller('userController', [
    '$rootScope',
    '$scope',
    '$route',
    '$routeParams',
    '$location',
    '$window',
    '$timeout',
    'lodash',
    'globals',
    'utils',
    'api',
    'model',
    function ( 
        $rootScope,
        $scope,
        $route,
        $routeParams,
        $location,
        $window,
        $timeout,
        _,
        globals,
        utils,
        api,
        model
    ) {
    'use strict';

    _.extend($scope, {
        FormData: {
        },
        ViewData: { 
            directory: $rootScope.ViewData.directory,
            countries: utils.countries
        },
        go: go
    });

    function init () {

    };

    function go(url) {
        utils.go(url);
    };


    /* Launch on Startup */
    init();
    /* End Startup */
}]);
