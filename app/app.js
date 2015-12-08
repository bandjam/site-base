'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'headroom',
    'app.shop.controller'
])

.config(['$routeProvider',function ($routeProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'template/login.html', controller: 'myCtrl' })
        .when('/apitest', { templateUrl: 'template/apitest.html', controller: 'apiController' })
        .when('/shop', { templateUrl: 'shop/shop.html', controller: 'shopController' })
}]);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);

