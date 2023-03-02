<?php

    $executionStartTime = microtime(true) / 1000;

   $url = "https://api.covid19api.com/summary?country=" . $_REQUEST['country'];
  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    $result = curl_exec($ch);
    curl_close($ch);
  
   $decode = json_decode($result, true);

    //Update HTTP status messages:
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['description'] = "covid saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    //store the string of results in 'data':
  

    $output['data'] = $decode;


    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);

?>