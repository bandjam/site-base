/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.artist.controller', [
    'ngLodash',
    'app.common.globals',
    'app.utils',
    'app.utils.directive',
    'app.plupload.directive',
    'app.api.service',
    'app.model'
])

.controller('artistController', [
    '$scope',
    '$route',
    '$routeParams',
    '$location',
    '$window',
    '$timeout',
    'lodash',
    'globals',
    'utils',
    'api',
    'model',
    function ( 
        $scope,
        $route,
        $routeParams,
        $location,
        $window,
        $timeout,
        _,
        globals,
        utils,
        api,
        model
    ) {
    'use strict';

    _.extend($scope, {
        FormData: {
            AlbumName: "",
            ProductType: "album",
            Product: {
                ProductName: "",
                ProductDesc: "",
                ProductPrice: ""
            }
        },
        ViewData: { 
            product: null,
            products: [],
            tracks: [],
            ListView: "grid" ,
            albumID: "",
            trackUpload: null,
            coverUpload: null
        },
        go: go,
        toggleListView: toggleListView,
        addAlbum: addAlbum,
        editProduct: editProduct,
        editTrack: editTrack,
        deleteTrack: deleteTrack,
    });

    function init () {
        if ($routeParams.productID) {
            $scope.ViewData.productID = $routeParams.productID;
        }
        if ($route.current.$$route.name == 'artist') {
            getProducts();
        }
        if ($route.current.$$route.name == 'editproduct') {
            getProduct($routeParams.productID);
            getTracks($routeParams.productID);
        }
        if ($route.current.$$route.name == 'uploadtracks') {
            //uploader.init();
        }
    };

    function addAlbum() {
        var data = { 
            'UserID': $scope.currentUser,
            'AlbumName': $scope.FormData.AlbumName,
            'ProductType': 'album'
        };
        var promise = api.apiRequest('addProduct', 'POST', data);
        api.handleErrors(promise).then(function (data) {
            getProducts();
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
    };

    function getProduct(ProductID) {
        var promise;
        if (!isNaN(ProductID)) {
            promise = api.apiRequest('getUserProducts/' + ProductID, 'GET');
        }
        api.handleErrors(promise).then(function (response) {
            $scope.ViewData.product = response.data[0];
        }, function (response) {
            $scope.ViewData.product = null;
        });
    };

    function getProducts() {
        var promise = api.apiRequest('getUserProducts', 'GET');
        api.handleErrors(promise).then(function (response) {
            $scope.ViewData.products = response.data;
        }, function (response) {
        });
    };

    function editProduct(ProductID) {
        var data = $scope.ViewData.product;
        var promise = api.apiRequest('editProduct/' + ProductID, 'POST', data);
        api.handleErrors(promise).then(function (data) {
            getProduct(ProductID);
        }, function (response) {
        });
        return false;
    };

    function toggleListView (view) {
        console.log($scope.ViewData.ListView);
        $scope.ViewData.ListView = view;
        return false;
    };

    function getTracks(id) {
        var promise = api.apiRequest('getTracks/' + id, 'GET')
        if (!isNaN(id)) {
            api.handleErrors(promise).then(function (response) {
                $scope.ViewData.tracks = model.mapResult(response.data, model.Song);
            }, function (response) {
            });
        }
    };

    function editTrack(AlbumTrackID, TrackName) {
        var data = { 'TrackName': TrackName };
        var promise = api.apiRequest('editTrack/' + AlbumTrackID, 'POST', data);
        api.handleErrors(promise).then(function (data) {
            getTracks($scope.ViewData.productID);
        }, function (response) {
        });
        return false;
    };

    function deleteTrack(AlbumTrackID) {
        var promise = api.apiRequest('deleteTrack/' + AlbumTrackID, 'GET');
        api.handleErrors(promise).then(function (data) {
            getTracks($scope.ViewData.productID);
        }, function (response) {
        });
        return false;
    };

    $scope.ViewData.trackUpload = {
      url: globals.BaseURL() + '/upload',
      options: {
        filters: {
          mime_types : [
            { title : "Audio files", extensions : "mp3,flac"}
          ],
          max_file_size: '128mb'
        }
      }
    };

    $scope.ViewData.coverUpload = {
      url: globals.BaseURL() + '/upload',
      options: {
        filters: {
          mime_types : [
            { title : "Image files", extensions : "jpg,jpeg,gif,png"}
          ],
          max_file_size: '10mb'
        }
      }
    }

    /*
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
        flash_swf_url : '/shared/plupload/Moxie.swf',
     
        // Silverlight settings
        silverlight_xap_url : '/shared/plupload/Moxie.xap',
         
        init: {
            PostInit: function() {
                document.getElementById('filelist').innerHTML = '';
                document.getElementById('uploadfiles').onclick = function() {
                    uploader.start();
                    return false;
                };
            },
            BeforeUpload: function(up, files) {
                up.settings.multipart_params = { albumID: document.getElementById('albumID').value}
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
    */

    /* Launch on Startup */
    init();
    /* End Startup */
}]);
