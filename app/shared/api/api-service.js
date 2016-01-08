/**
* jamstash.subsonic.service Module
*
* Provides access through $http to the Subsonic server's API.
* Also offers more fine-grained functionality that is not part of Subsonic's API.
*/
angular.module('app.api.service', [
    'ngLodash',
    'app.common.globals',
    'app.notifications'
])

.service('api', apiService);

apiService.$inject = [
    '$http',
    '$q',
    'lodash',
    'globals',
    'notification'
];

function apiService(
    $http,
    $q,
    _,
    globals,
    notification
) {
    'use strict';

    var self = this;
    _.extend(self, {
        apiRequest: apiRequest,
        handleErrors: handleErrors
    });

    // TODO: Hyz: Remove when refactored
    var content = {
        album: [],
        song: [],
        playlists: [],
        breadcrumb: [],
        playlistsPublic: [],
        playlistsGenre: globals.SavedGenres,
        selectedAutoAlbum: null,
        selectedArtist: null,
        selectedAlbum: null,
        selectedPlaylist: null,
        selectedAutoPlaylist: null,
        selectedGenre: null,
        selectedPodcast: null
    };

    /**
     * Handles building the URL with the correct parameters and error-handling while communicating with
     * a Subsonic server
     * @param  {String} partialUrl the last part of the Subsonic URL you want, e.g. 'getStarred.view'. If it does not start with a '/', it will be prefixed
     * @param  {Object} config     optional $http config object. The base settings expected by Subsonic (username, password, etc.) will be overwritten.
     * @return {Promise}           a Promise that will be resolved if we receive the 'ok' status from Subsonic. Will be rejected otherwise with an object : {'reason': a message that can be displayed to a user, 'httpError': the HTTP error code, 'subsonicError': the error Object sent by Subsonic}
     */
    function apiRequest(partialUrl, method, postdata, config) {
        var exception = { reason: 'Error when contacting the Subsonic server.' };
        var deferred = $q.defer();
        var actualUrl = (partialUrl.charAt(0) === '/') ? partialUrl : '/' + partialUrl;
        var url = globals.BaseURL() + actualUrl;
        // Extend the provided config (if it exists) with our params
        // Otherwise we create a config object
        var actualConfig = config || {};
        actualConfig.params = actualConfig.params || {};
        _.extend(actualConfig.params,  {
            u: globals.settings.Username,
            p: globals.settings.Password,
            f: globals.settings.Protocol,
            v: globals.settings.ApiVersion,
            c: globals.settings.ApplicationName
        });
        actualConfig.timeout = globals.settings.Timeout;

        var httpPromise;
        /* JSONP
        if (globals.settings.Protocol === 'jsonp') {
            actualConfig.params.callback = 'JSON_CALLBACK';
            httpPromise = $http.jsonp(url, actualConfig);
        } else {
        }
        */
        //httpPromise = $http.get(url, actualConfig);
        httpPromise = $http({
            method: method,
            url: url,
            data: JSON.stringify(postdata),
            config: actualConfig
        });
        httpPromise.success(function (data) {
            deferred.resolve(data);
        }).error(function (error) {
            //exception.httpError = status;
            deferred.reject(error);
        });
        return deferred.promise;
    }


    /**
     * Handles error notifications in case of a subsonic error or an HTTP error. Sets a 'serviceError' flag when
     * it is neither.
     * @param  {Promise} promise a Promise that must be resolved or rejected with an object : {'reason': a message that can be displayed to a user, 'httpError': the HTTP error code, 'subsonicError': the error Object sent by Subsonic}
     * @return {Promise}         the original promise passed as argument. That way we can chain it further !
     */
    // TODO: Hyz: Move this to a response interceptor ?
    function handleErrors(promise) {
        promise.then(null, function (response) {
            notification.addMessage(response.data);
        });
       return promise;
    };

}
