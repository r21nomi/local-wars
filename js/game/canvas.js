/*
* Draw Animation
* ゲームを動かす処理
* canvas.js
* ver 2.5
* Written By Ryota Niinomi
*/

var winWidth;
var winHeight;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var ac_1 = document.getElementById('angle_1');
var a_ctx_1 = ac_1.getContext('2d');
var ac_2 = document.getElementById('angle_2');
var a_ctx_2 = ac_2.getContext('2d');
var ac_3 = document.getElementById('angle_3');
var a_ctx_3 = ac_3.getContext('2d');
var ac_4 = document.getElementById('angle_4');
var a_ctx_4 = ac_4.getContext('2d');
var ac_5 = document.getElementById('angle_5');
var a_ctx_5 = ac_5.getContext('2d');
var ac_6 = document.getElementById('angle_6');
var a_ctx_6 = ac_6.getContext('2d');
var ac_7 = document.getElementById('angle_7');
var a_ctx_7 = ac_7.getContext('2d');
var ac_8 = document.getElementById('angle_8');
var a_ctx_8 = ac_8.getContext('2d');

var angle = 0;
var theta;

/* プレイヤー関係 */
var player;
var bulletSpeed = 20;
var myShots = [];
var bInterval = 0;

/* 敵関係 */
var enemies = [];  //発生した敵の格納用
var eRandam = 0;
var enemAngle = [0, 45, 90, 135, 180, 225, 270, 315];  //どの方向から出てくるか
var speeds = [];  //移動スピード
var incidence = 5;  //出現頻度

/* 難易度 */
var level_1 = [4, 5, 6, 7, 8, 9, 10];
var level_2 = [10, 11, 12, 13, 14, 15, 16]; 
var level_3 = [16, 17, 18, 19, 20, 21, 22];
var levelArray = [level_1, level_2, level_3];

/* ゲーム開始関数（map.jsから呼ばれる） */
var StartGame = function(staName) {
	evtHandler();
	fixHandler();
	init();
	console.log("level=" + level);
};

var isTouch = ('ontouchstart' in window);

/* 基本イベント処理 */
var evtHandler = function() {
	/* タッチ判定 */
	$(window).bind('touchstart mousedown', function(e) {
		e.preventDefault();
		this.pageX = (isTouch ? event.changedTouches[0].pageX : e.pageX);
		this.pageY = (isTouch ? event.changedTouches[0].pageY : e.pageY);
		var tX = this.pageX;
		var tY = this.pageY;
		if(a_ctx_1.isPointInPath(tX, tY))angle = 0;
		if(a_ctx_2.isPointInPath(tX, tY))angle = 45;
		if(a_ctx_3.isPointInPath(tX, tY))angle = 90;
		if(a_ctx_4.isPointInPath(tX, tY))angle = 135;
		if(a_ctx_5.isPointInPath(tX, tY))angle = 180;
		if(a_ctx_6.isPointInPath(tX, tY))angle = 225;
		if(a_ctx_7.isPointInPath(tX, tY))angle = 270;
		if(a_ctx_8.isPointInPath(tX, tY))angle = 315;
	});
	
	/* デバッグ用ローカルストレージデータ消去処理
	----------------------------------------*/
/*
	$('#forDebag').bind('touchstart mousedown', function(e) {
		console.log("click");
		localStorage.clear();
		window.alert("localStorage消去");
	});
*/
	/*----------------------------------------*/
};

window.onresize = function() {
	fixHandler();
}

/* サイズ調整 */
var fixHandler = function() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;
	canvas.width = winWidth;
	canvas.height = winHeight;
	ac_1.width, ac_2.width, ac_3.width, ac_4.width, ac_5.width, ac_6.width, ac_7.width, ac_8.width = winWidth;
	ac_1.height, ac_2.height, ac_3.height, ac_4.height, ac_5.height, ac_6.height, ac_7.height, ac_8.height = winHeight;
	$('#hitScreen').css('height', winHeight);
	
	if(player){
		console.log(player);
		player.posX = (winWidth - playerImg.width) / 2;
		player.posY = (winHeight - playerImg.height) / 2;
	}
};

/* レベルアップウィンドウ */
var levelUpWindow = function(lv) {
	clearInterval(timer);
	$('#clearWindow span').html(lv);
	$('#clearWindow')
	.css('display', 'block')
	.animate({
		opacity: '1'
	}, 500, function() {
		$('#nextBtn').bind('touchstart mousedown', function(e) {  //ボタンタッチ
			$('#life').css('backgroundPositionY', '0');
			timer = setInterval(gameMainLoop, 100);
			$('#clearWindow').animate({
				opacity: '0'
			}, 500, function() {
				score = 0;
				$(this).css('display', 'none');
			});
		});
	});
};

/* スコア計算 */
var addScore = function() {
	score += 10;
	nearestSta["score"] = score;
	console.log(nearestSta);
	$('#score').html(score);
	if(score >= $('#hiScore').html()){
		console.log("ハイスコア");
		nearestSta['hiscore'] = score;
	}
	if(score == levelScore[level-1]){
		if(level != levelScore.length){
			console.log("Level_up:" + levelScore[level-1]);
			levelUpWindow(level);
			level++;
			nearestSta["level"] = level;
			incidence += 5;
			speeds = levelArray[level-1];
		}
		else {
			window.alert('Congratulations!!!');
			clearInterval(timer);
		}
	}
	if(window.localStorage) window.localStorage.setItem('history', JSON.stringify(history));
};

/* ライフ計算 */
var countLife = function() {
	player.life--;
	/* ゲームオーバー */
	if(player.life == 0){
		window.localStorage.setItem('score', score);
		window.localStorage.setItem('level', level);
		clearInterval(timer);
		setTimeout(function() {
			location.replace("../gameover/index.html");  //ゲームオーバー画面へ
		}, 3000);
	}
	else {
		$('#life').css('backgroundPositionY', -18*(3-player.life)+'px');  //ライフを減らす
	}
};

/* 弾の処理 */
var myShotHandler = function() {
	if(--bInterval < 0){
		bInterval = 3;  //弾の発射間隔
		var newShot = {
			radius: 3,
			posX: player.posX + player.width / 2,
			posY: player.posY + player.height / 2,
			speed: bulletSpeed,
			angle: angle  //飛ぶ方向
		}
		myShots.push(newShot);
	}
	for(var i = 0; i < myShots.length; i++){
		var shot = myShots[i];
		/* プレイヤーの向いている方向に弾を発射 */
		shot.posX += shot.speed * Math.cos((shot.angle - 90) * Math.PI / 180);
		shot.posY += shot.speed * Math.sin((shot.angle - 90) * Math.PI / 180);
		/* 弾を描画 */
		ctx.beginPath();
	  ctx.arc(shot.posX, shot.posY, shot.radius, 0, 2 * Math.PI / 180, true);
	  ctx.fillStyle = 'rgba(255, 0, 0, 1)';
	  ctx.fill();
	}
};

/* 敵の処理 */
var enemyHandler = function() {
	for(var i = 0; i < enemies.length; i++){
		var enemy = enemies[i];
		/* 敵が中心に向かってくる */
		enemy.posX -= enemy.speed * Math.cos(enemy.angle * Math.PI / 180);
		enemy.posY -= enemy.speed * Math.sin(enemy.angle * Math.PI / 180);
		ctx.drawImage(enemy.img, enemy.posX, enemy.posY);
	}
};

/* 敵の追加 */
var addEnemies = function() {
	if(enemies.length < 20){
		if(Math.floor(Math.random()*100) < incidence){
			var i = Math.floor(Math.random()*7);
			var angle = Math.floor(Math.random()*8);
			var speed = speeds[i];
			//var img = (i >= 4 ? enemyImg_2:enemyImg_1);
			if(i <= 3)var img = enemyImg_1;
			else if(i <= 5)var img = enemyImg_2;
			else var img = enemyImg_3;
			var e = {
				img: img,
				posX: (winWidth - img.width) / 2 + 300 * Math.cos(enemAngle[angle] * Math.PI / 180),
				posY: (winHeight - img.height) / 2 + 300 * Math.sin(enemAngle[angle] * Math.PI / 180),
				width: img.width,
				height: img.height,
				speed: speed,
				angle: enemAngle[angle]
			};
			enemies.push(e);
		}
	}
};

/* ヒット判定 */
var hitJudgeHandler = function() {
	for(var i = 0; i < myShots.length; i++){
		var shot = myShots[i];
		if(!shot){continue;}
		for(var j = 0; j < enemies.length; j++){
			var enem = enemies[j];
			if(!enem){continue;}

			/* オブジェクトの中心を基準とした２点間の距離 */
			var d = ((shot.posX + shot.radius) - (enem.posX + enem.width / 2)) * ((shot.posX + shot.radius) - (enem.posX + enem.width / 2)) + ((shot.posY + shot.radius) - (enem.posY + enem.height / 2)) * ((shot.posY + shot.radius) - (enem.posY + enem.height / 2));
			/* オブジェクトの半径の合計 */
			var r = (shot.radius + enem.width / 2) * (shot.radius + enem.width / 2);
			if(d < r){
				addScore();
				delete enemies[j];
				delete myShots[i];
			}
		}	
	}
};

/* プレイヤーと敵の衝突判定 */
var EnemHitHandler = function() {
	for(var i = 0; i < enemies.length; i++){
		var enem = enemies[i];
		if(!enem){continue;}
		var d = ((enem.posX + enem.width / 2) - (player.posX + player.width / 2)) * ((enem.posX + enem.width / 2) - (player.posX + player.width / 2)) + ((enem.posY + enem.height / 2) - (player.posY + player.height / 2)) * ((enem.posY + enem.height / 2) - (player.posY + player.height / 2));
		var r = (enem.width / 2 + player.width / 2) * (enem.width / 2 + player.width / 2);
		if(d < r){
			delete enemies[i];
			countLife();
			$('#hitScreen').css('display', 'block');
			setTimeout(function() {
				$('#hitScreen').css('display', 'none');
			}, 100);
		}
	}
};

/* 弾の削除処理 */
var delShotHandler = function() {
	for(var i = 0; i < myShots.length; i++){
		var shot = myShots[i];
		if(!shot){continue;}
		if(shot.posX > winWidth || shot.posX + shot.radius < 0 || shot.posY > winHeight || shot.posY + shot.radius < 0){
			delete myShots[i];
		}
	}
	var newMyShots = [];
	for(var j = 0; j < myShots.length; j++){
		if(myShots[j])newMyShots.push(myShots[j]);
	}
	myShots = newMyShots;
};

/* 敵の削除処理 */
var delEnemyHandler = function() {
	var newEnemies= [];
	for(var i = 0; i < enemies.length; i++){
		if(enemies[i])newEnemies.push(enemies[i]);
	}
	enemies = newEnemies;
};

/* 方向転換のためのタッチエリア生成 */
var drawAngleArea = function() {
	a_ctx_1.fillStyle = '#FFF';
	a_ctx_1.globalAlpha = 0;
	a_ctx_1.beginPath();
	a_ctx_1.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_1.lineTo(winWidth / 2 + 300 * Math.cos(292 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(292 * Math.PI / 180));
	a_ctx_1.lineTo(winWidth / 2 + 300 * Math.cos(247 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(247 * Math.PI / 180));
	a_ctx_1.closePath();
	a_ctx_1.fill();
	
	a_ctx_2.fillStyle = '#F00';
	a_ctx_2.globalAlpha = 0;
	a_ctx_2.beginPath();
	a_ctx_2.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_2.lineTo(winWidth / 2 + 300 * Math.cos(337 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(337 * Math.PI / 180));
	a_ctx_2.lineTo(winWidth / 2 + 300 * Math.cos(315 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(315 * Math.PI / 180));
	a_ctx_2.lineTo(winWidth / 2 + 300 * Math.cos(292 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(292 * Math.PI / 180));
	a_ctx_2.closePath();
	a_ctx_2.fill();
	
	a_ctx_3.fillStyle = '#FFF';
	a_ctx_3.globalAlpha = 0;
	a_ctx_3.beginPath();
	a_ctx_3.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_3.lineTo(winWidth / 2 + 300 * Math.cos(22 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(22 * Math.PI / 180));
	a_ctx_3.lineTo(winWidth / 2 + 300 * Math.cos(337 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(337 * Math.PI / 180));
	a_ctx_3.closePath();
	a_ctx_3.fill();
	
	a_ctx_4.fillStyle = '#F00';
	a_ctx_4.globalAlpha = 0;
	a_ctx_4.beginPath();
	a_ctx_4.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_4.lineTo(winWidth / 2 + 300 * Math.cos(67 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(67 * Math.PI / 180));
	a_ctx_4.lineTo(winWidth / 2 + 300 * Math.cos(45 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(45 * Math.PI / 180));
	a_ctx_4.lineTo(winWidth / 2 + 300 * Math.cos(22 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(22 * Math.PI / 180));
	a_ctx_4.closePath();
	a_ctx_4.fill();
	
	a_ctx_5.fillStyle = '#FFF';
	a_ctx_5.globalAlpha = 0;
	a_ctx_5.beginPath();
	a_ctx_5.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_5.lineTo(winWidth / 2 + 300 * Math.cos(112 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(112 * Math.PI / 180));
	a_ctx_5.lineTo(winWidth / 2 + 300 * Math.cos(67 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(67 * Math.PI / 180));
	a_ctx_5.closePath();
	a_ctx_5.fill();
	
	a_ctx_6.fillStyle = '#F00';
	a_ctx_6.globalAlpha = 0;
	a_ctx_6.beginPath();
	a_ctx_6.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_6.lineTo(winWidth / 2 + 300 * Math.cos(112 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(112 * Math.PI / 180));
	a_ctx_6.lineTo(winWidth / 2 + 300 * Math.cos(135 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(135 * Math.PI / 180));
	a_ctx_6.lineTo(winWidth / 2 + 300 * Math.cos(157 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(157 * Math.PI / 180));
	a_ctx_6.closePath();
	a_ctx_6.fill();
	
	a_ctx_7.fillStyle = '#FFF';
	a_ctx_7.globalAlpha = 0;
	a_ctx_7.beginPath();
	a_ctx_7.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_7.lineTo(winWidth / 2 + 300 * Math.cos(157 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(157 * Math.PI / 180));
	a_ctx_7.lineTo(winWidth / 2 + 300 * Math.cos(202 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(202 * Math.PI / 180));
	a_ctx_7.closePath();
	a_ctx_7.fill();
	
	a_ctx_8.fillStyle = '#F00';
	a_ctx_8.globalAlpha = 0;
	a_ctx_8.beginPath();
	a_ctx_8.moveTo(winWidth / 2, winHeight / 2);
	a_ctx_8.lineTo(winWidth / 2 + 300 * Math.cos(202 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(202 * Math.PI / 180));
	a_ctx_8.lineTo(winWidth / 2 + 300 * Math.cos(225 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(225 * Math.PI / 180));
	a_ctx_8.lineTo(winWidth / 2 + 300 * Math.cos(247 * Math.PI / 180), winHeight / 2 + 300 * Math.sin(247 * Math.PI / 180));
	a_ctx_8.closePath();
	a_ctx_8.fill();
};

/* 毎回実行する処理 */
var gameMainLoop = function() {
	ctx.clearRect(0, 0, winWidth, winHeight);
	ctx.save();
	theta = angle * Math.PI / 180;
	var x = (winWidth / 2) - ((winWidth / 2) * Math.cos(theta) - (winHeight / 2) * Math.sin(theta));
	var y = (winHeight / 2) - ((winWidth / 2) * Math.sin(theta) + (winHeight / 2) * Math.cos(theta));
	ctx.translate(x, y);  //回転後の位置がずれないように移動しておく
	ctx.rotate(theta);  //マウスクリックの角度へ回転
	/* サークルを描画 */
	ctx.beginPath();
  ctx.arc(winWidth/2, winHeight/2, player.width/2+14, 0, 2 * Math.PI / 180, true);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
  ctx.fill();
  /* プレイヤーを描画 */
	ctx.drawImage(player.img, player.posX, player.posY);
	ctx.restore();
	
	myShotHandler();
	enemyHandler();
	addEnemies();
	hitJudgeHandler();
	EnemHitHandler();
	delShotHandler();
	delEnemyHandler();
	drawAngleArea();
};

/* 初期化 */
var init = function() {
	/* プレイヤー生成 */
	playerImg = new Image();
	playerImg.src = '../img/game/player.gif';
	playerImg.onload = function() {
		player = {
			img: playerImg,
			posX: (winWidth - playerImg.width) / 2,
			posY: (winHeight - playerImg.height) / 2,
			width: playerImg.width,
			height: playerImg.height,
			life: 3
		};
		/* 描画スタート */
		timer = setInterval(gameMainLoop, 100);
	}
	/* 敵表示 */
	speeds = levelArray[level-1];
	for(var i = 0; i < 3; i++){
		eRandam = Math.floor(Math.random()*8);
		enemyImg_1 = new Image();
		enemyImg_1.src = '../img/game/enemy_1.gif';
		enemyImg_1.onload = function() {
			enemies.push({
				img: enemyImg_1,
				posX: (winWidth - enemyImg_1.width) / 2 + 300 * Math.cos((enemAngle[eRandam]) * Math.PI / 180),
				posY: (winHeight - enemyImg_1.height) / 2 + 300 * Math.sin((enemAngle[eRandam]) * Math.PI / 180),
				width: enemyImg_1.width,
				height: enemyImg_1.height,
				spped: speeds[0],
				angle: enemAngle[eRandam]
			});
		}
	}
	eRandam = Math.floor(Math.random()*8);
	enemyImg_2 = new Image();
	enemyImg_2.src = '../img/game/enemy_2.gif';
	enemyImg_2.onload = function() {
		enemies.push({
			img: enemyImg_2,
			posX: (winWidth - enemyImg_2.width) / 2 + 300 * Math.cos((enemAngle[eRandam]) * Math.PI / 180),
			posY: (winHeight - enemyImg_2.height) / 2 + 300 * Math.sin((enemAngle[eRandam]) * Math.PI / 180),
				width: enemyImg_2.width,
				height: enemyImg_2.height,
			spped: speeds[4],
			angle: enemAngle[eRandam]
		});
	}
	eRandam = Math.floor(Math.random()*8);
	enemyImg_3 = new Image();
	enemyImg_3.src = '../img/game/enemy_3.gif';
	enemyImg_3.onload = function() {
		enemies.push({
			img: enemyImg_3,
			posX: (winWidth - enemyImg_3.width) / 2 + 300 * Math.cos((enemAngle[eRandam]) * Math.PI / 180),
			posY: (winHeight - enemyImg_3.height) / 2 + 300 * Math.sin((enemAngle[eRandam]) * Math.PI / 180),
				width: enemyImg_3.width,
				height: enemyImg_3.height,
			spped: speeds[6],
			angle: enemAngle[eRandam]
		});
	}	
};
