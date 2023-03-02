<?php

    $executionStartTime = microtime(true) / 1000;
    $apiKey = "ff5347611ad247d3bdcfeaf546c60f2d";

    $url = "http://newsapi.org/v2/top-headlines?country=" . $_REQUEST['country'] . "&apiKey=" . $apiKey;


    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36");
   
    $result = curl_exec($ch);
    curl_close($ch);
    $decode = json_decode($result, true);
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['description'] = "mission saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $decode;
    
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);

?>