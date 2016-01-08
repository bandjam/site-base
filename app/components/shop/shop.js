/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.shop.controller', [
    'ngLodash',
    'app.api.service',
    'app.model'
])

.controller('shopController', [
    '$scope',
    '$route',
    '$rootScope',
    '$routeParams',
    '$window',
    'lodash',
    'globals',
    'utils',
    'api',
    'model',
    'ngCart', 
    function ( 
        $scope,
        $route,
        $rootScope,
        $routeParams,
        $window,
        _,
        globals,
        utils,
        api,
        model,
        ngCart
    ) {
    'use strict';

    _.extend($scope, {
        FormData: {
            Address: {
                Line1: "129 Kavas Circle",
                Line2: "",
                City: "State College",
                State: "PA",
                Zipcode: "16823",
                Country: utils.countries[0]
            }
        },
        ViewData: { 
            directory: $rootScope.ViewData.directory,
            product: null,
            products: [],
            tracks: [],
            ListView: "grid" ,
            accordion: {
                order: { open: true, disabled: false, status: '', data: null },
                address: { open: false, disabled: true, status: '', data: null },
                payment: { open: false, disabled: true, status: '', data: null },
                current: 'order'
            },
            countries: utils.countries
        },
        go: go,
        getProducts: getProducts,
        checkoutNext: checkoutNext
    });

    function init () {
        if ($routeParams.productID) {
            $scope.ViewData.productID = $routeParams.productID;
        }
        if ($route.current.$$route.name == 'shop') {
            getProducts();
        }
        if ($route.current.$$route.name == 'product') {
            getProducts($routeParams.productID);
            getTracks($routeParams.productID);
        }
    };

    function go(url) {
        utils.go(url);
    };

    function getProducts(id) {
        var promise;
        if (isNaN(id)) {
            promise = api.apiRequest('getProducts', 'GET');
        } else {
            promise = api.apiRequest('getProducts/' + id, 'GET');
        }
        api.handleErrors(promise).then(function (response) {
            if (response.data.length > 1) {
                $scope.ViewData.products = response.data;
            } else {
                $scope.ViewData.product = response.data[0];
            }
        }, function (error) {
            $scope.ViewData.products = [];
            $scope.ViewData.product = null;
        });
    };

    function getTracks(id) {
        var promise = api.apiRequest('getTracks/' + id, 'GET')
        if (!isNaN(id)) {
            api.handleErrors(promise).then(function (response) {
                $scope.ViewData.tracks = model.mapResult(response.data, model.Song);
            }, function (response) {
            });
        }
    };

    function checkoutNext(group) {
        var current = $scope.ViewData.accordion.current;
        switch(current) {
            case 'order':
                $scope.ViewData.accordion[current].data = ngCart.toObject();
                console.log(JSON.stringify($scope.ViewData.accordion[current].data));
                break;
            case 'address':
                $scope.ViewData.accordion[current].data = $scope.FormData.Address;
                console.log(JSON.stringify($scope.ViewData.accordion[current].data));
                break;
            case 'payment':
                //$scope.ViewData.accordion[current].data = ngCart.toObject();
                //console.log(JSON.stringify($scope.ViewData.accordion[current].data));
                break;
        }
        // Close current group
        $scope.ViewData.accordion[current].open = false;
        $scope.ViewData.accordion[current].status = 'panel-success';
        // Open next group
        $scope.ViewData.accordion[group].open = true;
        $scope.ViewData.accordion[group].disabled = false;
        $scope.ViewData.accordion.current = group;
    };

    /* Launch on Startup */
    init();
    /* End Startup */
}]);
