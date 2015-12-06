'use strict';

var myApp = angular.module('myApp', [
    'ngRoute',
    'ngCart',
    'headroom'
])

.config(['$routeProvider',function ($routeProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'template/login.html', controller: 'myCtrl' })
}]);

myApp.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);

