'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'app.shop.controller',
    'app.common.globals'
])

.config(['$routeProvider', 'directory', function ($routeProvider, directory) {
    $routeProvider
        .when('/login', { templateUrl: directory.ViewPartialsDirectory + 'login.html', controller: 'myCtrl' })
        .when('/apitest', { templateUrl: directory.DevPartialsDirectory + 'apitest.html', controller: 'apiController' })
        .when('/shop', { templateUrl: directory.ViewPartialsDirectory + 'shop.html', controller: 'shopController' })
        .when('/cart', { templateUrl: directory.ViewPartialsDirectory + 'cart.html', controller: 'myCtrl' })
}]);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);
