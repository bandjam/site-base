/**
* app.auth.service Module
*
* Provides access through $http to the Subsonic server's auth.
* Also offers more fine-grained functionality that is not part of Subsonic's auth.
*/
angular.module('app.auth.service', [
    'ngLodash',
    'app.common.service'
])

.service('auth', authService);

authService.$inject = [
    '$http',
    '$q',
    'lodash',
    'globals'
];

function authService(
    $http,
    $q,
    _,
    globals
) {
    'use strict';

    var self = this;
    _.extend(self, {
    });



}
