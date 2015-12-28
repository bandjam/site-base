/**
* app.auth.service Module
*
* Provides access through $http to the Subsonic server's auth.
* Also offers more fine-grained functionality that is not part of Subsonic's auth.
*/
angular.module('app.auth.service', [
    'ngLodash',
    'app.common.globals',
    'app.api.service'
])

.service('auth', authService)
.service('session', Session)
.factory('authInterceptor', authInterceptor);

/* authService */
function authService($q, $window, $injector, globals, session) {
    var self = this;

    self.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    }

    self.saveToken = function(token) {
      $window.localStorage['jwtToken'] = JSON.stringify(token);
    }

    self.getToken = function() {
        var jwt = $window.localStorage['jwtToken'];
        jwt = JSON.parse(jwt);
        return jwt.token;
    }

    self.getTokenData = function() {
        var jwt = $window.localStorage['jwtToken'];
        jwt = JSON.parse(jwt);
        return jwt.data;
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

    self.login = function(UserName, UserPassword) {
        // Manually inject api to resolve circular dependency
        var api = $injector.get('api');
        var credentials = { UserName: UserName, UserPassword: UserPassword }
        var promise;
        promise = api.apiRequest('/login', 'POST', credentials);
        return promise;
    };

    self.register = function(Register) {
        // Manually inject api to resolve circular dependency
        var api = $injector.get('api');
        var promise;
        promise = api.apiRequest('/register', 'POST', Register);
        return promise;
    }
}

/* Session */
function Session($q) {
    return {
        create: function(User) {
            this.userID = User.userID;
            this.userName = User.userName;
            this.userRole = User.userRole;
        },        
        destroy: function() {
            this.userID = null;
            this.userName = null;
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
            auth.saveToken(res.data);
          }

          return res;
        },

        request: function(config){
          var token = auth.getToken();
          if(config.url.indexOf(API) === 0 && token) {
            config.headers.authorization = 'Bearer ' + token;
          }

          return config;
        }
    }
}

