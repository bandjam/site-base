<?php

class Utils{
	public function successResponse($obj, $data){
    	header("Content-Type: application/json", true);
    	if (is_array($data)) {
	    	$list = array_map(array($obj,'cast'), $data);
	    } elseif (is_string($obj)) {
            $list = $obj;
        } else {
	    	$list = $obj->cast();
	    }
    	$response = array(
            'success' => true,
            'data' => $list
		);
    	return json_encode($response);
    }

    public function errorResponse($data){
        //header('HTTP/1.1 500 Internal Server Error');
        header('HTTP/1.1 401 Unauthorized');
    	header("Content-Type: application/json", true);
    	$response = array(
            'success' => false,
            'data' => $data
        );
    	return json_encode($response);
    }

    public function debug($method, $var) {
        if (isset($var)) {
            error_log($method . ': ' . print_r($var, TRUE)); 
        }
    }

    public function readFile($file) {
        $f = fopen($file, "r") or die("Unable to open file!");
        $content = fread($f,filesize($file));
        fclose($f);
        return $content;
    }

    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
}