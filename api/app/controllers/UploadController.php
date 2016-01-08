<?php

class UploadController extends Controller{
	public static $uploadTypes;
	public static $uploadType;
	public static $uploadGroup;
	public static $id;
	public static $uploadDir;

	function render(){

        //$template=new Template;
        //echo $template->render('login.htm');
	}

	function beforeroute(){
		return $this->checkToken();
	}

	function createAlbum($file) {
		$album = new Album($this->db);
		$album->AlbumName = $file['name'];
		//var_dump($album->cast());
	}

	public function getUploadPath($type, $id) {
		$path = $this->uploadRoot . $type . '/' . substr($id, 0, 1) . '/' . $id . '/';
		return $path;
	}

	private function resizeImage($source, $destination, $size) {
		$cmd = 'convert "' . $source . '" -resize "' . $size . '" "' . $destination . '" 2>&1';
		//echo $cmd;
		$output = shell_exec($cmd);
		if ($this->debug) {
			$this->utils->debug(__METHOD__, $cmd);
			$this->utils->debug(__METHOD__, $output);
		}
		return $output;
	}

	public function handleUpload($file, $uploadDir, $uploadType, $id) {
		$fileName = $this->f3->get('POST.name');
		$fileBaseName = pathinfo($fileName, PATHINFO_FILENAME);
        $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
		$slugName = basename($file['name']);
		$slugBaseName = pathinfo($slugName, PATHINFO_FILENAME);
		$uploadDirFull = $this->docRoot . $uploadDir;
		$fileFullPath = $uploadDir . $slugName;

		if (!file_exists($uploadDirFull)) {
			$cmd = 'mkdir -p ' . $uploadDirFull;
			$output = shell_exec($cmd);
		}

		if ($this->debug) {
			$this->utils->debug(__METHOD__, $fileFullPath);
			$this->utils->debug(__METHOD__, $cmd);
			$this->utils->debug(__METHOD__, $output);
		}

		switch ($uploadType) {
		    case "track":
		        $track = new AlbumTrack($this->db);
	            // Extract ID3 tags using getID3 engine
	        	$fileTypes = array("mp3", "flac");
				if (in_array($fileType, $fileTypes)) {
					$getID3 = new getID3;
	    			// Currently using tmp_name, actual file gets created after handler runs
					$tags = $getID3->analyze($file['tmp_name']);
					if ($this->debug) {
						$this->utils->debug(__METHOD__, $tags);
					}
					
					// See https://raw.githubusercontent.com/JamesHeinrich/getID3/master/structure.txt
					if (isset($tags['playtime_seconds'])) {
						$track->Length = $tags['playtime_seconds'];
					}
					if (isset($tags['audio'])) {
						$tag = $tags['audio'];
						$track->Bitrate = $tag['bitrate'];
						$track->BitrateMode = $tag['bitrate_mode'];
						$track->Codec = $tag['codec'];
						$track->Format = $tag['dataformat'];
						$track->Encoder = $tag['encoder'];
						$track->Lossless = $tag['lossless'];
					}
					if (isset($tags['tags']['id3v1'])) {
						$tag = $tags['tags']['id3v1'];
						$track->TrackName = $tag['title'][0];
						$track->TrackNumber = $tag['track'][0];
					}
					if (isset($tags['tags']['id3v2'])) {
						$tag = $tags['tags']['id3v2'];
						$track->TrackName = $tag['title'][0];
						$track->TrackNumber = $tag['track_number'][0];
						$track->DiscNumber = $tag['part_of_a_set'][0];
						$track->Date = $tag['year'][0];
						$track->Genre = $tag['genre'][0];
					}
					if (isset($tags['tags']['vorbiscomment'])) {
						$tag = $tags['tags']['vorbiscomment'];
						$track->TrackName = $tag['title'][0];
						$track->TrackNumber = $tag['tracknumber'][0];
						$track->DiscNumber = $tag['discnumber'][0];
						$track->Date = $tag['date'][0];
						$track->Genre = $tag['genre'][0];
					}
					if ($track->TrackName == null) {
			    		$track->TrackName = $fileBaseName;
					}
				} 

				$track->ProductID = $id;
		        $track->FileName = $fileFullPath;
		        $track->Size = $file['size'];
		        if ($this->debug) {
					$this->utils->debug(__METHOD__, $track->cast());
				}
			    $track->save();
				echo $this->utils->successResponse($track, null);
		        break;
		    case "cover":
		    	// Currently using tmp_name, actual file gets created after handler runs
		        $product = new Product($this->db);
		        $product->getByUser($this->userID, $id);
		        $product->ProductImage = $fileFullPath;
		        if ($this->debug) {
					$this->utils->debug(__METHOD__, $product->cast());
				}
		        $product->update();
		    	$source = $file['tmp_name'];
		    	$dest = $uploadDirFull . $slugBaseName . '_small' . '.' . $fileType;
		    	// Set WxH
		    	//$size = "400x250";
		    	// Set width only
		    	$size = "400";
		    	$output = $this->resizeImage($source, $dest, $size);
		    	if ($output == "") {
					echo $this->utils->successResponse($dest, null);
				}
		        break;
	        default:
	        	break;
		}
	}

	public function generateSlug($fileBaseName) {
		$web = \Web::instance();
		$baseName = $web->slug(pathinfo($fileBaseName, PATHINFO_FILENAME));
		$fileType = pathinfo($fileBaseName, PATHINFO_EXTENSION);
		$name = strtolower($baseName . '.' . $fileType);
		return $name;
	}

	public function upload() {
		$web = \Web::instance();
		$overwrite = true; // set to true, to overwrite an existing file; Default: false
		//$slug = true; // rename file to filesystem-friendly version
		self::$uploadTypes = array(
			"cover" => "album",
			"track" => "album"
		);
		self::$uploadType = $this->f3->get('POST.uploadType');
		self::$uploadGroup = self::$uploadTypes[self::$uploadType];
		self::$id = $this->f3->get('POST.id');
		self::$uploadDir = $this->getUploadPath(self::$uploadGroup, self::$id);
		$this->f3->set('UPLOADS', self::$uploadDir);
		// Execute callback handleUpload on successful upload
		$files = $web->receive(function($file){
				$this->handleUpload($file, self::$uploadDir, self::$uploadType, self::$id);
				return true;
			},
		    $overwrite,
		    function($fileBaseName, $formFieldName) {
				return $this->generateSlug($fileBaseName);
			}
	    );
	    foreach ($files as $key => $val) {
		    if (!$val) {
    			$error = array(
					'code' => "101",
					'message' => "Failed to upload " . pathinfo($key, PATHINFO_FILENAME)
				);
				echo $this->utils->errorResponse($error);
		    }
		}
	}

	function uploadexample($file) {
		/**
		 * upload.php
		 *
		 * Copyright 2013, Moxiecode Systems AB
		 * Released under GPL License.
		 *
		 * License: http://www.plupload.com/license
		 * Contributing: http://www.plupload.com/contributing
		 */

		#!! IMPORTANT: 
		#!! this file is just an example, it doesn't incorporate any security checks and 
		#!! is not recommended to be used in production environment as it is. Be sure to 
		#!! revise it and customize to your needs.


		// Make sure file is not cached (as it happens for example on iOS devices)
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
		header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
		header("Cache-Control: no-store, no-cache, must-revalidate");
		header("Cache-Control: post-check=0, pre-check=0", false);
		header("Pragma: no-cache");

		/* 
		// Support CORS
		header("Access-Control-Allow-Origin: *");
		// other CORS headers if any...
		if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
			exit; // finish preflight CORS requests here
		}
		*/

		// 5 minutes execution time
		@set_time_limit(5 * 60);

		// Uncomment this one to fake upload time
		// usleep(5000);

		// Settings
		//$targetDir = ini_get("upload_tmp_dir") . DIRECTORY_SEPARATOR . "plupload";
		$targetDir = 'uploads';
		$cleanupTargetDir = true; // Remove old files
		$maxFileAge = 5 * 3600; // Temp file age in seconds

		// Create target dir
		if (!file_exists($targetDir)) {
			//@mkdir($targetDir);
		}

		// Get a file name
		if (isset($_REQUEST["name"])) {
			$fileName = $_REQUEST["name"];
		} elseif (!empty($_FILES)) {
			$fileName = $_FILES["file"]["name"];
		} else {
			$fileName = uniqid("file_");
		}

		$filePath = $targetDir . DIRECTORY_SEPARATOR . $fileName;

		// Chunking might be enabled
		$chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
		$chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 0;


		// Remove old temp files	
		if ($cleanupTargetDir) {
			if (!is_dir($targetDir) || !$dir = opendir($targetDir)) {
				die('{"jsonrpc" : "2.0", "error" : {"code": 100, "message": "Failed to open temp directory."}, "id" : "id"}');
			}

			while (($file = readdir($dir)) !== false) {
				$tmpfilePath = $targetDir . DIRECTORY_SEPARATOR . $file;

				// If temp file is current file proceed to the next
				if ($tmpfilePath == "{$filePath}.part") {
					continue;
				}

				// Remove temp file if it is older than the max age and is not the current file
				if (preg_match('/\.part$/', $file) && (filemtime($tmpfilePath) < time() - $maxFileAge)) {
					@unlink($tmpfilePath);
				}
			}
			closedir($dir);
		}	


		// Open temp file
		if (!$out = @fopen("{$filePath}.part", $chunks ? "ab" : "wb")) {
			die('{"jsonrpc" : "2.0", "error" : {"code": 102, "message": "Failed to open output stream."}, "id" : "id"}');
		}

		if (!empty($_FILES)) {
			if ($_FILES["file"]["error"] || !is_uploaded_file($_FILES["file"]["tmp_name"])) {
				die('{"jsonrpc" : "2.0", "error" : {"code": 103, "message": "Failed to move uploaded file."}, "id" : "id"}');
			}

			// Read binary input stream and append it to temp file
			if (!$in = @fopen($_FILES["file"]["tmp_name"], "rb")) {
				die('{"jsonrpc" : "2.0", "error" : {"code": 101, "message": "Failed to open input stream."}, "id" : "id"}');
			}
		} else {	
			if (!$in = @fopen("php://input", "rb")) {
				die('{"jsonrpc" : "2.0", "error" : {"code": 101, "message": "Failed to open input stream."}, "id" : "id"}');
			}
		}

		while ($buff = fread($in, 4096)) {
			fwrite($out, $buff);
		}

		@fclose($out);
		@fclose($in);

		// Check if file has been uploaded
		if (!$chunks || $chunk == $chunks - 1) {
			// Strip the temp .part suffix off 
			rename("{$filePath}.part", $filePath);
		}

		// Return Success JSON-RPC response
		die('{"jsonrpc" : "2.0", "result" : null, "id" : "id"}');
	}
}