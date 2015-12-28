
angular.module('app.plupload.directive', [
    'app.common.globals',
    'app.auth.service'
])

.service('uploaders', function () {
    return {
        instance: new Array()
    }
})

.provider('pluploadOption', function () {
  /* jshint camelcase: false */
  var opts = {
    flash_swf_url: '/shared/plupload/Moxie.swf',
    silverlight_xap_url: '/shared/plupload/Moxie.xap',
    runtimes: 'html5, flash, silverlight, html4',
    filters: {
      mime_types : [
        { title : "Image files", extensions : "jpg,jpeg,gif,png"},
        { title : "Zip files", extensions : "zip"},
        { title : "Audio files", extensions : "mp3,flac"}
      ],
      max_file_size: '128mb'
    },
    multipart_params: { 
        uploadType: '',
        id: '' 
    }
  };
  return {
    setOptions: function (newOpts) {
      angular.extend(opts, newOpts);
    },
    $get: function () {
      return opts;
    }
  };
})

.directive('plupload', [
  '$timeout', 'pluploadOption', 'uploaders', 'auth',
  function ($timeout, pluploadOption, uploaders, auth) {
    function lowercaseFirstLetter(string) {
      return string.charAt(0).toLowerCase() + string.slice(1);
    }

    return {
      scope: {
        pluploadUrl:'=',
        pluploadOptions:'=',
        pluploadDataId:'=',
        pluploadDataType:'@',
        pluploadCallbacks:'=',
        index: '@'
      },
      /* jshint camelcase: false */
      link: function postLink(scope, element, attrs) {
        var opts = pluploadOption;
        angular.extend(opts, scope.pluploadOptions);
        opts.url = scope.pluploadUrl;
        opts.browse_button = element[0];
        /* jshint unused: false */

        var params = { 
            uploadType: scope.pluploadDataType,
            id: scope.pluploadDataId
        };
        opts.multipart_params = params;
        //angular.extend(opts.multipart_params, params);
        //console.log(JSON.stringify(opts));

        var token = auth.getToken();
        if (token) {
            opts.headers = { 'Authorization' : 'Bearer ' + token };
        }

        var uploader = new plupload.Uploader(opts);

        var callbacks = {
            postInit: function(up) {
              
            },
            beforeUpload: function(up, files) {
                //uploader.settings.multipart_params = { albumID: document.getElementById('albumID').value}
            },
            filesAdded: function(up, files) {
                plupload.each(files, function(file) {
                    var msg = {
                        id: file.id,
                        text: file.name + ' (' + plupload.formatSize(file.size) + ')'
                    }
                    scope.$emit('addNotification', msg);
                });
                $timeout(function() { 
                    var u = uploaders.instance[scope.index];
                    console.log(JSON.stringify(uploader.settings));
                    uploader.start(); 
                    //uploaders.instance[scope.index].start();
                }, 1);
            },
            uploadProgress: function(up, file) {
            },
            fileUploaded: function(up, file, response) {
                response = eval('(' + response.response + ')');
                if (response.error){
                    uploader.trigger('Error', {
                        code : response.error.code,
                        message : response.error.message,
                        details : response.details,
                        file : file
                    });
                } else {
                    var msg = {
                        id: file.id,
                        text: file.name + ' (' + plupload.formatSize(file.size) + ') ' + file.percent + '%'
                    }
                    scope.$emit('editNotification', msg);
                }
            },
            error: function(up, err) {
                var msg = {
                    id: err.file.id,
                    text: err.file.name + ' Error: ' + err.message
                }
                scope.$emit('editNotification', msg);
            }
        };

        //angular.extend(callbacks, scope.pluploadCallbacks);

        if(callbacks) {
          var callbackMethods = ['Init', 'PostInit', 'OptionChanged',
            'Refresh', 'StateChanged', 'UploadFile', 'BeforeUpload', 'QueueChanged',
            'UploadProgress', 'FilesRemoved', 'FileFiltered', 'FilesAdded',
            'FileUploaded', 'ChunkUploaded', 'UploadComplete', 'Error', 'Destroy'];
          angular.forEach(callbackMethods, function(method) {
            var callback = (callbacks[lowercaseFirstLetter(method)] || angular.noop);
            uploader.bind(method, function() {
              callback.apply(null, arguments);
              if (!scope.$$phase && !scope.$root.$$phase) {
                scope.$apply();
              }
            });
          });
        }

        uploader.init();

        uploaders.instance[scope.index] = uploader;
        //uploaders.instance.push(uploader);
      }
    };
  }
]);