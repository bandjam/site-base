/*
* jamstash.settings.service Module
*
* Houses Jamstash's global settings and a few utility functions.
*/
angular.module('app.common.globals', []) 

.constant('directory', (function(){
  var componentsDirectory = "components/";
  var sharedDirectory = "shared/";
  return {
    cart: componentsDirectory + "cart/",
    shop: componentsDirectory + "shop/",
    artist: componentsDirectory + "artist/",
    shared: sharedDirectory,
    auth: sharedDirectory + "auth/",
    dev: "dev/"
  };
})())

.constant('API', 'http://web02/api')

.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})

.service('globals', function () {
    'use strict';

    //this.SearchTypes = [
    //    { id: 0, name: "Song" },
    //    { id: 1, name: "Album" },
    //    { id: 2, name: "Artist" }
    //];
    //this.Layouts = [
    //    { id: "grid", name: "Grid" },
    //    { id: "list", name: "List" }
    //];
    //this.AlbumSorts = [
    //    { id: "default", name: "Default Sort" },
    //    { id: "artist", name: "Artist" },
    //    { id: "album", name: "Album" },
    //    { id: "track", name: "Track" },
    //    { id: "createdate desc", name: "Date Added" }
    //];
    this.settings = {
        // Subsonic
        /* Demo Server
        Username: "android-guest"),
        Password: "guest"),
        Server: "http://subsonic.org/demo"),
        */
        Url: "http://web02/api",
        Username: "",
        Password: "",
        Server: "http://web02/api",
        Timeout: 20000,
        Protocol: "jsonp",
        ApplicationName: "Jamstash",
        ApiVersion: "1.6.0",
        //AutoPlaylists: "",
        //AutoPlaylistSize: 25,
        //AutoAlbumSize: 15,
        //// General
        //HideAZ: false,
        //ScrollTitle: true,
        //NotificationSong: true,
        //NotificationNowPlaying: false,
        //SaveTrackPosition: false,
        //ForceFlash: false,
        //Theme: "Default",
        //DefaultLibraryLayout: this.Layouts[0],
        //DefaultSearchType: this.SearchTypes[0],
        //DefaultAlbumSort: this.AlbumSorts[0],
        //DefaultArchiveAlbumSort: "date desc",
        //Jukebox: false,
        //AutoPlay: false,
        //LoopQueue: false,
        //Repeat: false,
        //Debug: false,
        //ShowQueue: false
    };
    //this.SavedCollections = [];
    //this.Player1 = '#playdeck_1';
    //this.archiveUrl = 'https://archive.org/';
    //this.ChangeLog = null;
    //this.Messages = [];

    this.BaseURL = function () { return this.settings.Server ; };
    this.BaseParams = function () { return 'u=' + this.settings.Username + '&p=' + this.settings.Password + '&f=' + this.settings.Protocol + '&v=' + this.settings.ApiVersion + '&c=' + this.settings.ApplicationName; };
    this.BaseJSONParams = function () { return 'u=' + this.settings.Username + '&p=' + this.settings.Password + '&f=json&v=' + this.settings.ApiVersion + '&c=' + this.settings.ApplicationName; };
});
