'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngCart',
    'app.shop.controller',
    'app.artist.controller',
    'app.auth.controller',
    'app.auth.service',
    'app.common.globals',
    'app.utils'
])

.config(['$routeProvider', 'directory', 'USER_ROLES', function ($routeProvider, directory, USER_ROLES) {
    $routeProvider
        .when('/login', { 
            templateUrl: directory.auth + 'login.html', 
            activetab: 'login',
            controller: 'authController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/register', { 
            templateUrl: directory.auth + 'register.html', 
            activetab: 'register',
            controller: 'authController',
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
        .when('/apitest', { 
            templateUrl: directory.dev + 'apitest.html', 
            controller: 'apiController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/uploadtracks/:albumID', { 
            name: 'uploadtracks', 
            templateUrl: directory.artist + 'upload.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/artist', { 
            name: 'artist', 
            activetab: 'artist',
            templateUrl: directory.artist + 'artist.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/editproduct/:productID', { 
            name: 'editproduct', 
            activetab: 'artist',
            templateUrl: directory.artist + 'editproduct.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/account', { 
            name: 'account', 
            activetab: 'account',
            templateUrl: directory.artist + 'account.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/shop', { 
            templateUrl: directory.shop + 'shop.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/cart', { 
            templateUrl: directory.cart + 'cart.html', 
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

app.controller ('myCtrl', ['$scope', '$http', '$route', 'ngCart', 'USER_ROLES', 'utils', 'auth', 'session', function(
    $scope, $http, $route, ngCart, USER_ROLES, utils, auth, session) {

    $scope.$route = $route;

    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);

    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = auth.isAuthorized;
    $scope.isAuthenticated = false;

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    }

    $scope.notifications = [];
    $scope.editNotification = function(item) { 
        var index = utils.findIndexByKeyValue($scope.notifications, 'id', item.id);
        $scope.notifications.splice(index, 1);
        $scope.notifications.splice(index, 0, item);
    }
    $scope.removeNotification = function(item) { 
        var index = $scope.notifications.indexOf(item);
        $scope.notifications.splice(index, 1);     
    }
    $scope.$on('addNotification', function(event, data) {
        if (typeof data.text != 'undefined') {
            $scope.notifications.push(data); 
        } else {
            var msg = {
                id: $scope.notifications.length + 1,
                text: data
            }
            $scope.notifications.push(msg); 
        }
    });
    $scope.$on('editNotification', function(event, data) { $scope.editNotification(data); });

    // Initialize session from stored token
    if (auth.isAuthenticated()) {
        var User = auth.getTokenData();
        session.create(User);
        $scope.setCurrentUser(User);
        $scope.isAuthenticated = true;
    }
}]);
