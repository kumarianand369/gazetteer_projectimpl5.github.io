<?php

    $executionStartTime = microtime(true) / 1000;
    $value= $_REQUEST['country'];

    $url = "http://api.geonames.org/wikipediaSearchJSON?title=" . urlencode($value) . "&maxRows=10&username=khushi";

    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['description'] = "mission saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    
    $output['data'] = $decode['geonames'];
    
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>