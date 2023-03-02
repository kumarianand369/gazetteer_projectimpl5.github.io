<?php

    $executionStartTime = microtime(true);

    $countryData = json_decode(file_get_contents("countryBorders.geo.json"), true);

    $countryCode = $_REQUEST['code'];

    $border = [];

    foreach ($countryData['features'] as $feature) {

        if($countryCode == $feature["properties"]['iso_a2']){
            $border = $feature;
        }   
    }


    $output['data'] = $border;
    
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>
