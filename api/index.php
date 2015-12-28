<?php
$f3=require('fatfree/lib/base.php');
require('vendor/autoload.php');

new Session();

$f3->config('fatfree/config.ini');
//$f3->set('UPLOADS','uploads/');
$f3->set('HEADERS.Origin','*');
$f3->set('CORS.origin','*');
$f3->set('CORS.headers', ['Content-Type', 'Authorization']);
//$f3->set('AUTOLOAD','public/pages/');

//$f3->route('GET /','');
//$f3->route('GET /','MainController->render');
$f3->route('POST /upload','UploadController->upload');
$f3->route('POST /addProduct','ProductController->addProduct');
$f3->route('GET /getProducts','ProductController->getProducts');
$f3->route('GET /getProduct/@ProductID','ProductController->getProducts');
$f3->route('POST /editProduct/@ProductID','ProductController->editProduct');

$f3->route('GET /getAlbums','ProductController->getAlbums');
$f3->route('GET /getTracks/@ProductID','ProductController->getTracks');
$f3->route('POST /editTrack/@AlbumTrackID','ProductController->editTrack');
$f3->route('GET /deleteTrack/@AlbumTrackID','ProductController->deleteTrack');

// Auth
$f3->route('POST /login','AuthController->login');
$f3->route('POST /register','AuthController->register');

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