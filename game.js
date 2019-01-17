var ctx = document.getElementById("ctx").getContext("2d");

var HEIGHT = 540;
var WIDTH = 960;

var frameCount = 0;

var leftClicked = false;
var rightClicked = false;
var clickCount = 0;
var gonnaChangeClickCount = 0;

var fromId = [];
var toId;

var cells = 0;

var mousePosition = {};
var cellList = {};
var unitList = {};
var squareList = {};
var textRectangleList = {};

var menu;

var playedMapNumber;

var youWon = false;
var youLost = false;
var endGame;
var wonMap = [];

var editMap = false;

var numberingCells = false;

var keyboard = {
	escape:false,
	E:false,
	N:false,
};

var Img = {};
Img.none = new Image();
Img.none.src = "images/none.png";
Img.P = [];
Img.P_unit = [];
Img.P[1] = new Image();
Img.P[1].src = "images/blue.png";
Img.P[2] = new Image();
Img.P[2].src = "images/red.png";
Img.P[3] = new Image();
Img.P[3].src = "images/green.png";
Img.P[4] = new Image();
Img.P[4].src = "images/violet.png";
Img.P_unit[1] = new Image();
Img.P_unit[1].src = "images/blue_unit.png";
Img.P_unit[2] = new Image();
Img.P_unit[2].src = "images/red_unit.png";
Img.P_unit[3] = new Image();
Img.P_unit[3].src = "images/green_unit.png";
Img.P_unit[4] = new Image();
Img.P_unit[4].src = "images/violet_unit.png";
Img.background = new Image();
Img.background.src = "images/background.png";
Img.help = new Image();
Img.help.src = "images/blue.png";
Img.logo = new Image();
Img.logo.src = "images/logo.png";
Img.lost = new Image();
Img.lost.src = "images/lost.png";
Img.won = new Image();
Img.won.src = "images/won.png";

clearScreen = function(){
	ctx.drawImage(Img.background,0,0,WIDTH/2,HEIGHT/2,0,0,WIDTH,HEIGHT);
}

Cell = function(type,id,x,y,size,ownedBy,reproduction,limit,units){

	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		realSize:size,
		size:size,
		ownedBy:ownedBy,
		reproduction:reproduction,
		limit:limit,
		units:units,
		marked:false,
		frequency:0,
		number:cells,
	}

	cellList[id] = self;
}

Unit = function(type,id,x,y,spdX,spdY,ownedBy,movingToId){
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		spdX:spdX,
		spdY:spdY,
		size:5,
		ownedBy:ownedBy,
		movingToId:movingToId,
	}

	unitList[id] = self;
}

Square = function(type,id,x,y,size,color,number){
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		size:size,
		color:color,
		number:number,
	}
	
	squareList[id] = self;
}

TextRectangle = function(type,id,x,y,width,color,text){
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		width:width,
		height:30,
		color:color,
		text:text,
	}

	textRectangleList[id] = self;
}

generateEntity = function(type,param1,param2,param3,param4,param5){
						//('cell',x,y,size,ownedBy)
						//('unit',CellId1,CellId2)
						//('square',x,y,size,color,number)
						//('textRectangle',x,y,width,color,text)
	var id = Math.random();

	switch(type){
		case 'cell':
			var x = param1;
			var y = param2;
			var size = param3;
			var ownedBy = param4;
			
			if(ownedBy != 'P1' && ownedBy != 'none')
				var units = 15;
			else
				var units = 0;

			var reproduction = Math.floor((120 - size)*(7/10));
			if(size <= 50){
				var limit = 50;
				if(ownedBy == 'none')
					units = 5;
			} else if(size <= 70){
				var limit = 70;
				if(ownedBy == 'none')
					units = 10;
			} else if(size <= 100){
				var limit = 100;
				if(ownedBy == 'none')
					units = 15;
			}
			cells++;

			Cell(type,id,x,y,size,ownedBy,reproduction,limit,units);
			
			break;
		case 'unit':
			var cellId1 = param1;
			var cellId2 = param2;
			
			if(Math.random() > 0.5)
				var x = Math.random() * cellList[cellId1].size + cellList[cellId1].x;
			else
				var x = -Math.random() * cellList[cellId1].size + cellList[cellId1].x;
		
			if(Math.random() > 0.5)
				var y = Math.random() * cellList[cellId1].size + cellList[cellId1].y;
			else
				var y = -Math.random() * cellList[cellId1].size + cellList[cellId1].y;
		
			var angleX = cellList[cellId2].x - x;
			var angleY = cellList[cellId2].y - y;
		
			var angle = Math.atan2(angleY,angleX) / Math.PI * 180;
		
			var spdX = Math.cos(angle/180*Math.PI)*5/3*2;
			var spdY = Math.sin(angle/180*Math.PI)*5/3*2;
		
			Unit(type,id,x,y,spdX,spdY,cellList[cellId1].ownedBy,cellList[cellId2].id);
			
			break;
		case 'square':
			var x = param1;
			var y = param2;
			var size = param3;
			var color = param4;
			var number = param5;
			
			Square(type,id,x,y,size,color,number);
			break;
		case 'textRectangle':
			var x = param1;
			var y = param2;
			var width = param3;
			var color = param4;
			var text = param5;

			TextRectangle(type,id,x,y,width,color,text);
			break;
	}
}

updateEntity = function(entity){
	if(entity.spdX != undefined && entity.spdY != undefined)
		updateEntityPosition(entity);
	if(entity.size != undefined && entity.realSize != undefined && entity.units != undefined)
		updateEntitySize(entity);

	drawEntity(entity);
}

updateEntityPosition = function(entity){
	entity.x += entity.spdX;
	entity.y += entity.spdY;
}

updateEntitySize = function(entity){
	entity.size = entity.realSize + entity.units/5;
}

drawEntity = function(entity){

	if(entity.type != 'square')
		switch(entity.ownedBy){
			case 'P1':
				switch(entity.type){
					case 'cell':
						ctx.drawImage(Img.P[1],0,0,Img.P[1].width,Img.P[1].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
					case 'unit':
						ctx.drawImage(Img.P_unit[1],0,0,Img.P_unit[1].width,Img.P_unit[1].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
				}
				break;
			case 'P2':
				switch(entity.type){
					case 'cell':
						ctx.drawImage(Img.P[2],0,0,Img.P[2].width,Img.P[2].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
					case 'unit':
						ctx.drawImage(Img.P_unit[2],0,0,Img.P_unit[2].width,Img.P_unit[2].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
				}
				break;
			case 'P3':
				switch(entity.type){
					case 'cell':
						ctx.drawImage(Img.P[3],0,0,Img.P[3].width,Img.P[3].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
					case 'unit':
						ctx.drawImage(Img.P_unit[3],0,0,Img.P_unit[3].width,Img.P_unit[3].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
				}
				break;
			case 'P4':
				switch(entity.type){
					case 'cell':
						ctx.drawImage(Img.P[4],0,0,Img.P[4].width,Img.P[4].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
					case 'unit':
						ctx.drawImage(Img.P_unit[4],0,0,Img.P_unit[4].width,Img.P_unit[4].height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
						break;
				}
				break;
			case 'none':
				ctx.drawImage(Img.none,0,0,Img.none.width,Img.none.height,entity.x-entity.size,entity.y-entity.size,entity.size*2,entity.size*2);
				break;
		}

	if(entity.type == 'cell'){
		ctx.save();
		ctx.font = '16px Arial Black';
		ctx.fillStyle = 'grey';
		if(entity.units < 10)
			var center = 5;
		if(entity.units > 9 && entity.units < 100)
			var center = 10;
		if(entity.units > 99)
			var center = 15;
		ctx.fillText(entity.units,entity.x-center,entity.y+7);
		if(numberingCells == true){
			ctx.fillStyle = 'white';												//numbering cells
			ctx.fillText(entity.number,entity.x-10,entity.y+35);
		}
		ctx.restore();
	}

	if(entity.type == 'square'){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = entity.color;
		ctx.rect(entity.x,entity.y,entity.size,entity.size);
		ctx.fill();
		if(menu == 'chooseChapter'){
			ctx.fillStyle = 'black';
			ctx.font = '16px Arial Black';
			ctx.fillText(entity.number.toString(),entity.x+entity.size/100*46,entity.y+entity.size/100*57);
			if(wonMap[entity.number] == true){
				ctx.fillStyle = 'darkgreen';
				ctx.fillText('WON',entity.x+entity.size/100*30,entity.y+entity.size/100*80);
			}

		}
		ctx.restore();
	}

	if(entity.type == 'textRectangle'){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = entity.color;
		ctx.rect(entity.x,entity.y,entity.width,entity.height);
		ctx.fill();
		ctx.fillStyle = 'black';
		ctx.font = '16px Arial Black';
		ctx.fillText(entity.text,entity.x+20,entity.y+22);
		ctx.restore();
	}
}

distanceBetweenEntities = function(entity1,entity2){
	var vx = entity1.x-entity2.x;
	var vy = entity1.y-entity2.y;
	return Math.sqrt(vx*vx+vy*vy);
}

markCell = function(entity){
	ctx.save();
	ctx.beginPath();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 4;
	ctx.arc(entity.x,entity.y,entity.size+3,0,2*Math.PI,false);
	ctx.stroke();
	ctx.restore();
}

lineBetweenEntities = function(entity1,entity2){
	ctx.save();
	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.strokeStyle = 'white';
	ctx.moveTo(entity1.x,entity1.y);
	ctx.lineTo(entity2.x,entity2.y);
	ctx.stroke();
	ctx.restore();
}

botMove = function(entity){
	var counter = 0;
		
	var randomCellNumber = Math.floor(Math.random()*numberOfCells())+1;
	
	for(var key in cellList){
		counter++;
		if(counter == randomCellNumber){
			var randomity = Math.random();
			if(randomity < 0.7){
				if(entity.id == cellList[key].id || entity.ownedBy == cellList[key].ownedBy || entity.units/2 <= cellList[key].units){
					entity.frequency = 1;
				} else {
					for(var i = 0; i <= Math.floor(entity.units/2); i++)
						generateEntity('unit',entity.id,cellList[key].id);
					entity.units -= Math.floor(entity.units/2);
				}
			} else {
				if(entity.id == cellList[key].id || entity.ownedBy == cellList[key].ownedBy){
					entity.frequency = 1;
				} else {
					for(var i = 0; i <= Math.floor(entity.units/2); i++)
						generateEntity('unit',entity.id,cellList[key].id);
					entity.units -= Math.floor(entity.units/2);
				}
			}
		}
	}
}

numberOfCells = function(){
	var cellCount = 0;
	for(var key in cellList)
		cellCount++;
	return cellCount;
}

randomFrequency = function(entity){
	entity.frequency = Math.floor(Math.random()*350)+350;
}

deleteCurrentMap = function(){
	for(var key in cellList)
		delete cellList[key];
	for(var key in unitList)
		delete unitList[key];
}

deleteCurrentSquares = function(){
	for(var key in squareList)
		delete squareList[key];
}

goToMenu = function(where){
	menu = where;
	generateMenuEntities(where);
}

generateMap = function(mapNumber){
	deleteCurrentMap();
	cells = 0;
	switch(mapNumber){
		case 0:
			editMap = true;
			break;
		case 1:
			generateEntity('cell',250,400,75,'P1');
			generateEntity('cell',400,200,55,'none');
			generateEntity('cell',800,240,70,'none');
			generateEntity('cell',500,300,30,'none');
			generateEntity('cell',200,250,50,'none');
			generateEntity('cell',850,380,40,'none');
			generateEntity('cell',600,150,75,'P2');
			generateEntity('cell',450,80,30,'none');
			generateEntity('cell',600,420,75,'none');
			generateEntity('cell',230,90,75,'none');
			break;
		case 2:
			generateEntity('cell',480,270,100,'none');
			generateEntity('cell',480,110,30,'none');
			generateEntity('cell',480,430,30,'none');
			generateEntity('cell',640,270,30,'none');
			generateEntity('cell',320,270,30,'none');
			generateEntity('cell',595,155,30,'none');
			generateEntity('cell',365,155,30,'none');
			generateEntity('cell',365,385,30,'none');
			generateEntity('cell',595,385,30,'none');
			generateEntity('cell',100,100,70,'P1');
			generateEntity('cell',860,440,70,'P2');
			generateEntity('cell',100,440,70,'P3');
			generateEntity('cell',860,100,70,'P4');
			break;
		case 3:
			generateEntity('cell',181,393,70,'P1');
			generateEntity('cell',230,147,30,'none');
			generateEntity('cell',315,159,30,'none');
			generateEntity('cell',289,80,30,'none');
			generateEntity('cell',385,298,60,'none');
			generateEntity('cell',515,226,40,'none');
			generateEntity('cell',517,386,45,'none');
			generateEntity('cell',673,323,45,'none');
			generateEntity('cell',689,107,70,'P2');
			generateEntity('cell',461,109,45,'none');
			break;
		case 4:
			generateEntity('cell',451,434,70,'P1');
			generateEntity('cell',223,179,70,'P2');
			generateEntity('cell',633,159,70,'P3');
			generateEntity('cell',337,494,40,'none');
			generateEntity('cell',565,497,40,'none');
			generateEntity('cell',680,50,40,'none');
			generateEntity('cell',766,150,40,'none');
			generateEntity('cell',170,65,40,'none');
			generateEntity('cell',93,169,40,'none');
			generateEntity('cell',379,285,50,'none');
			generateEntity('cell',445,174,50,'none');
			generateEntity('cell',518,285,50,'none');
			break;
		case 5:
			editMap = true;
			break;
		case 6:
			editMap = true;
			break;
		case 7:
			editMap = true;
			break;
		case 8:
			editMap = true;
			break;
		case 9:
			editMap = true;
			break;
	}
}

generateMenuEntities = function(where){
	switch(where){
		case 'chooseChapter':
			var x = 45;

			deleteCurrentSquares();

			generateEntity('square',100+x,150,100,'white',1);
			generateEntity('square',250+x,150,100,'white',2);
			generateEntity('square',400+x,150,100,'white',3);
			generateEntity('square',550+x,150,100,'white',4);
			generateEntity('square',700+x,150,100,'white',5);
			generateEntity('square',100+x,300,100,'white',6);
			generateEntity('square',250+x,300,100,'white',7);
			generateEntity('square',400+x,300,100,'white',8);
			generateEntity('square',550+x,300,100,'white',9);
			break;
		case 'chooseColor':
			var x1 = 290;
			var x2 = 520;

			deleteCurrentSquares();

			generateEntity('square',x1,150,150,'white',1);
			generateEntity('square',x2,150,150,'white',2);
			generateEntity('square',x1,350,150,'white',3);
			generateEntity('square',x2,350,150,'white',4);

			generateEntity('square',x1+20,150+20,110,'darkblue');
			generateEntity('square',x2+20,150+20,110,'darkred');
			generateEntity('square',x1+20,350+20,110,'darkgreen');
			generateEntity('square',x2+20,350+20,110,'darkmagenta');
			break;
		case 'mainMenu':
			generateEntity('textRectangle',100,150,200,'white','PLAY');
			generateEntity('textRectangle',100,200,200,'white','COLOR');
			break;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.onmousemove = function(mouse){								//mouse and keyboard functions
	mousePosition.x = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left+1;
	mousePosition.y = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top+1;
}

document.onclick = function(mouse){
	leftClicked = true;
}

document.oncontextmenu = function(mouse){
	rightClicked = true;
	if(mousePosition.x <= WIDTH && mousePosition.y <= HEIGHT && mousePosition.x >= 0 && mousePosition.y >= 0)
		mouse.preventDefault();
}

document.onkeydown = function(event){
	if(event.keyCode == 27)
		keyboard.escape = true;
	else if(event.keyCode == 69)
		keyboard.E = true;
	else if(event.keyCode == 78)
		keyboard.N = true;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
update = function(){			//main function
	
	switch(menu){
		case 'game':

			youWon = true;
			youLost = true;

			var mouseIsInCell = false;
			var sendUnits = false;

			frameCount++;

			clearScreen();
			
			if(rightClicked == true)													//right click
				for(var key in cellList){
					if(distanceBetweenEntities(cellList[key],mousePosition) <= cellList[key].size)
						if(cellList[key].ownedBy == 'P1'){
							cellList[key].marked = true;
							gonnaChangeClickCount = clickCount+1;
							fromId[gonnaChangeClickCount] = key;
							mouseIsInCell = true;
						}
					if(distanceBetweenEntities(cellList[key],mousePosition) > cellList[key].size)
						cellList[key].marked = false;
				}

			if(clickCount > 0)															//left click
				for(var i = 1; i <= clickCount; i++){
					if(cellList[fromId[i]].ownedBy != 'P1'){
						for(var j = i; j < clickCount; j++)
							fromId[j] = fromId[j+1];
						gonnaChangeClickCount = clickCount-1;
					}
					markCell(cellList[fromId[i]]);
					for(var key in cellList){
						if(distanceBetweenEntities(cellList[key],mousePosition) <= cellList[key].size){
							mouseIsInCell = true;
							lineBetweenEntities(cellList[fromId[i]],cellList[key]);
							if(leftClicked == true){
								toId = key;
								gonnaChangeClickCount = 0;
								cellList[fromId[i]].marked = false;
								sendUnits = true;
							}
						}
						if(mouseIsInCell == false)
							if(leftClicked == true){
								gonnaChangeClickCount = 0;
								cellList[fromId[i]].marked = false;
							}
					}
					if(mouseIsInCell == false)
						lineBetweenEntities(cellList[fromId[i]],mousePosition);
				}

			for(var key in cellList){
				updateEntity(cellList[key]);											//reproduction
				if(distanceBetweenEntities(cellList[key],mousePosition) <= cellList[key].size)
					markCell(cellList[key]);
				if(cellList[key].ownedBy != 'none')
					if(frameCount % cellList[key].reproduction == 0){
						cellList[key].units += 1;
						if(cellList[key].units > cellList[key].limit)
							cellList[key].units = cellList[key].limit;
					}
				
				if(cellList[key].ownedBy != 'none' && cellList[key].ownedBy != 'P1'){	//bot
					if(cellList[key].frequency == 0)
						randomFrequency(cellList[key]);
					if(frameCount % cellList[key].frequency == 0){
						randomFrequency(cellList[key]);
						botMove(cellList[key]);
					}
				}

				if(editMap == false){
					if(cellList[key].ownedBy == 'P1')										//win or lose
						youLost = false;
					if(cellList[key].ownedBy != 'P1' && cellList[key].ownedBy != 'none')
						youWon = false;
				}
			}

			for(var key in unitList){
				updateEntity(unitList[key]);
				if(distanceBetweenEntities(unitList[key],cellList[unitList[key].movingToId]) <= cellList[unitList[key].movingToId].size + unitList[key].size){
					if(unitList[key].ownedBy == cellList[unitList[key].movingToId].ownedBy)
						cellList[unitList[key].movingToId].units++;
					else
						cellList[unitList[key].movingToId].units--;

					if(cellList[unitList[key].movingToId].units < 0){
						cellList[unitList[key].movingToId].units = 0;
						cellList[unitList[key].movingToId].ownedBy = unitList[key].ownedBy;
					}
					delete unitList[key];
				}
			}

			if(sendUnits == true){
				for(var i = 1; i <= clickCount; i++){
					for(var j = 0; j <= Math.floor(cellList[fromId[i]].units/2); j++)
						generateEntity('unit',fromId[i],toId);
					cellList[fromId[i]].units -= Math.floor(cellList[fromId[i]].units/2);
					fromId[i] = undefined;
				}
				sendUnits = false;
			}

			if(leftClicked == true && editMap == true){												//positioning cells
				generateEntity('cell',mousePosition.x,mousePosition.y,20,'none');
				cells++;
				console.log("generateEntity('cell'," + mousePosition.x + "," + mousePosition.y + ",20,'none');");
			}

			if(keyboard.escape == true){
				playedMapNumber = undefined;
				menu = 'chooseChapter';
				keyboard.escape = false;
			} else if(keyboard.N == true){
				numberingCells = !numberingCells;
				keyboard.N = false;
			}

			if(youWon == true){
				endGame = 'WON';
				wonMap[playedMapNumber] = true;
			}
			if(youLost == true){
				endGame = 'LOST';
			}

			if(endGame != undefined)
				if(endGame == 'LOST')
					ctx.drawImage(Img.lost,0,0,Img.lost.width,Img.lost.height,WIDTH/100*18,HEIGHT/100*36,Img.lost.width,Img.lost.height);
				else if(endGame == 'WON')
					ctx.drawImage(Img.won,0,0,Img.won.width,Img.won.height,WIDTH/100*20,HEIGHT/100*36,Img.won.width,Img.won.height);

			if(gonnaChangeClickCount != undefined)
				clickCount = gonnaChangeClickCount;
			gonnaChangeClickCount = undefined;
			break;
		case 'chooseChapter':

			clearScreen();

			editMap = false;

			ctx.save();
			ctx.font = '32px Arial Black';
			ctx.fillStyle = 'white';
			ctx.fillText('CHOOSE CHAPTER',WIDTH/100*34,75);
			ctx.restore();

			for(var key in squareList){
				drawEntity(squareList[key]);
				if( mousePosition.x >= squareList[key].x &&
					mousePosition.x <= squareList[key].x+squareList[key].size &&
					mousePosition.y >= squareList[key].y &&
					mousePosition.y <= squareList[key].y+squareList[key].size){
					squareList[key].color = 'lightslategrey';
					if(leftClicked){
						playedMapNumber = squareList[key].number;
						generateMap(playedMapNumber);
						menu = 'game';
						endGame = undefined;
					}
				} else
					squareList[key].color = 'white';
			}

			if(keyboard.E == true){
				generateMap(0);
				menu = 'game';
				keyboard.E = false;
			} else if(keyboard.escape == true){
				goToMenu('mainMenu');
				keyboard.escape = false;
			}
			break;
		case 'chooseColor':

			clearScreen();

			ctx.save();
			ctx.font = '32px Arial Black';
			ctx.fillStyle = 'white';
			ctx.fillText('CHOOSE COLOR',WIDTH/100*35,75);
			ctx.restore();

			for(var key in squareList){
				if(squareList[key].color == 'white' || squareList[key].color == 'lightslategrey')
					if( mousePosition.x >= squareList[key].x &&
						mousePosition.x <= squareList[key].x+squareList[key].size &&
						mousePosition.y >= squareList[key].y &&
						mousePosition.y <= squareList[key].y+squareList[key].size){
						squareList[key].color = 'lightslategrey';
						if(leftClicked){
							leftClicked = false;
							switch(squareList[key].number){
								case 1:
									var playerColor = 'blue';
									break;
								case 2:
									var playerColor = 'red';
									break;
								case 3:
									var playerColor = 'green';
									break;
								case 4:
									var playerColor = 'violet';
									break;
							}

							Img.help.src = 'images/' + playerColor + '.png';

							for(var i = 2; i <= 4; i++){
								if(Img.P[i].src == Img.help.src){
									Img.P[i].src = Img.P[1].src;
									Img.P[1].src = 'images/' + playerColor + '.png';
									Img.P_unit[i].src = Img.P_unit[1].src;
									Img.P_unit[1].src = 'images/' + playerColor + '_unit.png';
								}
							}

							goToMenu('mainMenu');
						}
					} else
						squareList[key].color = 'white';
				drawEntity(squareList[key]);
			}

			if(keyboard.escape == true){
				goToMenu('mainMenu');
				keyboard.escape = false;
			}
			break;
		case 'logoScreen':
			clearScreen();
			ctx.drawImage(Img.logo,0,0,Img.logo.width,Img.logo.height,WIDTH/100*25,HEIGHT/100*30,Img.logo.width,Img.logo.height);
			if(leftClicked == true)
				goToMenu('mainMenu');
			break;
		case 'mainMenu':
			clearScreen();

			ctx.save();
			ctx.font = '32px Arial Black';
			ctx.fillStyle = 'white';
			ctx.fillText('MAIN MENU',WIDTH/100*40,75);
			ctx.restore();

			for(var key in textRectangleList){
				drawEntity(textRectangleList[key]);
				if(mousePosition.x > textRectangleList[key].x && mousePosition.x < textRectangleList[key].x+textRectangleList[key].width &&
				   mousePosition.y > textRectangleList[key].y && mousePosition.y < textRectangleList[key].y+textRectangleList[key].height){
					textRectangleList[key].color = 'lightslategrey';
					if(leftClicked == true){
						leftClicked = false;
						if(textRectangleList[key].text == 'COLOR')
							goToMenu('chooseColor');
						else if(textRectangleList[key].text == 'PLAY')
							goToMenu('chooseChapter');
					}
				} else
					textRectangleList[key].color = 'white';
			}
			break;
	}
	
	leftClicked = false;
	rightClicked = false;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

goToMenu('logoScreen');

setInterval(update,20);