<?php

class UserController extends Controller{
	function render(){

        $template=new Template;
        echo $template->render('login.htm');
	}

	function beforeroute(){
		return $this->checkToken();
	}

	function checkout() {
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
}