'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'app.shop.controller',
    'app.artist.controller',
    'app.auth.service',
    'app.common.globals'
])

.config(['$routeProvider', 'directory', 'USER_ROLES', function ($routeProvider, directory, USER_ROLES) {
    $routeProvider
        .when('/login', { 
            templateUrl: directory.auth + 'login.html', 
            controller: 'myCtrl',
            data: {
              authorizedRoles: []
            }
        })
        .when('/secure', { 
            templateUrl: directory.shared + 'login.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        })
        .when('/apitest', { templateUrl: directory.dev + 'apitest.html', 
            controller: 'apiController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/upload', { templateUrl: directory.cart + 'upload.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/artist', { name: 'artist', templateUrl: directory.artist + 'artist.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/shop', { templateUrl: directory.shop + 'shop.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/cart', { templateUrl: directory.cart + 'cart.html', 
            controller: 'myCtrl',
            data: {
              authorizedRoles: []
            }
        })
}])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('authInterceptor');
    }
  ]);
})

.run(function ($rootScope, AUTH_EVENTS, auth) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var authorizedRoles = next.data.authorizedRoles;
    if (!auth.isAuthorized(authorizedRoles)) {
      event.preventDefault();
      if (auth.isAuthenticated()) {
        // user is not allowed
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      } else {
        // user is not logged in
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
  });
});

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', 'USER_ROLES', 'auth', function($scope, $http, ngCart, USER_ROLES, auth) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);

    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = auth.isAuthorized;
 
    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    }
}]);
