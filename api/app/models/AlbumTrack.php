<?php

class AlbumTrack extends DB\SQL\Mapper{

	public function __construct(DB\SQL $db) {
	    parent::__construct($db,'albumtracks');
	}
	
	public function all() {
	    $this->load();
	    return $this->query;
	}

	public function getById($id) {
	    $this->load(array('AlbumTrackID=?',$id));
	    return $this->query;
	}

	public function getByProductId($id) {
	    $this->load(
	    	array('ProductID=?',$id),
	    	array('order' => 'TrackNumber ASC')
    	);
	    return $this->query;
	}

	public function getByName($name) {
		$this->load(array('TrackName=?', $name));
	}

	public function add($albumtrack) {
	    //$this->save();
	    //$this->copyFrom('POST');
	    //$user->userID='jane';
		//$user->password=md5('secret');
		//$user->visits=0;
		/*
	    $this->copyFrom('POST', function($val) {
			// the 'POST' array is passed to our callback function
		    return array_intersect_key($val, array_flip(array('AlbumName')));
		});
		*/
		$albumtrack->save();
	}
	
	public function edit($id) {
	    $this->load(array('data->>AlbumID=?',$id));
	    $this->copyFrom('POST');
	    $this->update();
	}
	
	public function delete($id) {
	    $this->load(array('AlbumTrackID=?',$id));
	    $this->erase();
	}

	public function showDataInJSON(){
    	header("Content-Type: application/json", true);
    	echo json_encode($this);
    }
}