<?php

class PublicController extends Controller{

	function render(){

        //$template=new Template;
        //echo $template->render('login.htm');
	}

	function beforeroute(){
	}

	function getProducts() {
		$ProductID = $this->f3->get('PARAMS.ProductID');

		$p = new Product($this->db);
		//$products = $product->all();
		if (isset($ProductID)) {
			$products = $p->getById($ProductID);
		} else {
			$products = $p->all();
		}
		echo $this->utils->successResponse($p, $products);
	}

	function getTracks() {
		$ProductID = $this->f3->get('PARAMS.ProductID');
		$album = new AlbumTrack($this->db);
		$tracks = $album->getByProductId($ProductID);
		echo $this->utils->successResponse($album, $tracks);
	}

	function streamTrack() {
		$AlbumTrackID = $this->f3->get('PARAMS.AlbumTrackID');
		$track = new AlbumTrack($this->db);
		$track->getById($AlbumTrackID);

		$filePath = $track->FileName;
		$this->utils->smartReadFile($filePath);
	}

	function getTrackMetadata($id) {
		$AlbumTrackID = $this->f3->get('PARAMS.AlbumTrackID');
		$track = new AlbumTrack($this->db);
		$track->getById($AlbumTrackID);

		$filePath = $track->FileName;
		$getID3 = new getID3;
		$tags = $getID3->analyze($filePath);
		echo "<pre>";
		echo print_r($tags, TRUE);
		echo "</pre>";
	}

}