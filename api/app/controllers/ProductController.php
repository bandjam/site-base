<?php

class ProductController extends Controller{
	function render(){

        //$template=new Template;
        //echo $template->render('login.htm');
	}

	function beforeroute(){
	}

	function test() {

		$product = new Product($this->db);
		//$product->getById(1);
		$list = array_map(array($product,'cast'),$product->all());
		//$product->getByName('Book the First');
		//$product->showDataInJSON($product->cast());
		echo json_encode($list);
	}
}