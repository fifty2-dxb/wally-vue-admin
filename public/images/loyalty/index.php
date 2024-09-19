<?php

function validate($string, $arr){
    foreach($arr as $value){
      $string = implode('',explode($value, $string));
    }
    return $string == '' ? true : false;
}


$string = "practicemakesperfect";
$valid = ["practice", "perfect", "makes"];  //true


echo validate($string, $valid) ? 'true' : 'false';
$string = "practicemakesperfectx";
$valid = ["practice", "perfect", "makes"];  //false

echo validate($string, $valid) ? 'true' : 'false';
