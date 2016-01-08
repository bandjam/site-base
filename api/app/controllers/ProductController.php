<?php

class ProductController extends Controller{

	function render(){

        //$template=new Template;
        //echo $template->render('login.htm');
	}

	function beforeroute(){
		return $this->checkToken();
	}

	function addProduct() {
		$p = new Product($this->db);
		$post = json_decode($this->f3->get('BODY'), true);
		$type = $post['ProductType'];
		$p->UserID = $post['UserID'];
		switch ($type) {
		    case "album":
				//$album->AlbumName = $this->f3->get('POST.AlbumName');
				$p->ProductName = $post['AlbumName'];
				$p->ProductType = "album";
				$p->ProductPrice = 0;
				$p->OptionGroupID = 1;
		    break;
	    } 
	    $p->save();
		echo $this->utils->successResponse($p, null);
	}

	function editProduct($post) {
		$ProductID = $this->f3->get('PARAMS.ProductID');
		$post = json_decode($this->f3->get('BODY'), true);
		$p = new Product($this->db);
		$products = $p->getById($this->userID, $ProductID);
		$product = $products[0];
		$product->ProductName = $post['ProductName'];
		$product->ProductDesc = filter_var($post['ProductDesc'], FILTER_SANITIZE_STRING);
		$product->ProductPrice = $post['ProductPrice'];
		if ($this->debug) {
			$this->utils->debug(__METHOD__, $product->cast());
		}
	    $product->save();
		echo $this->utils->successResponse($product, null);
	}

	function getUserProducts() {
		$ProductID = $this->f3->get('PARAMS.ProductID');

		$p = new Product($this->db);
		//$products = $product->all();
		if (isset($ProductID)) {
			$products = $p->getByUser($this->userID, $ProductID);
		} else {
			$products = $p->getByUser($this->userID, null);
		}
		echo $this->utils->successResponse($p, $products);
	}

	function editTrack() {
		$AlbumTrackID = $this->f3->get('PARAMS.AlbumTrackID');
		$post = json_decode($this->f3->get('BODY'), true);
		$album = new AlbumTrack($this->db);
		$track = $album->getById($AlbumTrackID);
		$track->TrackName = $post['TrackName'];
		echo $this->utils->successResponse($track, null);
	}

	function deleteTrack() {
		$AlbumTrackID = $this->f3->get('PARAMS.AlbumTrackID');
		$album = new AlbumTrack($this->db);
		$tracks = $album->getById($AlbumTrackID);
		foreach($tracks as $track) {
			$file = $this->f3->get('UPLOADS') . $track->FileName;
			if (file_exists($file)) {
				unlink($file);
			}
			$album->delete($AlbumTrackID);
		}
	}

	function streamTrack() {
		$AlbumTrackID = $this->f3->get('PARAMS.AlbumTrackID');
		$track = new AlbumTrack($this->db);
		$track->getById($AlbumTrackID);

		$filePath = $track->FileName;
		$this->utils->smartReadFile($filePath);
	}

}