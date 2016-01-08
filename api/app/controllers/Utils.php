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

    /**
    * Reads the requested portion of a file and sends its contents to the client with the appropriate headers.
    * 
    * This HTTP_RANGE compatible read file function is necessary for allowing streaming media to be skipped around in.
    * 
    * @param string $location
    * @param string $filename
    * @param string $mimeType
    * @return void
    * 
    * @link https://github.com/happyworm/smartReadFile
    * @link http://php.net/manual/en/function.readfile.php#86244
    */
    public function smartReadFile($file)
    {
        $fileBaseName = pathinfo($file, PATHINFO_FILENAME);
        $fileType = pathinfo($file, PATHINFO_EXTENSION);
        $fileName = $fileBaseName . '.'. $fileType;

        $location = $file;
        $filename = $fileName;
        $mimeType = 'application/octet-stream';

        // You could check they have rights to access the media here.
        //  - No checking in this example.

        // Get the type by file extension
        switch ($fileType) {
            case 'mp3':
                $mimeType = 'audio/mpeg';
                break;
            case 'ogg':
                $mimeType = 'audio/ogg';
                break;
            case 'oga':
                $mimeType = 'audio/ogg';
                break;
            case 'm4a':
                $mimeType = 'audio/mp4';
                break;
            case 'm4v':
                $mimeType = 'video/mp4';
                break;
            case 'mp4':
                $mimeType = 'video/mp4';
                break;
            case 'webm':
                $mimeType = 'video/webm';
                break;
            case 'ogv':
                $mimeType = 'video/ogg';
                break;
        }

        if (!file_exists($location))
        {
            header ("HTTP/1.1 404 Not Found");
            return;
        }
        
        $size   = filesize($location);
        $time   = date('r', filemtime($location));
        
        $fm     = @fopen($location, 'rb');
        if (!$fm)
        {
            header ("HTTP/1.1 505 Internal server error");
            return;
        }
        
        $begin  = 0;
        $end    = $size - 1;
        
        if (isset($_SERVER['HTTP_RANGE']))
        {
            if (preg_match('/bytes=\h*(\d+)-(\d*)[\D.*]?/i', $_SERVER['HTTP_RANGE'], $matches))
            {
                $begin  = intval($matches[1]);
                if (!empty($matches[2]))
                {
                    $end    = intval($matches[2]);
                }
            }
        }

        if (isset($_SERVER['HTTP_RANGE']))
        {
            header('HTTP/1.1 206 Partial Content');
        }
        else
        {
            header('HTTP/1.1 200 OK');
        }
        
        header("Content-Type: $mimeType"); 
        header('Cache-Control: public, must-revalidate, max-age=0');
        header('Pragma: no-cache');  
        header('Accept-Ranges: bytes');
        header('Content-Length:' . (($end - $begin) + 1));
        if (isset($_SERVER['HTTP_RANGE']))
        {
            header("Content-Range: bytes $begin-$end/$size");
        }
        header("Content-Disposition: inline; filename=$filename");
        header("Content-Transfer-Encoding: binary");
        header("Last-Modified: $time");
        
        $cur    = $begin;
        fseek($fm, $begin, 0);
        
        while(!feof($fm) && $cur <= $end && (connection_status() == 0))
        {
            print fread($fm, min(1024 * 16, ($end - $cur) + 1));
            $cur += 1024 * 16;
        }
    }
}