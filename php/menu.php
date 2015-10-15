<?php
echo'

<body id="page-top" data-spy="scroll" data-target=".navbar-fixed-top">
<nav class="navbar navbar-default navbar-fixed-top" id="MyNav">
<div class="container-fluid" id="navContainer">
  <!-- Brand and toggle get grouped for better mobile display -->
  <div class="navbar-header">
    <button id="collapseButton" type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
      <span class="sr-only">Toggle navigation</span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </button>
  </div>

  <!-- Collect the nav links, forms, and other content for toggling -->
   <div class="collapse navbar-collapse" id="navbar-collapse">
    <ul class="nav navbar-nav navbar-left">
    <li><a href="/home/" id="homeBtn">Home</a></li>
    <li><a href="/docs/" id="docBtn">Documentation</a></li>
    <li><a href="/demo" id="demoBtn">Demo</a></li>
    <li><a href="https://www.github.com/riyazdf/consolejson">Github</a></li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <li><a href="/about/" id="aboutBtn">About</a></li>
    </ul>
  </div>
</div><!-- /.container-fluid -->
</nav>
<script>
$("#collapseButton").on("click", function() {
    if ($("#navbar-collapse").hasClass("in")) {
      $("#navbar-collapse").removeClass("in");
    } else {
      $("#navbar-collapse").addClass("in");
    }
  });
</script>
';
?>


