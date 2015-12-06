'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'headroom'
])

.config(['$routeProvider',function ($routeProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'template/login.html', controller: 'myCtrl' })
}]);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);

