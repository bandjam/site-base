/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.api.controller', [
    'ngLodash',
    'app.api.service'
])

.controller('apiController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$window',
    'lodash',
    'api',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $window,
        _,
        api
    ) {
    'use strict';

    _.extend($scope, {
        test                 : test
    });

    function test(folder) {
        var savedFolder = $scope.SelectedMusicFolder;
        if (isNaN(folder) && savedFolder) {
            folder = savedFolder.id;
        }
        var promise = api.test(folder);
        $scope.handleErrors(promise).then(function (data) {
            $scope.shortcut = data;
        }, function (error) {
            $scope.index = [];
            $scope.shortcut = [];
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
    };

    /* Launch on Startup */
    //$scope.test();
    $scope.shortcut = 'Hello Foo'
    /* End Startup */
}]);
