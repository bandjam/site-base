/**
* jamstash.subsonic.controller Module
*
* Access and use the Subsonic Server. The Controller is in charge of relaying the Service's messages to the user through the
* notifications.
*/
angular.module('app.shop.controller', [
    'ngLodash',
    'app.api.service'
])

.controller('shopController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$window',
    'lodash',
    'api',
    function ( 
        $scope,
        $rootScope,
        $routeParams,
        $window,
        _,
        api
    ) {
    'use strict';

    _.extend($scope, {
        getProducts             : getProducts
    });

    function getProducts(id) {
        var promise = api.getProducts(id);
        $scope.handleErrors(promise).then(function (data) {
            $scope.products = data;
        }, function (error) {
            $scope.products = [];
            if (error.serviceError === true) {
                //notifications.updateMessage(error.reason, true);
            }
        });
    };

    var uploader = new plupload.Uploader({
        runtimes : 'html5,flash,silverlight,html4',
         
        browse_button : 'pickfiles', // you can pass in id...
        container: document.getElementById('container'), // ... or DOM Element itself
         
        url : "/examples/upload",
         
        filters : {
            max_file_size : '10mb',
            mime_types: [
                {title : "Image files", extensions : "jpg,gif,png"},
                {title : "Zip files", extensions : "zip"}
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
            FilesAdded: function(up, files) {
                plupload.each(files, function(file) {
                    document.getElementById('filelist').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>';
                });
            },
            UploadProgress: function(up, file) {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
            },
            Error: function(up, err) {
                document.getElementById('console').innerHTML += "\nError #" + err.code + ": " + err.message;
            }
        }
    });
     
    uploader.init();

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
    $scope.getProducts();
    /* End Startup */
}]);
