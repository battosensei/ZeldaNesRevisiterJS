let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
document.addEventListener("keydown",keyDownHandler, false);
document.addEventListener("keyup",keyUpHandler,false);
document.body.style.zoom = "288%";
///potential ugly fix for firefox users....
//let nativeResWidth = 256;
//let nativeResHeight = 240;
//let scaleWidth = 3;
//let scaleHeight = 3;
//ctx.canvas.width  = scaleWidth * nativeResWidth;
//ctx.canvas.height = scaleHeight * nativeResHeight;
//ctx.scale(scaleWidth,scaleHeight);


let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let hasGameStarted = false;
let worldTiles = new Image();
worldTiles.src = "tiles-overworld.png";
let link1 = new Image();
link1.src = "link.png";
let enemies = new Image();
enemies.src = "enemies.png";
let chars1 = new Image();
chars1.src = "chars.png";
let chars2 = new Image();
chars2.src = "chars2.png";
let hud = new Image();
hud.src = "pausescreen.png";
let backgroundMusic = new Audio();
backgroundMusic.src = "./sounds/overworld_edit.mp3";
backgroundMusic.loop = true;
let fps = 60;
let animationCounter = 0;
let currentAnimation = 0;
let animationSpeed = 10;
let lastButtonPressed = "up";
let linkY = 135;
let linkX = 116;
let linkHearts = 14;
let linkNeedsToBounce = false;
let currentLinkHearts = 14;
let blocks = [];
let gameObjects = [];
let gameMap = [];
//let maps = [];
let isAttacking = false;
let canAttackAgain = true;
let pathFound = [];
let hasRun = false;

let rupeeAmount = 0;
let linkBounceY = -1;
let linkBounceX = -1;
let linkIsInvincible = false;
let invincibleTime = 0;
let lastPickUpItem = 0;
let playPickUpItemAnimation = false;
let swordEquipped = 0;
let hasSword = false;
/// 0 -no sword, 1 - brown, .....
let inventoryItems = [null, null, null, null, null, null, null, null, null, null, null, null, null];
let bombNum = 2;
let keyNum = 5;
let cursorX = 127;
let cursorY = -152;
let BPressed = false;

let currentEquippedItem = -1;

gameObjects = maps[119].gameobjects;
gameMap = maps[119].map;


let currentMap = 119;
let lastMap = 119;
addMapGameObjects(gameMap, gameObjects);
let returnToGame = false;
let needInventoryScreen = false;
let inventoryOffset = 0;

function playSound(source)
{
	let sound = new Audio();
	sound.src = source;
	sound.play();
}

function keyDownHandler(e){
	if(e.keyCode == 66)
    {
	   BPressed = true;
	}
    if(e.keyCode == 37)
    {
	   leftPressed = true;
	   lastButtonPressed = "left";
	}
	else if(e.keyCode == 39)
	{
	   rightPressed = true;
	   lastButtonPressed = "right";
	}
	else if(e.keyCode == 38)
	{
	   upPressed = true;
	   lastButtonPressed = "up";
	}
	else if(e.keyCode == 40)
	{
	   downPressed = true;
	   lastButtonPressed = "down";
	}
	
	if(e.keyCode == 32 && canAttackAgain){
            isAttacking = true;
			currentAnimation = 0;
			canAttackAgain = false;
			playSound("./sounds/LOZ_sword_slash.wav")
        }
	if(e.keyCode == 13 && !hasGameStarted)
	{
		hasGameStarted = true;
		backgroundMusic.play();
	}
	if(e.keyCode == 13 && hasGameStarted)
	{
		if(!needInventoryScreen)
		{
			needInventoryScreen = true;
		}
		else
		{
			canAttackAgain = true;
		}
		returnToGame = !returnToGame;
	}
}

function keyUpHandler(e){
    if(e.keyCode == 37)
	{
	   leftPressed = false;
	}
	else if(e.keyCode == 39)
	{
	   rightPressed = false;
	}
	else if(e.keyCode == 38)
	{
	   upPressed = false;
	}
	else if(e.keyCode == 40)
	{
	   downPressed = false;
	}
	
	if(e.keyCode == 32){
            //isAttacking = false;
        }
}

function drawMap(level)
{
	for(let i = 0; i < level.length; i++)
	{
		for(let j = 0; j < level[i].length; j++)
		{
			ctx.drawImage(worldTiles, ((level[i][j]%18) * 17) + 1,
			(Math.floor(level[i][j]/18) * 17) + 1, 
			16, 16, j *16, i *16, 16, 16);
		}
	}
}

function drawLink()
{

	let speed = 2;
	animationCounter++;
	if(linkNeedsToBounce)
	{
		if(linkX != linkBounceX)
		{
			if(linkBounceX > linkX)
			{
				linkX += 2;
			}
			else if(linkBounceX < linkX)
			{
				linkX -= 2;
			}
		}
		else if(linkY != linkBounceY)
		{
			if(linkBounceY > linkY)
			{
				linkY += 2;
			}
			else if(linkBounceY < linkY)
			{
				linkY -= 2;
			}
		}
		else
		{
			linkNeedsToBounce = false;
			if(currentLinkHearts <= 0)
			{
				
			}
		}
		
		if(lastButtonPressed == "down")
		{
			ctx.drawImage(link1, 0, 60, 
			16, 16, linkX, linkY, 16, 16);
		}
		if(lastButtonPressed == "up")
		{
			ctx.drawImage(link1, 62, 60, 
			16, 16, linkX, linkY, 16, 16);
		}
		if(lastButtonPressed == "left")
		{
			ctx.drawImage(link1, 30, 60, 
			16, 16, linkX, linkY, 16, 16);
		}
		if(lastButtonPressed == "right")
		{
			ctx.drawImage(link1, 91, 60, 
			16, 16, linkX, linkY, 16, 16);
		}
		
	}
	else if(playPickUpItemAnimation)
	{
		animationCounter++;
		if(animationCounter < 300)
		{
			ctx.drawImage(link1, 1, 150, 
			16, 16, linkX, linkY, 16, 16);	
		}
		else
		{
			playPickUpItemAnimation = false;
		}

		switch(lastPickUpItem)
		{
			case 0:

				break;
			case 1:

				break;
			case 2:

				break;
			case 3:
				ctx.drawImage(link1, 393, 195, 8, 16, 
						linkX - 2, linkY - 14, 8, 16);
				break;
			case 4:

				break;
			case 5:

				break;	
			case 6:

				break;
			case 7:

				break;
			case 8:

				break;
			case 9:

				break;
			case 10:

				break;
			case 11:

				break;
			case 12:

				break;
			case 13:

				break;
			case 14:
				ctx.drawImage(hud, 555, 137, 8, 16, 
						linkX - 2, linkY - 14, 8, 16);
				break;
			case 15:
				ctx.drawImage(link1, 334, 197, 12, 12, 
					linkX - 2, linkY - 14, 12, 12);
				break;
			case 16:
				ctx.drawImage(link1, 364, 255, 8, 16, 
					linkX - 2, linkY - 14, 8, 16);
				break;
		}
	}
	else
	{
		if(BPressed && currentEquippedItem == 3)
		{
			animationCounter++;
			if(animationCounter > 10)
			{
				BPressed = false;
				gO = new GameObject();
				gO.x = linkX;
				gO.y = linkY;
				gO.flame = true;
				gO.direction = lastButtonPressed;
				gameObjects.push(gO);
			}
			if(lastButtonPressed == "down")
			{
				ctx.drawImage(link1, 0, 60, 
				16, 16, linkX, linkY, 16, 16);
			}
			if(lastButtonPressed == "up")
			{
				ctx.drawImage(link1, 62, 60, 
				16, 16, linkX, linkY, 16, 16);
			}
			if(lastButtonPressed == "left")
			{
				ctx.drawImage(link1, 30, 60, 
				16, 16, linkX, linkY, 16, 16);
			}
			if(lastButtonPressed == "right")
			{
				ctx.drawImage(link1, 91, 60, 
				16, 16, linkX, linkY, 16, 16);
			}
		}
	else if(isAttacking && hasSword)
	{
		if(currentAnimation == 0)
			{
				if(lastButtonPressed == "down")
				{
					ctx.drawImage(link1, 0, 60, 
					16, 16, linkX, linkY, 16, 16);
				}
				if(lastButtonPressed == "up")
				{
					ctx.drawImage(link1, 62, 60, 
					16, 16, linkX, linkY, 16, 16);
				}
				if(lastButtonPressed == "left")
				{
					ctx.drawImage(link1, 30, 60, 
					16, 16, linkX, linkY, 16, 16);
				}
				if(lastButtonPressed == "right")
				{
					ctx.drawImage(link1, 91, 60, 
					16, 16, linkX, linkY, 16, 16);
				}
			}
			else if(currentAnimation == 1)
			{
				if(lastButtonPressed == "down")
				{
					ctx.drawImage(link1, 0, 84, 
					16, 27, linkX, linkY, 16, 27);
					gameObjectCollision(linkX + 7, linkY + 16, gameObjects, 
							false, true, false, 
							false, false, "down");
				}
				if(lastButtonPressed == "up")
				{
					ctx.drawImage(link1, 62, 84, 
					16, 26, linkX, linkY-14, 16, 26);
					gameObjectCollision(linkX + 5, linkY-14, gameObjects, 
							false, true, false, 
							false, false, "up");
				}
				if(lastButtonPressed == "left")
				{
					ctx.drawImage(link1, 22, 84, 
					26, 27, linkX - 10, linkY - 8, 27, 27);
					gameObjectCollision(linkX - 10, linkY -1,  gameObjects, 
							false, true, false, 
							false, false, "left");
				}
				if(lastButtonPressed == "right")
				{
					ctx.drawImage(link1, 84, 84, 
					30, 26, linkX, linkY - 8, 26, 26);
					gameObjectCollision(linkX+ 16, linkY -1, gameObjects, 
							false, true, false, 
							false, false, "right");
				};
			}
			if(animationCounter >= 6)
			{
				currentAnimation++;
				animationCounter = 0;
				if(currentAnimation > 1)
				{
					currentAnimation = 0;
					isAttacking = false;
					canAttackAgain = true;
					
				}
			}
	}
	else if(leftPressed && !collision2(linkX - speed, linkY, gameMap))
	{
			linkX -= speed;
			if(currentAnimation == 0)
			{
				ctx.drawImage(link1, 30, 0, 16, 16, linkX, linkY, 16, 16);
			}
			else if(currentAnimation == 1)
			{
				ctx.drawImage(link1, 30, 30, 16, 16,linkX, linkY, 16, 16);
			}
			if(animationCounter >= 6)
			{
				currentAnimation++;
				animationCounter = 0;
				if(currentAnimation > 1)
				{
					currentAnimation = 0;
				}
			}
	}
	else if(rightPressed && !collision2(linkX + speed, linkY, gameMap))
	{
		linkX += speed;
		if(currentAnimation == 0)
			{
				ctx.drawImage(link1, 91, 0, 16, 16, linkX, linkY, 16, 16);
			}
			else if(currentAnimation == 1)
			{
				ctx.drawImage(link1, 91, 30, 16, 16,linkX, linkY, 16, 16);
			}
			if(animationCounter >= 6)
			{
				currentAnimation++;
				animationCounter = 0;
				if(currentAnimation > 1)
				{
					currentAnimation = 0;
				}
			}
	}
	else if(upPressed && !collision2(linkX, linkY - speed, gameMap))
	{
		linkY -= speed;
		if(currentAnimation == 0)
			{
				ctx.drawImage(link1, 62, 0, 16, 16, linkX, linkY, 16, 16);
			}
			else if(currentAnimation == 1)
			{
				ctx.drawImage(link1, 62, 30, 16, 16,linkX, linkY, 16, 16);
			}
			if(animationCounter >= 6)
			{
				currentAnimation++;
				animationCounter = 0;
				if(currentAnimation > 1)
				{
					currentAnimation = 0;
				}
			}
	}
	else if(downPressed && !collision2(linkX, linkY + speed, gameMap))
	{
		linkY += speed;
		if(currentAnimation == 0)
			{
				ctx.drawImage(link1, 0, 0, 16, 16, linkX, linkY, 16, 16);
			}
			else if(currentAnimation == 1)
			{
				ctx.drawImage(link1, 0, 30, 16, 16,linkX, linkY, 16, 16);
			}
			if(animationCounter >= 6)
			{
				currentAnimation++;
				animationCounter = 0;
				if(currentAnimation > 1)
				{
					currentAnimation = 0;
				}
			}
	}
	
	else
	{
		if(lastButtonPressed == "down")
		{
			ctx.drawImage(link1, 0, 0, 
			16, 16, linkX, linkY, 16, 16);
		}
		if(lastButtonPressed == "up")
		{
			ctx.drawImage(link1, 62, 0, 
			16, 16, linkX, linkY, 16, 16);
		}
		if(lastButtonPressed == "left")
		{
			ctx.drawImage(link1, 30, 0, 
			16, 16, linkX, linkY, 16, 16);
		}
		if(lastButtonPressed == "right")
		{
			ctx.drawImage(link1, 91, 0, 
			16, 16, linkX, linkY, 16, 16);
		}
	}
	}
}

class Point {
    constructor(x, y) {
        this.row = x;
        this.col = y;
    }
}

function collision2(x, y, map)
{
	
	blocks = [];
	
	for(let i = 0; i < map.length; i++)
	{
		for(let j = 0; j < map[i].length; j++)
			{
				if(map[i][j] != 2 && map[i][j] != 28 &&
				map[i][j] != 18
				&& map[i][j] != 6
				&& map[i][j] != 12
				&& map[i][j] != 14
				&& map[i][j] != 24
				&& map[i][j] != 30
				&& map[i][j] != 34
				&& map[i][j] != 58
				&& map[i][j] != 64
				&& map[i][j] != 70
				&& map[i][j] != 75
				&& map[i][j] != 76
				&& map[i][j] != 77
				&& map[i][j] != 93
				&& map[i][j] != 94
				&& map[i][j] != 95
				&& map[i][j] != 111
				&& map[i][j] != 112
				&& map[i][j] != 113
				&& map[i][j] != 81
				&& map[i][j] != 82
				&& map[i][j] != 83
				&& map[i][j] != 99
				&& map[i][j] != 100
				&& map[i][j] != 101
				&& map[i][j] != 117
				&& map[i][j] != 118
				&& map[i][j] != 119
				&& map[i][j] != 87
				&& map[i][j] != 88
				&& map[i][j] != 89
				&& map[i][j] != 105
				&& map[i][j] != 106
				&& map[i][j] != 107
				&& map[i][j] != 123
				&& map[i][j] != 124
				&& map[i][j] != 125
				&& map[i][j] != 126
				&& map[i][j] != 127
				&& map[i][j] != 128
				&& map[i][j] != 129
				&& map[i][j] != 131
				&& map[i][j] != 132
				&& map[i][j] != 133
				&& map[i][j] != 134
				&& map[i][j] != 135
				&& map[i][j] != 137
				&& map[i][j] != 138
				&& map[i][j] != 139
				&& map[i][j] != 140
				&& map[i][j] != 141
				&& map[i][j] != 143
				)
				{
					blocks.push(new Point(i, j));
				}
			}
	}

	for(let i = 0; i < blocks.length; i++)
		{
			if (x +4<= blocks[i].col*16 + 16 &&
			   x + 12 >= blocks[i].col*16 &&
			   y + 10 <= blocks[i].row*16 + 16 &&
			   y + 16 >= blocks[i].row*16 ) {
					return true;
				}
		}
	return false;	
}

function drawGameObjects()
{
	for(let i = 0; i < gameObjects.length; i++)
	{
		if(gameObjects[i].isSaleRupee)
		{
			gameObjects[i].counter+=1;
			if(gameObjects[i].counter%5==0)
			{
				gameObjects[i].rupeeImage+=1;
			}
			if(gameObjects[i].rupeeImage > 1)
			{
				gameObjects[i].rupeeImage = 0;
			}
			if(gameObjects[i].rupeeImage == 0)
			{
				ctx.drawImage(link1, 244, 225, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8,16);
			}
			else
			{
				ctx.drawImage(link1, 274, 225, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8, 16);
			}
			ctx.drawImage(hud, 519, 117, 8, 8, 
				gameObjects[i].x + 12, gameObjects[i].y + 6, 8, 8);
			
		}
		if(gameObjects[i].isPickUpItem)
		{
			//0 - boomerang
			//1 - bomb
			//2 - bow and arrow
			//3 - candle
			//4 - flute
			//5 - meat
			//6 - potion(red or blue)
			//7 - magic rod
			//8 - raft
			//9 - book of magic
			//10 - ring
			//11 - ladder
			//12 - key magical
			//13 - bracelet
			//14 - wood sword
			//15 - large shield
			//16 - nonmagical key
			switch(gameObjects[i].pickUpItemNum)
			{
				case 0:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 1:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 2:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 3:
					ctx.drawImage(link1, 393, 195, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8, 16);
					if(gameObjects[i].isSaleItem)
					{
						ctx.fillText(gameObjects[i].line1Full, gameObjects[i].x - 8, gameObjects[i].y + 32);
					}
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					playPickUpItemAnimation = true;
					lastPickUpItem = gameObjects[i].pickUpItemNum;
					gameObjects.splice(i, 1);
					break;
				case 4:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 5:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;	
				case 6:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 7:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 8:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 9:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 10:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 11:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 12:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 13:
					gO = new GameObject();
					gO.pickUpItemNum = gameObjects[i].pickUpItemNum;
					inventoryItems[gameObjects[i].pickUpItemNum] = gO;
					break;
				case 14:
					ctx.drawImage(hud, 555, 137, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8, 16);
					break;
				case 15:
					ctx.drawImage(link1, 334, 197, 12, 12, 
						gameObjects[i].x, gameObjects[i].y, 12, 12);
					if(gameObjects[i].isSaleItem)
					{
						ctx.fillText(gameObjects[i].line1Full, gameObjects[i].x - 8, gameObjects[i].y + 32);
					}
					break;
				case 16:
					ctx.drawImage(link1, 364, 255, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8, 16);
					if(gameObjects[i].isSaleItem)
					{
						ctx.fillText(gameObjects[i].line1Full, gameObjects[i].x - 8, gameObjects[i].y + 32);
					}
					
					break;
			}
		}
		if(gameObjects[i].isText)
		{
			gameObjects[i].counter+=1;
			if(gameObjects[i].counter%5==0)
			{
				if(gameObjects[i].line1Full.length != gameObjects[i].line1Current.length)
				{
					gameObjects[i].line1Current = gameObjects[i].line1Full.substring(0, 
					gameObjects[i].line1Current.length + 1);
					playSound("./sounds/LOZ_text_slow.wav");
				}
				else if(gameObjects[i].line2Full.length != gameObjects[i].line2Current.length)
				{
					gameObjects[i].line2Current = gameObjects[i].line2Full.substring(0, 
					gameObjects[i].line2Current.length + 1);
					playSound("./sounds/LOZ_text_slow.wav");
				}
			}
			ctx.fillStyle = "white";
			ctx.font = "12px Arial";
			ctx.fillText(gameObjects[i].line1Current, 
			gameObjects[i].line1X, gameObjects[i].line1Y);
			ctx.fillText(gameObjects[i].line2Current, 
			gameObjects[i].line2X, gameObjects[i].line2Y);
		}
		if(gameObjects[i].flame)
		{
			gameObjects[i].counter+=1;
			if(gameObjects[i].counter < 8)
			{
				if(gameObjects[i].direction == "up")
				{
					gameObjects[i].y -= 2;
				}
				if(gameObjects[i].direction == "down")
				{
					gameObjects[i].y += 2;
				}
				if(gameObjects[i].direction == "left")
				{
					gameObjects[i].x -= 2;
				}
				if(gameObjects[i].direction == "right")
				{
					gameObjects[i].x += 2;
				}
			}
			else if(gameObjects[i].counter <  16)
			{
				gameObjectCollision(gameObjects[i].x, gameObjects[i].y, gameObjects, 
							false, false, false, 
							true, false, gameObjects[i].direction);
			}
			else
			{
				gameObjects.splice(i, 1);
				continue;
			}
			if(gameObjects[i].counter%5==0)
			{
				gameObjects[i].rupeeImage+=1;
			}
			if(gameObjects[i].rupeeImage > 1)
			{
				gameObjects[i].rupeeImage = 0;
			}
			if(gameObjects[i].rupeeImage == 0)
			{
				ctx.drawImage(chars2, 158, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
			}
			else
			{
				ctx.drawImage(chars1, 52, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
			}
		}
		if(gameObjects[i].isFlame)
		{
			gameObjects[i].counter+=1;
			if(gameObjects[i].counter%5==0)
			{
				gameObjects[i].rupeeImage+=1;
			}
			if(gameObjects[i].rupeeImage > 1)
			{
				gameObjects[i].rupeeImage = 0;
			}
			if(gameObjects[i].rupeeImage == 0)
			{
				ctx.drawImage(chars2, 158, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
			}
			else
			{
				ctx.drawImage(chars1, 52, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
			}
		}
		if(gameObjects[i].isOldMan)
		{
			ctx.drawImage(chars1, 1, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
		}
		if(gameObjects[i].isOldWoman)
		{
			ctx.drawImage(chars1, 35, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
		}
		if(gameObjects[i].isMerchant)
		{
			ctx.drawImage(chars1, 109, 11, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
		}
		if(gameObjects[i].isRupee)
		{
			gameObjects[i].counter+=1;
			if(gameObjects[i].counter%5==0)
			{
				gameObjects[i].rupeeImage+=1;
			}
			if(gameObjects[i].rupeeImage > 1)
			{
				gameObjects[i].rupeeImage = 0;
			}
			if(gameObjects[i].rupeeImage == 0)
			{
				ctx.drawImage(link1, 244, 225, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8, 16);
			}
			else
			{
				ctx.drawImage(link1, 274, 225, 8, 16, 
						gameObjects[i].x, gameObjects[i].y, 8, 16);
			}
		}
		if(gameObjects[i].isEnemy)
		{
			
			if(gameObjects[i].enemyType == 1 || gameObjects[i].enemyType == 3)
			{
				gameObjects[i].counter++;
				
				
				
				if(gameObjects[i].enemyPath == null || 
				gameObjects[i].enemyPath.length == 0 )
				{
					let currRow = Math.floor(gameObjects[i].y/16);
					let currCol = Math.floor(gameObjects[i].x/16);
					getNewCoordinates(currRow, currCol, i);
				}
			
				if(gameObjects[i].needsToShoot)
				{
					gameObjects[i].shootCounter++;
					if(gameObjects[i].shootCounter == 100)
					{
						gO = new GameObject();
						
						gO.x = gameObjects[i].x;
						gO.y = gameObjects[i].y;
						if(gameObjects[i].direction == "down")
						{
							gO.ySpeed = 2;
						}
						if(gameObjects[i].direction == "up")
						{
							gO.ySpeed = -2;
						}
						if(gameObjects[i].direction == "right")
						{
							gO.xSpeed = 2;
						}
						if(gameObjects[i].direction == "left")
						{
							gO.xSpeed = -2;
						}
						gO.waterProjectile = false;
						gO.isPortal = false;
						gO.isRupee = false;
						gO.rockProjectile = true;
						gameObjects.push(gO);
						
					}
					if(gameObjects[i].shootCounter > 130)
					{
						gameObjects[i].needsToShoot = false;
						gameObjects[i].shootCounter = 0;
					}
					
				}
				else
				{
					if(gameObjects[i].enemyPath[gameObjects[i].enemyPath.length - 1] != null && 
					gameObjects[i].nextX == gameObjects[i].x && 
					gameObjects[i].nextY == gameObjects[i].y)
					{
						//console.log("end of current node");
						gameObjects[i].nextX = gameObjects[i].enemyPath[gameObjects[i].enemyPath.length - 1].c * 16;
						gameObjects[i].nextY = gameObjects[i].enemyPath[gameObjects[i].enemyPath.length - 1].r * 16;
						gameObjects[i].enemyPath.splice(gameObjects[i].enemyPath.length - 1,1);
						if(i == 1)
						{
							//console.log("This enemy now as a path of: ");
							for(let j = 0; j < gameObjects[i].enemyPath.length; j++)
							{
								//console.log("Path at " + j + " is :  " + gameObjects[i].enemyPath[j].r + "    and    "  + gameObjects[i].enemyPath[j].c);
							}
						}
						let chance = Math.floor(Math.random() * 60);
						if(chance == 0)
						{
							gameObjects[i].needsToShoot = true;
						}
					}
				}
				if(gameObjects[i].counter >= 10)
				{
					gameObjects[i].frame++;
					gameObjects[i].counter = 0;
					if(gameObjects[i].frame > 1)
					{
						gameObjects[i].frame = 0;
					}
				}
				if(gameObjects[i].enemyType == 1)
				{
					if(gameObjects[i].direction == "down")
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 0, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 0, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
					else if(gameObjects[i].direction == "up")
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 60, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 60, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
					else if(gameObjects[i].direction == "left")
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 30, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 30, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
					else
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 90, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 90, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
				}
				if(gameObjects[i].enemyType == 3)
				{
					if(gameObjects[i].direction == "down")
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 120, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 120, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
					else if(gameObjects[i].direction == "up")
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies,180, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 180, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
					else if(gameObjects[i].direction == "left")
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 150, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 150, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
					else
					{
						if(gameObjects[i].frame == 0)
						{
							ctx.drawImage(enemies, 210, 0, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
						if(gameObjects[i].frame == 1)
						{
							ctx.drawImage(enemies, 210, 30, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 16, 16);
						}
					}
				}
				
				if(gameObjects[i].needsBounce)
				{
					if(gameObjects[i].x != gameObjects[i].bounceX)
					{
						if(gameObjects[i].bounceX > gameObjects[i].x)
						{
							gameObjects[i].x += 4;
						}
						else if(gameObjects[i].bounceX < gameObjects[i].x)
						{
							gameObjects[i].x -= 4;
						}
					}
					else if(gameObjects[i].y != gameObjects[i].bounceY)
					{
						if(gameObjects[i].bounceY > gameObjects[i].y)
						{
							gameObjects[i].y += 4;
						}
						else if(gameObjects[i].bounceY < gameObjects[i].y)
						{
							gameObjects[i].y -= 4;
						}
					}
					else
					{
						gameObjects[i].needsBounce = false;
						if(gameObjects[i].health <= 0)
						{
							////console.log("its health is: " + gameObjects[i].health);
							
							let rupeeChance = Math.floor(Math.random()*10);
							if(rupeeChance < 2)
							{
								gO = new GameObject()
								gO.x = gameObjects[i].x + 4;
								gO.y = gameObjects[i].y;
								gO.width = 8;
								gO.height = 16;
								gO.isRupee = true;
								gO.rupeeValue = 1;
								gameObjects.push(gO);
							}
							gameObjects.splice(i,1);
						}
					}
				}
				else if(gameObjects[i].enemyPath.length != 0)
				{
					if(gameObjects[i].x != gameObjects[i].nextX)
					{
						if(gameObjects[i].nextX > gameObjects[i].x)
						{
							if(gameObjects[i].counter% gameObjects[i].speed == 0)
							{
								gameObjects[i].x += 2;
							}
							gameObjects[i].direction = "right";
						}
						else if(gameObjects[i].nextX < gameObjects[i].x)
						{
							if(gameObjects[i].counter% gameObjects[i].speed == 0)
							{
								gameObjects[i].x -= 2;
							}
							gameObjects[i].direction = "left";
						}
						
					}
					else if(gameObjects[i].y != gameObjects[i].nextY)
					{
						if(gameObjects[i].nextY > gameObjects[i].y)
						{
							if(gameObjects[i].counter% gameObjects[i].speed == 0)
							{
								gameObjects[i].y += 2;
							}
							gameObjects[i].direction = "down";
						}
						else if(gameObjects[i].nextY < gameObjects[i].y)
						{
							if(gameObjects[i].counter% gameObjects[i].speed == 0)
							{
								gameObjects[i].y -= 2;
							}
							gameObjects[i].direction = "up";
						}
					}
					else if(gameObjects[i].enemyPath.length == 1)
					{
						gameObjects[i].enemyPath = [];
						gameObjects[i].x = gameObjects[i].nextX;
						gameObjects[i].y = gameObjects[i].nextY;
					}
				}
			}
			if(gameObjects[i].enemyType == 2)
			{
				gameObjects[i].counter++;
				if(gameObjects[i].counter < 240)
				{
					ctx.drawImage(enemies, 180, 300, 16, 16, 
						gameObjects[i].x, gameObjects[i].y, 16, 16);
				}
				else if(gameObjects[i].counter == 240)
				{
					////new water projectile
					go = new GameObject();
					gO.x = gameObjects[i].x; 
					gO.y = gameObjects[i].y; 
					gO.width = 8; 
					gO.height = 10;
					gO.waterProjectile = true;
					gO.isPortal = false;
					let adjustedX = gameObjects[i].x - linkX;
					let adjustedY = gameObjects[i].y - linkY;
					let angle = -1 * Math.atan2(adjustedX, adjustedY) - 
										Math.PI/2;
					gO.angle = angle;
					gameObjects.push(gO);
				}
				else if(gameObjects[i].counter < 420)
				{
					//hide under water
				}
				else if(gameObjects[i].counter > 420)
				{
					//move coords
					let count = 0;
					let newCol = Math.floor(Math.random() * 16);
					let newRow = Math.floor(Math.random() * 11) + 4;
					while(count < 10 || gameMap[newRow][newCol] != 91)
					{
						count++;
						newCol = Math.floor(Math.random() * 16);
						newRow = Math.floor(Math.random() * 11) + 4;
					}
					gameObjects[i].x = newCol * 16;
					gameObjects[i].y = newRow * 16;
					gameObjects[i].counter = 0;
				}
			}
			
		}
		if(gameObjects[i].waterProjectile)
		{
				gameObjects[i].counter+=1;
				if(gameObjects[i].counter==0)
				{
					ctx.drawImage(enemies, 334, 33, 8, 10, 
							gameObjects[i].x, gameObjects[i].y, 8, 10);
				}
				else if(gameObjects[i].counter==1)
				{
					ctx.drawImage(enemies, 364, 33, 8, 10, 
							gameObjects[i].x, gameObjects[i].y, 8, 10);
				}
				else
				{
					ctx.drawImage(enemies, 394, 33, 8, 10, 
							gameObjects[i].x, gameObjects[i].y, 8, 10);
					gameObjects[i].counter = -1;
				}
				gameObjects[i].x += Math.cos(gameObjects[i].angle);
				gameObjects[i].y += Math.sin(gameObjects[i].angle);
				if(gameObjects[i].x < 0 || gameObjects[i].x > 256 ||
				gameObjects[i].y < 0 || gameObjects[i].y > 240)
				{
					gameObjects.splice(i, 1);
				}
			}			
		if(gameObjects[i].rockProjectile)
		{
			ctx.drawImage(enemies, 90, 300, 16, 16, 
							gameObjects[i].x, gameObjects[i].y, 10, 10);
			gameObjects[i].x += gameObjects[i].xSpeed;
			gameObjects[i].y += gameObjects[i].ySpeed;
		}
	}
}


function getNewCoordinates(currentRow, currentCol, index)
{
	let randRow = Math.floor(Math.random() * 11) + 4;
	let randCol = Math.floor(Math.random() * 15);
	while(gameMap[randRow][randCol] != 2)
	{
		randRow = Math.floor(Math.random() * 11) + 4;
	    randCol = Math.floor(Math.random() * 15);
	}

	gameObjects[index].enemyPath = aStar(new Pos(currentRow, currentCol), 
										new Pos(randRow, randCol), gameMap);

	while(gameObjects[index].enemyPath.length == 0)
	{
		randRow = Math.floor(Math.random() * 10) + 4;
		randCol = Math.floor(Math.random() * 15);
		gameObjects[index].enemyPath = aStar(new Pos(currentRow, currentCol), 
										new Pos(randRow, randCol), gameMap);
	}	
}

class Pos {
    constructor(row, col) {
        this.r = row;
        this.c = col;
    }
}

class Node {
    constructor(parent, position) {
        this.parent = parent;
        this.position = position;

        this.g = 0;
        this.h = 0;
        this.f = 0;
    }
}

///adapted from:
///https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
function aStar(start, end, maze)
{
	start_Node = new Node(null, start);
	end_Node = new Node(null, end);
	let open_list = [];
	let closed_list = [];
	
	open_list.push(start_Node);
	
	while(open_list.length > 0)
	{
		current_node = open_list[0];
		current_index = 0;
		 for(let i = 0; i < open_list.length; i++)
		 {
			if(open_list[i].f < current_node.f)
			{
				current_node = open_list[i];
				current_index = i;
			}
		 }
		open_list.splice(current_index, 1);
		closed_list.push(current_node);
		if(current_node.position.r == end_Node.position.r &&
		current_node.position.c == end_Node.position.c)
		{
			let path = [];
			let current = current_node;
			while(current != null)
			{
				path.push(current.position);
				current = current.parent;
			}
			////console.log("Start node: " + start_Node.position.r + "   " +  start_Node.position.c);
			////console.log(path);
			return path;
		}
		let children = [];
		//let positions = [{0,-1}, {0, 1}, {1, 0}, {-1, 0}];
		let positions = [new Pos(0,-1), new Pos(0,1), new Pos(1,0), new Pos(-1,0)];
		for(let i = 0; i < positions.length; i++)
		{
			node_position = new Pos(current_node.position.r + positions[i].r, current_node.position.c + positions[i].c);
			
			if(node_position.r > (maze.length - 1) || node_position.r < 0 || node_position.c > (maze[0].length - 1) || node_position.c < 0)
            {
				////console.log("Breaking at i: " + i);
				continue;
			}
			if(maze[node_position.r][node_position.c] != 2)
			{
				////console.log("our path contains an obstacle at: " + node_position.r + "    " + node_position.c);
				////console.log("Breaking at i: " + i);
				continue;
			}
			////console.log("adding node for : " + i);
			let new_node = new Node(current_node, node_position);
			
			children.push(new_node);
		}
		
		for(let i = 0; i < children.length; i++)
		{
			for(let j = 0; j < closed_list.length; j++)
			{
				if(children[i].position.r == closed_list[j].position.r &&
					children[i].position.c == closed_list[j].position.c)
                    continue;
			}
			
			children[i].g = current_node.g + 1;
            children[i].h = ((children[i].position.r - end_Node.position.r) * (children[i].position.r - end_Node.position.r)) + 
			((children[i].position.c - end_Node.position.c)*(children[i].position.c - end_Node.position.c))
            children[i].f = children[i].g + children[i].h;
			
			for(let j = 0; j < open_list.length; j++)
			{
				if(children[i].position.r == open_list[j].position.r &&
					children[i].position.c == open_list[j].position.c &&
					children[i].g > open_list[j].g)
                    continue;
			}
			
			open_list.push(children[i]);
		}
	}
}


function gameObjectCollision(x, y, objects, isLink, isSword, isBomb, 
							isFlame, isArrow, direction)
{

	if(isLink)
	{
		for(let i = 0; i < objects.length; i++)
			{
				if (x <= objects[i].x + objects[i].width &&
				   x + 16 >= objects[i].x &&
				   y  <= objects[i].y + objects[i].height &&
				   y + 16 >= objects[i].y ) {
						if(objects[i].isPortal)
						{
							gameMap = maps[objects[i].newMap].map;
							gameObjects = maps[objects[i].newMap].gameobjects;
							lastMap = currentMap;
							currentMap = objects[i].newMap;
							
							addMapGameObjects(gameMap, gameObjects);
							if(objects[i].shiftsLeftRight)
							{
								linkX = objects[i].newLinkX;
							}
							else if(objects[i].shiftsUpDown)
							{
								linkY = objects[i].newLinkY;
							}
							else
							{
								linkX = objects[i].newLinkX;
								linkY = objects[i].newLinkY;
							}
							////console.log("Switching portals");
							break;
							
						}
						if(objects[i].isPickUpItem)
						{
							
							///There are a number of pick up items. The first 8 are selctable within
							/// the inventory screen. The following 6 sit on top of the selectable inventory
							/// and are automatically equipped and used by link.
							//0 - boomerang
							//1 - bomb
							//2 - bow and arrow
							//3 - candle
							//4 - flute
							//5 - meat
							//6 - potion(red or blue)
							//7 - magic rod
							//8 - raft
							//9 - book of magic
							//10 - ring
							//11 - ladder
							//12 - key magical
							//13 - bracelet
							//14 - wood sword
							//15 - large shield
							//16 - nonmagical key
							switch(objects[i].pickUpItemNum)
							{
								
								case 0:
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 1:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 2:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 3:
									if(objects[i].isSaleItem && rupeeAmount >= objects[i].cost)
									{
										lastPickUpItem = 3;
										animationCounter = 0;
										gO = new GameObject();
										gO.pickUpItemNum = objects.pickUpItemNum;
										inventoryItems[objects.pickUpItemNum] = gO;
										rupeeAmount -= objects.cost;
										objects.splice(i,1);
										playPickUpItemAnimation = true;
										destroySaleItems(objects);
									}
									else if(!objects[i].isSaleItem)
									{
										lastPickUpItem = 3;
										animationCounter = 0;
										gO = new GameObject();
										gO.pickUpItemNum = objects.pickUpItemNum;
										inventoryItems[objects.pickUpItemNum] = gO;
										objects.splice(i,1);
										playPickUpItemAnimation = true;
									}
									break;
								case 4:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 5:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;	
								case 6:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 7:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 8:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 9:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 10:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									break;
								case 11:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 12:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 13:
									gO = new GameObject();
									gO.pickUpItemNum = objects[i].pickUpItemNum;
									inventoryItems[objects[i].pickUpItemNum] = gO;
									lastPickUpItem = objects[i].pickUpItemNum;
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									break;
								case 14:
									lastPickUpItem = 14;
									swordEquipped = 1;
									hasSword = true;
									playSound("./sounds/item.mp3");
									objects.splice(i,1);
									animationCounter = 0;
									playPickUpItemAnimation = true;
									destroySaleItems(objects);
									break;
								case 15:
									if(objects[i].isSaleItem && rupeeAmount >= objects[i].cost)
									{
										lastPickUpItem = 15;
										rupeeAmount -= objects[i].cost;
										objects.splice(i,1);
										animationCounter = 0;
										playPickUpItemAnimation = true;
										destroySaleItems(objects);
									}
									break;
								case 16:
									if(objects[i].isSaleItem && rupeeAmount >= objects[i].cost)
									{
										lastPickUpItem = 16;
										rupeeAmount -= objects[i].cost;
										keyNum += 1;
										objects.splice(i,1);
										animationCounter = 0;
										playPickUpItemAnimation = true;
										destroySaleItems(objects);
									}
									break;
									
							}
							
							break;
						}
						if((objects[i].waterProjectile || objects[i].rockProjectile || objects[i].isEnemy) && !linkNeedsToBounce && !linkIsInvincible)
						{
							//
							//linkNeedsToBounce = true;
							//getBounceLocLink(objects[i].direction);
							if(objects[i].rockProjectile && 
							((lastButtonPressed == "up" &&  objects[i].ySpeed >0) || 
							(lastButtonPressed == "down" &&  objects[i].ySpeed <0) ||
							(lastButtonPressed == "left" &&  objects[i].xSpeed >0) ||
							(lastButtonPressed == "right" &&  objects[i].xSpeed <0)))
							{
								playSound("./sounds/LOZ_shield.wav");
								objects.splice(i,1);
								return;
							}
							playSound("./sounds/LOZ_link_hurt.wav");
							if(objects[i].rockProjectile)
							{
								objects.splice(i,1);
							}
							currentLinkHearts -= .5;
							linkIsInvincible = true;
							invincibleTime = 30;
							if(currentLinkHearts <= 0)
							{
								//link has died
							}
						}
						if(objects[i].isRupee)
						{
							rupeeAmount += 1;
							objects.splice(i,1);
							playSound("./sounds/LOZ_get_rupee.wav");
						}
					}
			}
	}
	else if(isFlame)
	{
		for(let i = 0; i < objects.length; i++)
			{
					if (x <= objects[i].x + objects[i].width &&
					x + 16>= objects[i].x &&
					y  <= objects[i].y + objects[i].height &&
					y + 16>= objects[i].y ) 
					{
						if(objects[i].isEnemy)
								{
									//
									objects[i].health -= 1;
									objects[i].needsBounce = true;
									getBounceLoc(objects[i], false,
											direction);
									if(objects[i].health == 0)
									{
										playSound("./sounds/LOZ_enemy_die.wav");
									}
									else
									{
										playSound("./sounds/LOZ_enemy_hit.wav");
									}
								}
					}
			}
	}
	else
	{
		let swordW = 11;
		let swordH = 3;
		if(lastButtonPressed == "up" ||
			lastButtonPressed == "down")
		{
			swordW = 3;
			swordH = 11;
		}
		
		for(let i = 0; i < objects.length; i++)
			{
				if(lastButtonPressed == "left")
				{
					if (x + 2 <= objects[i].x + objects[i].width &&
					x + 2 + swordW>= objects[i].x &&
					y + 6  <= objects[i].y + objects[i].height &&
					y + 6 + swordH >= objects[i].y ) 
					{
						//ctx.fillRect(x + 2, (y+6), swordW, swordH);
						if(objects[i].isEnemy)
								{
									//
									objects[i].health -= 1;
									objects[i].needsBounce = true;
									getBounceLoc(objects[i], false,
											direction);
									if(objects[i].health == 0)
									{
										playSound("./sounds/LOZ_enemy_die.wav");
									}
									else
									{
										playSound("./sounds/LOZ_enemy_hit.wav");
									}
								}
					}
				}
				else if(lastButtonPressed == "right")
				{
					if (x - 2<= objects[i].x + objects[i].width &&
					x - 2 + swordW>= objects[i].x &&
					y + 6  <= objects[i].y + objects[i].height &&
					y + 6 + swordH >= objects[i].y ) 
					{
						//ctx.fillRect(x - 2, (y+6), swordW, swordH);
						if(objects[i].isEnemy)
								{
									//
									objects[i].health -= 1;
									objects[i].needsBounce = true;
									getBounceLoc(objects[i], false,
											direction);
									if(objects[i].health == 0)
									{
										playSound("./sounds/LOZ_enemy_die.wav");
									}
									else
									{
										playSound("./sounds/LOZ_enemy_hit.wav");
									}
								}
					}
				}
				else if(lastButtonPressed == "up")
				{
					if (x - 2 <= objects[i].x + objects[i].width &&
					x - 2  + swordW>= objects[i].x &&
					y   <= objects[i].y + objects[i].height &&
					y  + swordH >= objects[i].y ) 
					{
						//ctx.fillRect(x - 2, y, swordW, swordH);
						if(objects[i].isEnemy)
								{
									//
									objects[i].health -= 1;
									objects[i].needsBounce = true;
									getBounceLoc(objects[i], false,
											direction);
									if(objects[i].health == 0)
									{
										playSound("./sounds/LOZ_enemy_die.wav");
									}
									else
									{
										playSound("./sounds/LOZ_enemy_hit.wav");
									}
								}
					}
				}
				else{
				
					if (x <= objects[i].x + objects[i].width &&
					x + swordW>= objects[i].x &&
					y  <= objects[i].y + objects[i].height &&
					y + swordH >= objects[i].y ) 
					{
						//ctx.fillRect(x, y, swordW, swordH);
						if(objects[i].isEnemy)
								{
									//
									objects[i].health -= 1;
									objects[i].needsBounce = true;
									getBounceLoc(objects[i], false,
											direction);
									if(objects[i].health == 0)
									{
										playSound("./sounds/LOZ_enemy_die.wav");
									}
									else
									{
										playSound("./sounds/LOZ_enemy_hit.wav");
									}
								}
					}
				}
		}
	}
}

function destroySaleItems(objects)
{
	for(let j = 0; j < objects.length; j++)
	{
		if(objects[j].isSaleItem)
		{
			objects.splice(j,1);
			j--;
		}
	}
}

function getBounceLoc(gObject, ignoresObjects, direction)
{
	let currRow = Math.floor(gObject.y/16);
	let currCol = Math.floor(gObject.x/16);
	if(direction == "up")
	{
		if(gameMap[currRow-1][currCol] == 2)
		{
			gObject.bounceY = gObject.y - 16 ;
			gObject.bounceX = gObject.x;
		}
		else
		{
			gObject.bounceY = gObject.y;
			gObject.bounceX = gObject.x;
		}
	}
	if(direction == "down")
	{
		if(gameMap[currRow+1][currCol] == 2)
		{
			gObject.bounceY = gObject.y + 16 ;
			gObject.bounceX = gObject.x;
		}
		else
		{
			gObject.bounceY = gObject.y;
			gObject.bounceX = gObject.x;
		}
	}
	if(direction == "left")
	{
		if(gameMap[currRow][currCol-1] == 2)
		{
			gObject.bounceX = gObject.x - 16 ;
			gObject.bounceY = gObject.y;
		}
		else
		{
			gObject.bounceY = gObject.y;
			gObject.bounceX = gObject.x;
		}
	}
	if(direction == "right")
	{
		if(gameMap[currRow][currCol+1] == 2)
		{
			gObject.bounceX = gObject.x + 16 ;
			gObject.bounceY = gObject.y;
		}
		else
		{
			gObject.bounceY = gObject.y;
			gObject.bounceX = gObject.x;
		}
	}
	////console.log("New bx and by is: " + gObject.bounceX + "  " + gObject.bounceY);
}

function getBounceLocLink(direction)
{
	linkBounceX = linkX;
	linkBounceY = linkY;
	if(direction == "up") 
	 { 
		 while(!linkCollision(linkX, linkBounceY - 2, gameObjects) &&  
				  linkY - 16 !=  linkBounceY) 
		{ 
			 
			 linkBounceY-= 2;
			
		 }
	 } 
	 if(direction == "down") 
	  { 
		 while(!linkCollision(linkX, linkBounceY + 2, gameObjects) &&  
				   linkY + 16 !=  linkBounceY) 
		 { 

			    linkBounceY += 2; 
		     } 
	     } 
	     if(direction == "left")	 
	     { 
		     while(!linkCollision(linkBounceX - 2, linkY , gameObjects) &&  
				     linkX - 16 !=  linkBounceX) 
		    { 
			
			    linkBounceX -= 2; 
		    } 
	     } 
	     if(direction == "right") 
	   { 
	        while(!linkCollision(linkBounceX + 2, linkY , gameObjects) &&  
				    linkX + 16 !=  linkBounceX) 
		    { 
			
			 linkBounceX += 2; 
		    }
	     } 
}

function drawHUD(offset)
{
	ctx.drawImage(hud, 258, 11, 256, 56, 
				0, 0 + offset, 256, 56);
	ctx.drawImage(hud, 2, 112, 16, 64, 
				176, 32 + offset, 64,  16);
	//draw Hearts
	let fullHearts = Math.floor(currentLinkHearts)
	let halfHearts = currentLinkHearts - fullHearts;
	for(let i = 0; i < linkHearts; i++)
	{
		let heartY = 40;
		let heartX = 176 + (i * 8);
		if(i > 7)
			{
				heartY = 40 - 8;
				heartX -= 64;
			}
			else
			{
				heartY = 40;
			}
		ctx.drawImage(hud, 627, 117, 8, 8, 
				heartX, heartY + offset, 8, 8);
	}
	let halfHeartX = 0;
	let halfHeartY = 0;
	for(let i = 0; i < fullHearts; i++)
	{
		let heartY = 40;
		let heartX = 176 + (i * 8);
		if(i > 7)
			{
				heartY = 40 - 8;
				heartX -= 64;
			}
			else
			{
				heartY = 40;
			}
		ctx.drawImage(hud, 645, 117, 8, 8, 
				heartX, heartY + offset, 8, 8);
		if(i == fullHearts - 1)
		{
			
			if(i > 6)
			{
				halfHeartY = 40 - 8;
				halfHeartX = 176 + ((i%7) * 8);
				
			}
			else
			{
				halfHeartY = 40;
				halfHeartX = 176 + (i * 8) + 8;
			}
		}	
	}
	
	if(halfHearts > 0 && fullHearts >= 1)
	{
		ctx.drawImage(hud, 636, 117, 8, 8, 
				halfHeartX, halfHeartY + offset, 8, 8);
	}
	else if(halfHearts > 0 && fullHearts == 0)
	{
		ctx.drawImage(hud, 636, 117, 8, 8, 
				176, 40 + offset, 8, 8);
	}
	
	
	////This draws the rupee values
	///cover with black
	ctx.drawImage(hud, 354, 36, 24, 6, 
				96, 10 + offset, 24, 50);
	///124
	if(rupeeAmount < 100)
	{
		ctx.drawImage(hud, 519, 117, 8, 8, 
				96, 16 + offset, 8, 8);
		let firstNum = rupeeAmount %10;
		ctx.drawImage(hud, 528 + (8*firstNum) + (1*firstNum), 117, 8, 8, 
				96 + 16, 16 + offset, 8, 8);
		let secondNum = Math.floor(rupeeAmount/10);
		ctx.drawImage(hud, 528 + (8*secondNum) + (1*secondNum), 117, 8, 8, 
				96 + 8, 16 + offset, 8, 8);
	}
	else{
		let firstNum = rupeeAmount %10;
		ctx.drawImage(hud, 528 + (8*firstNum) + (1*firstNum), 117, 8, 8, 
				96 + 16, 16 + offset, 8, 8);
		let secondNum = Math.floor(rupeeAmount/10);
		let thirdNum = Math.floor(rupeeAmount/ 100) * 100;
		secondNum = ((rupeeAmount - thirdNum) - firstNum) / 10;
		ctx.drawImage(hud, 528 + (8*secondNum) + (1*secondNum), 117, 8, 8, 
				96 + 8, 16 + offset, 8, 8);
		thirdNum = Math.floor(rupeeAmount / 100);
		ctx.drawImage(hud, 528 + (8*thirdNum) + (1*thirdNum), 117, 8, 8, 
				96 , 16 + offset, 8, 8);
	}
	
	//draw bomb and key nums
	///key num
	ctx.drawImage(hud, 519, 117, 8, 8, 
				96, 32 + offset, 8, 8);
	ctx.drawImage(hud, 528 + (8*keyNum) + (1*keyNum), 117, 8, 8, 
				96 + 8, 32 + offset, 8, 8);
	///bomb num
	ctx.drawImage(hud, 519, 117, 8, 8, 
				96, 41 + offset, 8, 8);
	ctx.drawImage(hud, 528 + (8*bombNum) + (1*bombNum), 117, 8, 8, 
				96 + 8, 41 + offset, 8, 8);
	
	///Sword and B button items
	ctx.fillStyle = "black";
	ctx.fillRect(128, 24 + offset, 8, 16);
	ctx.fillRect(152, 24 + offset, 8, 16);
	if(swordEquipped == 1)
	{
		ctx.drawImage(hud, 555, 137, 8, 16, 
				152 , 24 + offset, 8, 16);
	}
	if(currentEquippedItem > -1)
	{
		switch(currentEquippedItem)
		{
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				ctx.drawImage(link1, 393, 195, 8, 16, 
								128, 24 + offset, 8, 16);
				break;
		}
	}
	
	///Fill map location in with gray
	ctx.fillStyle = "gray";
	ctx.fillRect(16, 8 + offset, 64, 48);
	let linkLoc = 0;
	if(currentMap > 127)
	{
		linkLoc = lastMap;
	}
	else
	{
		linkLoc = currentMap;
	}	
	
	let mapCol = linkLoc%16;
	let mapRow = Math.floor(linkLoc/16);
	ctx.fillStyle = "green";
	ctx.fillRect(16 + (mapCol * 4), 8 + (mapRow * 6), 4, 6);
}

function drawGameStart()
{
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.font = "20px Arial";
	ctx.fillText("Push enter to start", 40, 120);
}

function linkCollision(x, y, objects)
{
	for(let i = 0; i < objects.length; i++)
	{
		if (x <= objects[i].x + objects[i].width &&
		   x + 16 >= objects[i].x &&
		   y + 10 <= objects[i].y + objects[i].height &&
		   y + 16 >= objects[i].y ) {
				return true;
			}
	}
	return false;
}

function alreadyContainsPortal(x, y)
{
	for(let i = 0; i < gameObjects.length; i++)
	{
		if(gameObjects[i].x == x && gameObjects[i].y == y && gameObjects[i].isPortal)
		{
			return true;
		}
	}

	return false;
}


function addMapGameObjects(levelMap, objectArray)
{
	for(let i = 4; i < levelMap.length; i++)
	{
		for(let j = 0; j < levelMap[0].length; j++)
		{
			let linkCanWalkSpaces = [2,28,18,6,12,14,24,30,34,58,64,70,75,76,77,
			93,94,95,111,112,113,81,82,86,99,100,101,117,118,119,87,88,89,105,
			106,107,123,124,125,126,127,128,129,131,132,133,134,135,137,138,139,
			140,141,143];
			if(i == 4)
			{
				if(linkCanWalkSpaces.includes(levelMap[i][j]))
				{
					gO = new GameObject()
					gO.x = j * 16;
					gO.y = 3 * 16; ///portal at y == 48
					gO.width = 16;
					gO.height = 16;
					gO.newMap = currentMap - 16;
					gO.newLinkX = (j * 16) +1; 
					gO.newLinkY = 223;
					gO.isPortal = true;
					gO.shiftsUpDown = true;
					if(!alreadyContainsPortal(j * 16, 3 * 16))
					{
						gameObjects.push(gO);
					}
				}
			}
			else if(i == 14)
			{
				if(linkCanWalkSpaces.includes(levelMap[i][j]))
				{
					gO = new GameObject()
					gO.x = j * 16;
					gO.y = (i + 1) * 16;
					gO.width = 16;
					gO.height = 16;
					gO.newMap = currentMap + 16;
					gO.newLinkX = (j * 16) + 1;
					gO.newLinkY = 81;
					gO.isPortal = true;
					gO.shiftsUpDown = true;
					if(!alreadyContainsPortal(j * 16, (i + 1) * 16))
					{
						gameObjects.push(gO);
					}
				}
			}
			else if(j == 0)
			{
				if(linkCanWalkSpaces.includes(levelMap[i][j]))
				{
					gO = new GameObject()
					gO.x = -16;
					gO.y = i * 16;
					gO.width = 16;
					gO.height = 16;
					gO.newMap = currentMap - 1;
					gO.newLinkX = 223;
					gO.newLinkY = (i * 16) - 1;
					gO.isPortal = true;
					gO.shiftsLeftRight = true;
					if(!alreadyContainsPortal(-16, i * 16))
					{
						gameObjects.push(gO);
					}
				}
			}
			else if(j == 15)
			{
				if(linkCanWalkSpaces.includes(levelMap[i][j]))
				{
					gO = new GameObject()
					gO.x = 256;
					gO.y = i * 16;
					gO.width = 16;
					gO.height = 16;
					gO.newMap = currentMap + 1;
					gO.newLinkX = 1;
					gO.newLinkY = (i * 16) - 2;
					gO.isPortal = true;
					gO.shiftsLeftRight = true;
					if(!alreadyContainsPortal(256, (i * 16)))
					{
						gameObjects.push(gO);
					}
				}
			}

		}
	}
}

function drawInventoryScreen(offset)
{
	ctx.drawImage(hud, 1, 11, 256, 88, 
				0, -200 + offset, 256, 88);
	ctx.drawImage(hud, 1, 112, 256, 88, 
				0, -112 + offset, 256,  88);
	ctx.drawImage(hud, 519, 42, 96, 48, 
				 80, -112 + offset + 16, 96,  48);
	if(leftPressed && cursorX > 132)
	{
		leftPressed = false;
		cursorX -= 15;
	}
	if(rightPressed && cursorX < 200)
	{
		rightPressed = false;
		cursorX += 15;
	}
	if(upPressed && cursorY + offset > 42)
	{
		upPressed = false;
		cursorY -= 15;
	}
	if(downPressed && cursorY + offset < 43)
	{
		downPressed = false;
		cursorY += 15;
	}
	ctx.drawImage(hud, 536, 137, 16, 16, cursorX, cursorY + offset, 16, 16);
	
	if(inventoryItems[3] != null)
	{
		ctx.drawImage(link1, 393, 195, 8, 16, 
							204, 48 + offset - 200, 8, 16);
	}
	if(isAttacking)
	{
		if(cursorX == 202 && cursorY == -152)
		{
			currentEquippedItem = 3;
			isAttacking = false;
		}
	}
	
	switch(currentEquippedItem)
	{
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			ctx.drawImage(link1, 393, 195, 8, 16, 
							69, 48 + offset - 200, 8, 16);
			break;
	}
}

function draw () {
   setTimeout(function() {
   requestAnimationFrame(draw);
   ctx.fillStyle = "rgb(0,0,0)";
   ctx.fillRect(0,0,800,600);
   ///all code goes here
    if(!hasGameStarted)
	{
		drawGameStart();
	}
	else
	{
		if(needInventoryScreen)
		{	
			if(!returnToGame)
			{
				inventoryOffset+=2;
				if(inventoryOffset > 184)
				{
					inventoryOffset = 184;
				}
			}
			else
			{
				inventoryOffset-=2;
				if(inventoryOffset < 0)
				{
					inventoryOffset = 0;
					needInventoryScreen = false;
				}
			}
			drawHUD(inventoryOffset);
			drawInventoryScreen(inventoryOffset);
		}
		else
		{
			invincibleTime--;
			if(invincibleTime <= 0)
			{
				linkIsInvincible = false;
			}
			drawMap(gameMap);
			drawLink();
			drawGameObjects();
			drawHUD(inventoryOffset);
			gameObjectCollision(linkX, linkY, gameObjects, true, false, false, false, false);
		}
	}
   },1000/fps);
}
draw();
