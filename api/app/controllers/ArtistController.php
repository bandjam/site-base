<?php

class ArtistController extends Controller{
	function render(){

        //$template=new Template;
        //echo $template->render('login.htm');
	}

	function beforeroute(){
	}

	function addAlbum() {
		$album = new Album($this->db);
		$post = json_decode($this->f3->get('BODY'),true);
		//$album->AlbumName = $this->f3->get('POST.AlbumName');
		$album->AlbumName = $post['AlbumName'];
		$album->save();
		echo json_encode($album->cast());
	}

	function getAlbums($artistID) {
		$album = new Album($this->db);
		//$album->getById(1);
		$list = array_map(array($album,'cast'),$album->all());
		//$album->getByName('Book the First');
		//$album->showDataInJSON($album->cast());
		echo json_encode($list);
	}

	function upload() {
		$web = \Web::instance();
		$service = new UploadController();
		$service->uploadff($file);
		//var_dump($file);
	}
}