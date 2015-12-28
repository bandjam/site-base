<?php
use \Firebase\JWT\JWT;

class AuthController extends Controller{
	function render(){

        //$template=new Template;
        //echo $template->render('login.htm');
	}

	function beforeroute(){
	}

	private function getToken($userID, $userName, $userRole) {

	    $tokenId    = base64_encode(mcrypt_create_iv(32));
	    $issuedAt   = time();
	    $notBefore  = $issuedAt + 10;
	    $expire     = $notBefore + 90000;
	    $serverName = $_SERVER['SERVER_NAME']; 
	    
	    /*
	     * Create the token as an array
	     */
	    $payload = [
            'userID'   => $userID, // userid from the users table
            'userName' => $userName, // User name
            'userRole' => $userRole // User role
        ];
	    $data = [
	        'iat'  => $issuedAt,         // Issued at: time when the token was generated
	        'jti'  => $tokenId,          // Json Token Id: an unique identifier for the token
	        'iss'  => $serverName,       // Issuer
	        'nbf'  => $notBefore,        // Not before
	        'exp'  => $expire,         // Expire
	        'user' => $payload
	    ];

	    // Store key in local file, not in php
        $privateKey = $this->utils->readFile('private/apikey');
	    $secretKey = base64_decode($privateKey);
    
	    /*
	     * Encode the array to a JWT string.
	     * Second parameter is the key to encode the token.
	     * 
	     * The output string can be validated at http://jwt.io/
	     */
	    $jwt = JWT::encode(
	    	$data,
	        $secretKey, // The signing key
	        'HS512'     // Algorithm used to sign the token, see https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40#section-3
	        );
	        
	    $unencodedArray = [
	    	'data' => $payload,
	    	'token' => $jwt
		];
	    echo json_encode($unencodedArray);
	}

	/*
	 * Get all headers from the HTTP request
	 */
	public function verifyToken() {
		$token = null;
		$headers = apache_request_headers();
	    /*
	     * Look for the 'authorization' header
	     */
    	$authHeader = $headers['authorization'];
		if ($this->debug) {
			$this->utils->debug(__METHOD__, $authHeader);
		}
	    if ($authHeader) {
			//$matches = array();
			//preg_match('/Token token="(.*)"/', $headers['Authorization'], $matches);
			//if(isset($matches[1])){
			//  $token = $matches[1];
			//}
	        /*
	         * Extract the jwt from the Bearer
	         */
	        //$jwt = sscanf($authHeader, 'Authorization: Bearer %s');
	        $jwt = str_replace('Bearer ', '', $authHeader);

	        if ($jwt) {
                /*
                 * decode the jwt using the key from config
                 */
                $privateKey = $this->utils->readFile('private/apikey');
                $secretKey = base64_decode($privateKey);
                JWT::$leeway = 5;
                $token = JWT::decode($jwt, $secretKey, array('HS512'));
                return $token;
	        } else {
	            /*
	             * No token was able to be extracted from the authorization header
	             */
	            //header('HTTP/1.0 400 Bad Request');
				throw new Exception('Token was not able to be extracted from the authorization header');
	            return false;
	        }
	    } else {
	        /*
	         * The request lacks the authorization token
	         */
	        //header('HTTP/1.0 400 Bad Request');
			throw new Exception('Token not found in request');
	        return false;
	    }
	}

	function login() {
		//$user = new Album($this->db);
		$post = json_decode($this->f3->get('BODY'),true);
		//$album->AlbumName = $this->f3->get('POST.AlbumName');
		$username = $post['UserName'];
		$password = $post['UserPassword'];
		$user = new User($this->db);
		$user->getByName($username);

		if ($user->dry()) {
			echo $this->utils->errorResponse('Username or Password Incorrect');
		}

		if (password_verify($password, $user->UserPassword)) {
			$token = $this->getToken($user->UserID, $user->UserName, $user->UserRole);
		} else {
			echo $this->utils->errorResponse('Username or Password Incorrect');
		}

		return $token;
	}

	function register() {
		//$user = new Album($this->db);
		$post = json_decode($this->f3->get('BODY'),true);
		//$album->AlbumName = $this->f3->get('POST.AlbumName');
		$u = new User($this->db);
		$u->UserName = $post['UserName'];
		$u->UserRole = 'guest';
		$UserPassword = $this->utils->hashPassword($post['UserPassword']);
		$u->UserPassword = $UserPassword;
		$u->UserEmail = $post['UserEmail'];
		if ($this->debug) {
			$this->utils->debug(__METHOD__, $u->cast());
		}
		$u->save();
		$token = $this->getToken($u->UserID, $u->UserName, $user->UserRole);
		return $token;
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