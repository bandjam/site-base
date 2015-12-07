'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'headroom'
])

.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/login', { templateUrl: 'template/login.html', controller: 'myCtrl' })
        .when('/test', { templateUrl: 'template/test.html', controller: 'testCtrl' });
      //check browser support
      if(window.history && window.history.pushState){
        //$locationProvider.html5Mode(true); will cause an error $location in HTML5 mode requires a  tag to be present! Unless you set baseUrl tag after head tag like so: <head> <base href="/">

        // to know more about setting base URL visit: https://docs.angularjs.org/error/$location/nobase

        // if you don't wish to set base URL then use this
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
      }
    }]);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);

app.controller ('testCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
}]);

