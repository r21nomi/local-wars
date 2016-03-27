/*
*　Start Screen
*　top.js
*　ver 1.0
*　現在地の取得とスタート画面
*　Written By Ryota Niinomi
*/

var latitude = 0;
var longitude = 0;

$(function(){
	setTimeout(function() {
		if (window.pageYOffset === 0) {
			window.scrollTo(0,1);
		}
	}, 10);
	$("#wrapper").delay(1700).fadeIn("slow");
	$('#startBtn_1').bind('touchstart mousedown', function(e) {
		/* 現在地を取得 */
		navigator.geolocation.getCurrentPosition(get_position, error_position, option);
	});
	$('#startBtn_2').bind('touchstart mousedown', function(e) {
		location.replace("select/index.html");
	});
});

/* 現在地を格納 */
var get_position = function(position) {
	latitude = position.coords.latitude;  //緯度
	longitude = position.coords.longitude;  //軽度
	stationReq(latitude, longitude);
};

var error_position = function(error) {
	
};
var option = {
	enableHighAccuracy:true,
	timeout: 10*1000,
	maximumAge: 0
};


/* 現在地情報をもとに最寄り駅検索APIにリクエスト */
var stationReq = function(lat, lon) {
	$.ajax({
		    url : 'http://express.heartrails.com/api/json?method=getStations',
		    dataType : "jsonp",
		    data : {
		        x : lon,
		        y : lat
		    },
		    success : function(json){
		    	console.log(json.response.station[0].name);
		    	console.log('longitude: ' + json.response.station[0].x);
		    	console.log('latitude: ' + json.response.station[0].y);
		    	var staName = json.response.station[0].name;
		    	var newLat = json.response.station[0].y;
		    	var newLon = json.response.station[0].x;
		    	/* ローカルストレージに保存 */
		    	if(window.localStorage){
		    		window.localStorage.setItem('nearestSta_Name', staName);
		    		window.localStorage.setItem('nearestSta_Lat', newLat);
		    		window.localStorage.setItem('nearestSta_Lon', newLon);
		    		//$(window).bind("storage", function (event) {
		    			location.replace("game/index.html");
		    		//});
		    	}
		    },
		    error : function(){
		        alert('error');
		    }
		});
};
