<?php

class Controller {
	
	protected $f3;
    protected $db;
    protected $utils;
    protected $docRoot;
    protected $uploadRoot;
    protected $debug;
	protected $userID;


	function beforeroute(){
	}

	function afterroute(){
		//echo '- After routing';
	}

	function __construct() {
		
		$f3=Base::instance();
		$this->f3=$f3;

	    $db=new DB\SQL(
	        $f3->get('devdb'),
	        $f3->get('devdbusername'),
	        $f3->get('devdbpassword'),
	        array( \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION )
	    );

	    $this->db=$db;

	    $this->utils = new Utils();
	    $this->docRoot = $_SERVER['DOCUMENT_ROOT'] . '/api/';
	    $this->uploadRoot = 'uploads/';
	    $this->debug = true;
	}

	public function checkToken(){
		$auth = new AuthController();
		try {
			$token = $auth->verifyToken();
		} catch (Exception $e) {
			echo $this->utils->errorResponse($e->getMessage());
			return false;
    	}
    	if (isset($token)) {
	    	if ($this->debug) {
				$this->utils->debug(__METHOD__, $token);
			}
			$this->userID = $token->user->userID;
			return true;
		}
	}

}
