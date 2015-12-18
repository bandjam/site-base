/**
* app.auth.service Module
*
* Provides access through $http to the Subsonic server's auth.
* Also offers more fine-grained functionality that is not part of Subsonic's auth.
*/
angular.module('app.auth.service', [
    'ngLodash',
    'app.common.globals'
])

.service('auth', authService)
.service('session', Session)
.factory('authInterceptor', authInterceptor);

/* authService */
function authService($q, $window, globals, session) {
    var self = this;

    self.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    }

    self.saveToken = function(token) {
      $window.localStorage['jwtToken'] = token;
    }

    self.getToken = function() {
      return $window.localStorage['jwtToken'];
    }

    self.isAuthenticated = function() {
        //return !!Session.userId;
        var token = self.getToken();
        if (token) {
            var params = self.parseJwt(token);
            return Math.round(new Date().getTime() / 1000) <= params.exp;
        } else {
            return false;
        }
    }

    self.isAuthorized = function(authorizedRoles) {
        var isAuthenticated = self.isAuthenticated();
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        return (isAuthenticated && authorizedRoles.indexOf(Session.userRole) !== -1);
    }

    self.logout = function() {
      $window.localStorage.removeItem('jwtToken');
    }
}

/* Session */
function Session($q) {
    return {
        create: function(sessionId, userId, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        },        
        destroy: function() {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        }
    }
}

/* authInterceptor */
function authInterceptor($rootScope, $q, AUTH_EVENTS, API, auth) {
    return {
        responseError: function(response) { 
          $rootScope.$broadcast({
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
          }[response.status], response);
          return $q.reject(response);
        },

        response: function(res){
          if(res.config.url.indexOf(API) === 0 && res.data.token) {
            auth.saveToken(res.data.token);
          }

          return res;
        },

        request: function(config){
          var token = auth.getToken();
          if(config.url.indexOf(API) === 0 && token) {
            config.headers.Authorization = 'Bearer ' + token;
          }

          return config;
        }
    }
}

