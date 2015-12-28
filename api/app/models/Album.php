<?php

class Album extends DB\SQL\Mapper{

	public function __construct(DB\SQL $db) {
	    parent::__construct($db,'albums');
	}
	
	public function all() {
	    $this->load();
	    return $this->query;
	}

	public function getById($id) {
	    $this->load(array('AlbumID=?',$id));
	    return $this->query;
	}

	public function getByName($name) {
		$this->load(array('AlbumName=?', $name));
	}

	public function add($album) {
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
		$album->save();
	}
	
	public function edit($id, $album) {
		$item = $this->load(array('AlbumID=?', $id));
		if ($item) {
			if (!isset($album)) {
		    	$item->copyFrom('POST');
			} else {
		    	$item->copyFrom($album);
			}
		    $item->update();
		}
	}
	
	public function delete($id) {
	    $this->load(array('AlbumID=?',$id));
	    $this->erase();
	}
}