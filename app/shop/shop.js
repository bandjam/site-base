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
        $scope.handleErrors(promise).then(function (data) {
            $scope.products = data;
        }, function (error) {
            $scope.products = [];
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
    };

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
    $scope.getProducts();
    /* End Startup */
}]);
