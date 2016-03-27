/*
*　Background Google Map
*　map.js
*　ver 2.5
*　現在位置の最寄り駅を中心にしたマップを生成するプラグラム
*　Written By Ryota Niinomi
*/


var latitude = 0;
var longitude = 0;

/* canvcas.jsにも引き継がれるグローバル変数 */
var history = [];
var score = 0;
var hiScore = 0;
var level = 1;
var nearestSta;
var levelScore = ['200', '400', '600'];


/* マップを生成 */
var showMap = function(lat, lon, sName){
	var current_position = new google.maps.LatLng(lat, lon);
	var map = new google.maps.Map(
		document.getElementById('map'), {
			zoom:16,
			center:current_position,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		}
	);
	StartGame(sName);  //Canvas.js内のStartGame関数
};


/* ローカルストレージから情報を取得 */
var checkHistHandler = function(sName) {
	if(window.localStorage) var newHistory = JSON.parse(window.localStorage.getItem('history'));  //オブジェクト形式で取得
	if(newHistory){
		console.log("newHistory_get");
		history = newHistory;  //配列を上書き
		for(var i = 0; i < history.length; i++){
			if(history[i]['name'] == sName){  //既にプレイした駅があれば
				nearestSta = history[i];
				level = history[i]['level'];
				//ハイスコアを取得
				hiScore = history[i]['hiscore'];
				$('#hiScore').html(hiScore);
				console.log("ヒストリーゲット");
			}
		}
	}
	if(!nearestSta){
		console.log("つくりました");
		var station = { "name":sName, "hiscore":"0", "score":"0", "level":"1" };
		history.push(station);
		nearestSta = history[history.length-1];
	}
	showStartwin(sName, level);
};


/* マップサイズの調整 */
var fixMapSize = function() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;
	$('#map').css({
		width: winWidth + 'px',
		height: winHeight + 'px'
	});
};


$(window).resize(function() {
	fixMapSize();
	fixWin();
});


/* ゲームスタートウィンドウの調整 */
var fixWin = function() {
	$('.gWindow ul').css('margin-top', (winHeight - 250) / 2 + 'px');
	$('.gWindow').css({
		height: winHeight + 'px'
	})
};


/* ゲームスタートウィンドウの表示 */
var showStartwin = function(sName, level) {
	$('#gStartWindow li').html(sName + '駅を守り抜け！');
	$('#gStartWindow li:first-child').html(sName + 'WARS');
	$('#gLevelWindow span').html(levelScore[level-1]);
	$('#gLevelWindow #lv span').html(level);
	$('#gStartWindow')
	.css('display', 'block')
	.animate({
		opacity: '1'
	}, 500, function() {
		var timer = setTimeout(function() {
			$('#gLevelWindow')
			.css('display', 'block')
			.animate({
				opacity: '1'
			}, 500, function() {
				$('#startBtn').click(function() {
					$('#gLevelWindow').animate({
						opacity: '0'
					}, 500, function() {
						$(this).css('display', 'none');
						showMap(latitude, longitude, sName);  //マップを描画
					});
				});
			});
			$('#gStartWindow').animate({
				opacity: '0'
			}, 500, function() {
				$(this).css('display', 'none');
			});
			clearTimeout(timer);
		}, 4000);
	});
};


/* 読み込み完了後処理 */
$(function(){
	$("#wrapper").delay(1700).fadeIn("slow");
	var staName =  window.localStorage.getItem('nearestSta_Name');
	latitude =  window.localStorage.getItem('nearestSta_Lat');
	longitude =  window.localStorage.getItem('nearestSta_Lon');
	console.log("latitude = " + latitude + " / longitude = " + longitude);
	fixMapSize();
	fixWin();
	checkHistHandler(staName);
});