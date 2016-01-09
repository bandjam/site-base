'use strict';

var app = angular.module('app', [
    'ui.router',
    'ngRoute',
    'ngCart', 
    'app.shop.controller',
    'app.artist.controller',
    'app.auth.controller',
    'app.user.controller',
    'app.auth.service',
    'app.player.directive',
    'app.player.service',
    'app.common.globals',
    'app.utils',
    'ui.bootstrap'
])

.config(['$routeProvider', 'directory', 'USER_ROLES', function ($routeProvider, directory, USER_ROLES) {
    $routeProvider
        .when('/index', { 
            redirectTo: '/shop',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/login', { 
            templateUrl: directory.auth + 'login.html', 
            activetab: 'login',
            controller: 'authController',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/register', { 
            templateUrl: directory.auth + 'register.html', 
            activetab: 'register',
            controller: 'authController',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/secure', { 
            templateUrl: directory.shared + 'login.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        })
        .when('/uploadtracks/:albumID', { 
            name: 'uploadtracks', 
            templateUrl: directory.artist + 'upload.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        })
        .when('/artist', { 
            name: 'artist', 
            activetab: 'artist',
            templateUrl: directory.artist + 'artist.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        })
        .when('/editproduct/:productID', { 
            name: 'editproduct', 
            activetab: 'artist',
            templateUrl: directory.artist + 'editproduct.html', 
            controller: 'artistController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        })
        .when('/account', { 
            name: 'account', 
            activetab: 'account',
            templateUrl: directory.user + 'account.html', 
            controller: 'userController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.guest]
            }
        })
        .when('/account/info', { 
            name: 'account-info', 
            activetab: 'account',
            templateUrl: directory.user + 'info.html', 
            controller: 'userController',
            data: {
              authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.guest]
            }
        })
        .when('/shop', { 
            name: 'shop', 
            activetab: 'shop',
            templateUrl: directory.shop + 'shop.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/product/:productID', { 
            name: 'product', 
            activetab: 'shop',
            templateUrl: directory.shop + 'product.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/cart', { 
            templateUrl: directory.shop + 'cart.html', 
            activetab: 'shop',
            controller: 'shopController',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/checkout', { 
            templateUrl: directory.shop + 'checkout.html', 
            activetab: 'shop',
            controller: 'shopController',
            data: {
              authorizedRoles: [USER_ROLES.guest]
            }
        })
        .otherwise({ 
            redirectTo: '/index',
            data: {
              authorizedRoles: [USER_ROLES.all]
            }
        });
}])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('authInterceptor');
    }
  ]);
})

.run(function ($rootScope, $location, AUTH_EVENTS, USER_ROLES, auth) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var postLogInRoute;
    var authorizedRoles = next.data.authorizedRoles;
    // Allow "all" routes to continue 
    if (authorizedRoles.indexOf(USER_ROLES.all) == -1) {
        // Redirect to /login on failure
        if (!auth.isAuthorized(authorizedRoles)) {
          event.preventDefault();
          if (auth.isAuthenticated()) {
            // user is not allowed
            $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
          } else {
            // user is not logged in
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
          }
          postLogInRoute = $location.path();
          console.log('AUTH: Redirect to /login');
          $location.path('/login').replace();
        } else {
            // Redirect to previous route if set
            if (postLogInRoute) {
                console.log('AUTH: Redirect to ' + postLogInRoute);
                $location.path(postLogInRoute).replace();
                postLogInRoute = null;
            }
        }
    }
  });
})

/* Implement for authenticated redirects to site
$stateProvider.state('protected-route', {
  url: '/protected',
  resolve: {
    auth: function resolveAuthentication(AuthResolver) { 
      return AuthResolver.resolve();
    }
  }
});
.factory('AuthResolver', function ($q, $rootScope, $state) {
  return {
    resolve: function () {
      var deferred = $q.defer();
      var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
        if (angular.isDefined(currentUser)) {
          if (currentUser) {
            deferred.resolve(currentUser);
          } else {
            deferred.reject();
            $state.go('user-login');
          }
          unwatch();
        }
      });
      return deferred.promise;
    }
  };
})
*/

app.controller ('myCtrl', [
    '$rootScope', 
    '$scope', 
    '$http', 
    '$route', 
    '$location',
    'ngCart', 
    'USER_ROLES', 
    'utils', 
    'globals',
    'directory',
    'notification',
    'auth', 
    'session', 
    'player', 
    function(
    $rootScope, 
    $scope, 
    $http, 
    $route, 
    $location,
    ngCart, 
    USER_ROLES, 
    utils, 
    globals,
    directory,
    notification,
    auth, 
    session, 
    playerService
    ) {

    $scope.$route = $route;

    ngCart.setTaxRate(0);
    ngCart.setShipping(0);

    // Authentication
    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = auth.isAuthorized;
    $rootScope.isAuthenticated = false;
    $rootScope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    }
    $scope.logout = function() {
        auth.logout();
        session.destroy();
        $rootScope.setCurrentUser(null);
        $rootScope.isAuthenticated = false;
        $location.path('/index');
    }
    // Initialize session from stored token
    if (auth.getToken()) { 
        var User = auth.getTokenData();
        if (globals.settings.Debug) {
            console.log('Restore Session: ' + JSON.stringify(User));
        }
        session.create(User);
        $rootScope.setCurrentUser(User);
        $rootScope.isAuthenticated = true;
    }

    $rootScope.ViewData =  {
        activePlayer: 0,
        pauseSong: false,
        queue: playerService.queue,
        directory: directory
    }

    function go(url) {
        utils.go(url);
    };

    // Messages
    $rootScope.Messages = [];
    $scope.editMessage = function(item) { 
        notification.editMessage(item);
    }
    $scope.removeMessage = function(item) { 
        notification.removeMessage(item);
    }
    $scope.$on('addMessage', function(event, data) {
        notification.addMessage(item);
    });
    $scope.$on('editMessage', function(event, data) { notification.editMessage(data); });

    /*
    $scope.$watch(function () {
        return player.getActivePlayer();
    }, function (newVal) {
        if(newVal !== undefined) {
            console.log('Player:activePlayer ' + newVal)
            $scope.activePlayer = newVal;
        }
    });
    */

    $scope.playSong = function(song) { return playerService.playSong(song); };
    $scope.togglePause = function() { return playerService.togglePause(); };
    $scope.nextTrack = function() { return playerService.nextTrack(); };
    $scope.previousTrack = function() { return playerService.previousTrack(); };
    /*
    $scope.$watch('playerService.activePlayer', function (newVal) {
        if(newVal !== undefined) {
            console.log('Player:activePlayer ' + newVal)
            $scope.activePlayer = newVal;
            $scope.apply();
        }
    });
    */

    var songs = [
        { src: "http://web02/api/streamTrack/76", type: "audio/mp3" },
        { src: "http://web02/api/streamTrack/77", type: "audio/mp3" },
        { src: "http://web02/api/streamTrack/78", type: "audio/mp3" },
        { src: "http://web02/api/streamTrack/79", type: "audio/mp3" },
        { src: "http://web02/api/streamTrack/80", type: "audio/mp3" }
    ];
    //playerService.play(songs[0]);
    console.log(playerService.queue.length);
    /*
    var player0 = document.querySelectorAll(".player")[0].plyr;
    var player1 = document.querySelectorAll(".player")[1].plyr;
    player0.source([
            { src: "http://web02/api/streamTrack/77", type: "audio/mp3" }
            ]);
    player1.source([
            { src: "http://web02/api/streamTrack/76", type: "audio/mp3" }
            ]);
    var media0 = player0.media;
    var media1 = player1.media;
    media0.addEventListener("playing", function() { 
      console.log("playing");
    });
    media1.addEventListener("playing", function() { 
      console.log("playing");
    });
    */

}]);
