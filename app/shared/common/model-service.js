/**
* app.model Module
*
* Stores the Index, Artist, Album and Song model. Provides a mapping service that converts between subsonic's
* representation and ours.
*/
angular.module('app.model', [
    'ngLodash', 
    'app.utils',
    'app.common.globals'
])

.service('model', [
    'lodash', 
    'utils', 
    'globals',
    function (
        _, 
        utils, 
        globals
    ) {
    'use strict';

    var model = {
        Album: function () {
            this.ProductID = null;
            this.ProductName = null;
            this.UserID = null;
            this.ProductImage = null;
            this.Date = null;
            this.Description = null;
            this.Url = null;
            this.ProductType = null;
        },
        Song: function () {
            this.AlbumTrackID = null;
            this.ProductID = null;
            this.TrackNumber = null;
            this.TrackName= null;
            this.UserID = null;
            this.ProductImage = null;
            this.Length = null;
            this.Rating = null;
            this.Starred = null;
            this.Format = null;
            this.Specs = null;
            this.Position = null;
            this.Selected = false;
            this.Playing = false;
            this.Description = null;
            Object.defineProperty(this, "Time",
            {
                get: function()
                {
                    return this.Length === '' ? '00:00' : utils.secondsToTime(this.Length);
                },
                enumerable: true
            });
            Object.defineProperty(this, "MimeType",
            {
                get: function()
                {
                    return 'audio/' + this.Format;
                },
                enumerable: true
            });
            Object.defineProperty(this, "Url",
            {
                get: function()
                {
                    return globals.settings.Url + '/streamTrack/' + this.AlbumTrackID;
                },
                enumerable: true
            });
        },
        mapObject: function(jsonResult, constructor) {
            var o = new constructor();
            //angular.merge(o, jsonResult);
            angular.extend(o, jsonResult);
            //_.extend(o, jsonResult);
            return o;
        },
        mapResult: function(jsonResult, constructor) {
            if (angular.isArray(jsonResult)) {
                var models = [];
                angular.forEach(jsonResult, function(object) {
                    models.push(model.mapObject(object, constructor));
                });
                //console.log(JSON.stringify(models));
                return models;
            } else {
                return mapObject(jsonResult, constructor);
            }
        }

    }

    model.Song.prototype = { 
        Time: function(){
            return this.Length === '' ? '00:00' : utils.secondsToTime(this.Length);
        },
        MimeType: function(){
            return 'audio/' + this.Format;
        }
    }

    return model;
    
}])
