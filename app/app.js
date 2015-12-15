'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'app.shop.controller',
    'app.artist.controller',
    'app.common.globals'
])

.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})

.config(['$routeProvider', 'directory', function ($routeProvider, directory) {
    $routeProvider
        .when('/login', { templateUrl: directory.shared + 'login.html', controller: 'myCtrl' })
        .when('/apitest', { templateUrl: directory.dev + 'apitest.html', controller: 'apiController' })
        .when('/upload', { templateUrl: directory.cart + 'upload.html', controller: 'shopController' })
        .when('/artist', { name: 'artist', templateUrl: 'artist/artist.html', controller: 'artistController' })
        .when('/shop', { templateUrl: directory.shop + 'shop.html', controller: 'shopController' })
        .when('/cart', { templateUrl: directory.cart + 'cart.html', controller: 'myCtrl' })
}]);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);
    var vm = this;
    vm.title = "HelloWorld!"
}]);
