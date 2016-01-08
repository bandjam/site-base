'use strict';

var app = angular.module('app', [
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
            templateUrl: directory.user + 'account.html', 
            controller: 'userController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/account/info', { 
            name: 'account-info', 
            activetab: 'account',
            templateUrl: directory.user + 'info.html', 
            controller: 'userController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/shop', { 
            name: 'shop', 
            activetab: 'shop',
            templateUrl: directory.shop + 'shop.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/product/:productID', { 
            name: 'product', 
            activetab: 'shop',
            templateUrl: directory.shop + 'product.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/cart', { 
            templateUrl: directory.shop + 'cart.html', 
            controller: 'shopController',
            data: {
              authorizedRoles: []
            }
        })
        .when('/checkout', { 
            templateUrl: directory.shop + 'checkout.html', 
            controller: 'shopController',
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

/* Needs fixed for angularjs 1.4
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
*/

app.controller ('myCtrl', [
    '$rootScope', 
    '$scope', 
    '$http', 
    '$route', 
    'ngCart', 
    'USER_ROLES', 
    'utils', 
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
    ngCart, 
    USER_ROLES, 
    utils, 
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
    $scope.isAuthenticated = false;

    $rootScope.ViewData =  {
        activePlayer: 0,
        pauseSong: false,
        queue: playerService.queue,
        directory: directory
    }

    function go(url) {
        utils.go(url);
    };

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    }
    if (auth.isAuthenticated()) { 
        // Initialize session from stored token
        var User = auth.getTokenData();
        session.create(User);
        $scope.setCurrentUser(User);
        $scope.isAuthenticated = true;
    }

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
