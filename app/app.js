'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'headroom',
    'app.shop.controller',
    'app.artist.controller'
])

.config(['$routeProvider',function ($routeProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'common/login.html', controller: 'myCtrl' })
        .when('/apitest', { templateUrl: 'common/apitest.html', controller: 'apiController' })
        .when('/shop', { templateUrl: 'shop/shop.html', controller: 'shopController' })
        .when('/upload', { templateUrl: 'shop/upload.html', controller: 'shopController' })
        .when('/artist', { name: 'artist', templateUrl: 'artist/artist.html', controller: 'artistController' })
        .when('/albumupload/:artistID', { name: 'albumupload', templateUrl: 'artist/upload.html', controller: 'artistController' })
        .when('/cart', { templateUrl: 'cart/cart.html', controller: 'myCtrl' })
}]);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);

