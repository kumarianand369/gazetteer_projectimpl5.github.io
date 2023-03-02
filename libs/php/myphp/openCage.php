<?php 


$key = "5c8427253941b44de9500628964f83ed";

$url = "https://api.opencagedata.com/geocode/version/format?parameters";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    $result = curl_exec($ch);

    curl_close($ch);
    
    $decode = json_decode($result, true);

    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['description'] = "saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    
    $output['data'] = $decode;
    
    
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);

?>
