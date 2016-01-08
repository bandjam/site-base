<?php

class Product extends DB\SQL\Mapper{

	public function __construct(DB\SQL $db) {
	    parent::__construct($db,'products');
	}
	
	public function all() {
	    $this->load();
	    return $this->query;
	}

	public function getByUser($UserID, $id) {
		if (isset($id)) {
	    	$this->load(array('UserID=? AND ProductID=?', $UserID, $id));
		} else {
	    	$this->load(array('UserID=?',$UserID));
	    }
	    return $this->query;
	}

	public function getById($id) {
	    $this->load(array('ProductID=?', $id));
	    return $this->query;
	}

	public function getByName($name) {
		$this->load(array('ProductName=?', $name));
	}

	public function add() {
	    $this->copyFrom('POST');
	    $this->save();
	}
	
	public function edit($id) {
	    $this->load(array('ProductID=?',$id));
	    $this->copyFrom('POST');
	    $this->update();
	}
	
	public function delete($id) {
	    $this->load(array('ProductID=?',$id));
	    $this->erase();
	}

	public function showDataInJSON(){
    	header("Content-Type: application/json", true);
    	echo json_encode($this);
    }
}