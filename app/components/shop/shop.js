/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.shop.controller', [
    'ngLodash',
    'app.api.service',
    'app.model',
    'vr.StripeJS.service',
    'vr.StripeJS.directive'
])

.controller('shopController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$window',
    'lodash',
    'globals',
    'utils',
    'api',
    'model',
    'ngCart',
    'StripeJS',
    function ( 
        $scope,
        $state,
        $rootScope,
        $stateParams,
        $window,
        _,
        globals,
        utils,
        api,
        model,
        ngCart,
        StripeJS
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
            },
            Payment: {
                CardNumber: "4242424242424242",
                CVC: "333",
                Month: "05",
                Year: "17"
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
                address: { open: true, disabled: false, status: '', data: null },
                payment: { open: true, disabled: false, status: '', data: null },
                current: 'order'
            },
            countries: utils.countries
        },
        go: go,
        getProducts: getProducts,
        checkoutNext: checkoutNext,
        submitPaymentForm: submitPaymentForm
    });

    function init () {
        if ($stateParams.productID) {
            $scope.ViewData.productID = $stateParams.productID;
        }
        if ($state.current.name == 'shop') {
            getProducts();
        }
        if ($state.current.name == 'product') {
            getProducts($stateParams.productID);
            getTracks($stateParams.productID);
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
        }
        // Close current group
        $scope.ViewData.accordion[current].open = false;
        $scope.ViewData.accordion[current].status = 'panel-success';
        // Open next group
        $scope.ViewData.accordion[group].open = true;
        $scope.ViewData.accordion[group].disabled = false;
        $scope.ViewData.accordion.current = group;
    };

    function stripeResponseHandler(status, response) {
        if (response.error) {
            // Show the errors on the form
            console.log(response.error.message);
            //$form.find('button').prop('disabled', false);
        } else {
            // response contains id and card, which contains additional card details
            var token = response;
            $scope.ViewData.accordion.payment.data = token;
            console.log($scope.ViewData.accordion.payment.data);

            // Submit Form
        }
    };

    function submitPaymentForm() {
        var form = {
            number: $scope.FormData.Payment.CardNumber,
            cvc: $scope.FormData.Payment.CVC,
            exp_month: $scope.FormData.Payment.Month,
            exp_year: $scope.FormData.Payment.Year
        };
        StripeJS.createToken(form, stripeResponseHandler);
        // Prevent the form from submitting with the default action
        return false;
    }

    /* Launch on Startup */
    init();
    /* End Startup */
}]);
