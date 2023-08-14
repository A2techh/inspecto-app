
var w;
var h;
var rtsp;
var lancode = "1";
var videomode = "81";
var vinorm = "N";
var profile = "3";
var maxchn = "2";
var wdrmode = "0";
var bps_1 = "1024";
var fps_1 = "30";
var gop_1 = "100";
var brmode_1 = "1";
var imagegrade_1 = "1";
var width_1 = "2560";
var height_1 = "1440";
var bps_2 = "448";
var fps_2 = "30";
var gop_2 = "100";
var brmode_2 = "1";
var imagegrade_2 = "6";
var width_2 = "800";
var height_2 = "448";
var name0 = "admin";
var password0 = "admin";
var authLevel0 = "15";
var audioflag = "1";
var rtmpport = "1935";
var httpport = "80";


function load1() {
    playchrome();
}



function preplaynoIE() {
    var streamselect0 = getcookie('streamselect');
    if (streamselect0 == 0) {
        w = parseInt(width_1);
        h = parseInt(height_1);
        //document.form1.streamselect[0].selected = true;
    }
    else if (streamselect0 == 1) {
        w = parseInt(width_2);
        h = parseInt(height_2);
        document.form1.streamselect[1].selected = true;
    }
    else {
        w = parseInt(width_1);
        h = parseInt(height_1);
        document.form1.streamselect[0].selected = true;
    }
}

var player = null;
function playchrome() {
    preplaynoIE();

    var ip = document.location.hostname;
    var webport = document.location.port;
    if (webport == "") {
        webport = "80";
    }

    player = new HxPlayer();
    var canvas = document.getElementById("video_cavas");

    self.player.init({ canvas: canvas, width: 640, height: 352 });

    self.player.playvideo(ip, webport, '12', name0, password0);
}

function stopchrome() {
    if (player != null) {
        player.stopvideo();
        player = null;
    }
}
