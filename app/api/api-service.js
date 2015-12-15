/**
* jamstash.subsonic.service Module
*
* Provides access through $http to the Subsonic server's API.
* Also offers more fine-grained functionality that is not part of Subsonic's API.
*/
angular.module('app.api.service', [
    'ngLodash',
    'app.common.service'
])

.service('api', apiService);

apiService.$inject = [
    '$http',
    '$q',
    'lodash',
    'globals'
];

function apiService(
    $http,
    $q,
    _,
    globals
) {
    'use strict';

    var self = this;
    _.extend(self, {
        getArtists           : getArtists,
        test                 : test,
        ping                 : ping,
        apiRequest      : apiRequest
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
        console.log(postdata);
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
            actualConfig
        });
        httpPromise.success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status) {
            exception.httpError = status;
            deferred.reject(exception);
        });
        return deferred.promise;
    }

    function test() {
        return self.apiRequest('test');
    }

    function ping() {
        return self.apiRequest('ping.view');
    }

    function getMusicFolders() {
        var exception = { reason: 'No music folder found on the Subsonic server.' };
        var promise = self.apiRequest('getMusicFolders.view', {
            cache: true
        }).then(function (subsonicResponse) {
            if (subsonicResponse.musicFolders !== undefined && subsonicResponse.musicFolders.musicFolder !== undefined) {
                return [].concat(subsonicResponse.musicFolders.musicFolder);
            } else {
                return $q.reject(exception);
            }
        });
        return promise;
    }

    function getArtists(folder) {
        var exception = { reason: 'No artist found on the Subsonic server.' };
        var params;
        if (! isNaN(folder)) {
            params = {
                musicFolderId: folder
            };
        }
        var promise = self.apiRequest('getIndexes.view', {
            cache: true,
            params: params
        }).then(function (subsonicResponse) {
            if (subsonicResponse.indexes !== undefined && (subsonicResponse.indexes.index !== undefined || subsonicResponse.indexes.shortcut !== undefined)) {
                // Make sure shortcut, index and each index's artist are arrays
                // because Madsonic will return an object when there's only one element
                var formattedResponse = {};
                formattedResponse.shortcut = [].concat(subsonicResponse.indexes.shortcut);
                formattedResponse.index = [].concat(subsonicResponse.indexes.index);
                _.map(formattedResponse.index, function (index) {
                    var formattedIndex = index;
                    formattedIndex.artist = [].concat(index.artist);
                    return formattedIndex;
                });
                return formattedResponse;
            } else {
                return $q.reject(exception);
            }
        });
        return promise;
    }

}
