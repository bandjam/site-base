<?php
$f3=require('fatfree/lib/base.php');
new Session();

$f3->config('fatfree/config.ini');
$f3->set('UPLOADS','uploads/');
$f3->set('HEADERS.Origin','*');
$f3->set('CORS.origin','*');
$f3->set('CORS.headers','Content-Type');
//$f3->set('AUTOLOAD','public/pages/');

//$f3->route('GET /','');
//$f3->route('GET /','MainController->render');
$f3->route('GET /login','UserController->render');
$f3->route('GET /authenticate','UserController->authenticate');
$f3->route('GET /product','ProductController->test');

// Artist
$f3->route('POST /upload','ArtistController->upload');
$f3->route('POST /addAlbum','ArtistController->addAlbum');
$f3->route('GET /getAlbums','ArtistController->getAlbums');

// Auth
$f3->route('GET /login','AuthController->login');

$f3->route('GET /',
    function() {
        echo 'Hello, world!';
    }
);

class WebPage {
    function display() {
        echo 'I cannot object to an object';
    }
}

$f3->route('GET /about','WebPage->display');

$f3->run();