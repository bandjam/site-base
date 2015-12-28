/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.shop.controller', [
    'ngLodash',
    'app.api.service'
])

.controller('shopController', [
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
        getProducts             : getProducts
    });

    function getProducts(id) {
        var promise;
        if (isNaN(id)) {
            promise = api.apiRequest('product', 'GET');
        } else {
            promise = api.apiRequest('product?id=' + id, 'GET');
        }
        api.handleErrors(promise).then(function (data) {
            $scope.products = data;
        }, function (error) {
            $scope.products = [];
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
    };

    /* Launch on Startup */
    $scope.getProducts();
    /* End Startup */
}]);
