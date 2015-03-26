<?php
switch($_GET['type']) {
  case "defaults":
    include_once('demo-defaults.html');
    break;
  case "discovery":
    include_once('demo-discovery.html');
    break;
  default:
    include_once('demo.html');
}
?>
