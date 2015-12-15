/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.artist.controller', [
    'ngLodash',
    'app.utils',
    'app.api.service'
])

.controller('artistController', [
    '$scope',
    '$rootScope',
    '$route',
    '$routeParams',
    '$location',
    '$window',
    'lodash',
    'utils',
    'api',
    function ( 
        $scope,
        $rootScope,
        $route,
        $routeParams,
        $location,
        $window,
        _,
        utils,
        api
    ) {
    'use strict';

    _.extend($scope, {
        FormData: {
            AlbumName: ""
        },
        ViewData: { 
            albums: [ { AlbumName: "TestAlbum"} ],
            ListView: "grid" ,
            artistID: ""
        },
        go: go,
        toggleListView: toggleListView,
        uploader: uploader,
        addAlbum: addAlbum,
    });

    function init () {
        if ($routeParams.artistID) {
            $scope.ViewData.artistID = $routeParams.artistID;
        }
        if ($route.current.$$route.name == 'artist') {
            getAlbums();
        }
        if ($route.current.$$route.name == 'albumupload') {
            uploader.init();
        }
    };

        // fire on controller loaded

    function addAlbum() {
        var data = { 'AlbumName': $scope.FormData.AlbumName };
        var promise = api.apiRequest('addAlbum', 'POST', data);
        $scope.handleErrors(promise).then(function (data) {
            getAlbums();
            $scope.albumForm.$setPristine();
            $scope.FormData.AlbumName = "";
        }, function (error) {
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
        return false;
    };

    function go(url) {
        utils.go(url);
    }

    function getAlbums(id) {
        var promise;
        if (isNaN(id)) {
            promise = api.apiRequest('getAlbums', 'GET');
        } else {
            promise = api.apiRequest('getAlbums?id=' + id, 'GET');
        }
        $scope.handleErrors(promise).then(function (data) {
            $scope.ViewData.albums = data;
        }, function (error) {
            $scope.ViewData.albums = [];
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
    };

    function toggleListView (view) {
        console.log($scope.ViewData.ListView);
        $scope.ViewData.ListView = view;
        return false;
    }

    var uploader = new plupload.Uploader({
        runtimes : 'html5,flash,silverlight,html4',
         
        browse_button : 'pickfiles', // you can pass in id...
        container: document.getElementById('container'), // ... or DOM Element itself
         
        url : "http://web02/api/upload",
         
        filters : {
            max_file_size : '100mb',
            mime_types: [
                {title : "Image files", extensions : "jpg,gif,png"},
                {title : "Zip files", extensions : "zip"},
                {title : "Audio files", extensions : "mp3,flac"}
            ]
        },
     
        // Flash settings
        flash_swf_url : '/bower_components/plupload/js/Moxie.swf',
     
        // Silverlight settings
        silverlight_xap_url : '/bower_components/plupload/js/Moxie.xap',
         
        init: {
            PostInit: function() {
                document.getElementById('filelist').innerHTML = '';
                document.getElementById('uploadfiles').onclick = function() {
                    uploader.start();
                    return false;
                };
            },
            BeforeUpload: function(up, files) {
                up.settings.multipart_params = { artistID: document.getElementById('artistID').value}
            },
            FilesAdded: function(up, files) {
                plupload.each(files, function(file) {
                    document.getElementById('filelist').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>';
                });
            },
            UploadProgress: function(up, file) {
            },
            FileUploaded: function(up, file, response) {
                response = eval('(' + response.response + ')');
                if (response.error.code){
                    uploader.trigger('Error', {
                        code : response.error.code,
                        message : response.error.message,
                        details : response.details,
                        file : file
                    });
                    document.getElementById('console').innerHTML += "\nError #" + response.error.code + ": " + response.error.message;
                } else {
                    document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
                }
            },
            Error: function(up, err) {
                document.getElementById('console').innerHTML += "\nError #" + err.code + ": " + err.message;
            }
        }
    });

    /**
     * Handles error notifications in case of a subsonic error or an HTTP error. Sets a 'serviceError' flag when
     * it is neither.
     * @param  {Promise} promise a Promise that must be resolved or rejected with an object : {'reason': a message that can be displayed to a user, 'httpError': the HTTP error code, 'subsonicError': the error Object sent by Subsonic}
     * @return {Promise}         the original promise passed as argument. That way we can chain it further !
     */
    // TODO: Hyz: Move this to a response interceptor ?
    $scope.handleErrors = function (promise) {
        promise.then(null, function (error) {
            var errorNotif;
            if (error.subsonicError !== undefined) {
                errorNotif = error.reason + ' ' + error.subsonicError.message;
            } else if (error.httpError !== undefined) {
                errorNotif = error.reason + ' HTTP error ' + error.httpError;
            } else {
                error.serviceError = true;
            }
            if (error.subsonicError !== undefined || error.httpError !== undefined) {
                //notifications.updateMessage(errorNotif, true);
            }
        });
       return promise;
    };

    /* Launch on Startup */
    init();
    /* End Startup */
}]);
