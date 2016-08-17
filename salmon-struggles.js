/**
 * Created by Lawrence on 8/11/2016.
 */


/**********************************
 * Global Variables
 **********************************/
var FISH_SPEED = 8;
var DESCENT_RATE = 0.4;
var STARTED = false;
var DEAD = false;
var CAUSE = 0; //represents cause of death
var HEIGHT = 600;
var WIDTH = 500;
var FISH_OFFSET = 100; //distance of fish from left of screen
var WATER_LEVEL = 100; //where water level is
var GROUND_HEIGHT = 50;
var OBSTACLES = []; //obstacles
var OBST_WIDTH = 80;
var OBST_HEIGHT = 300;
var MAX_OBSTS = 3; //max number of active obstacles desired (to trim array size)


/**********************************
 * Renderer and Stage setup
 **********************************/
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT,{backgroundColor : 0x1099bb, antialias: true});
document.getElementById("game").appendChild(renderer.view); //add canvas to game area

//create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;
stage.buttonMode = true;

//Mouse click
stage
    .on('mousedown', onMouseDown)
    .on('touchstart', onMouseDown)

function onMouseDown(){
    if(!STARTED && !DEAD){
        STARTED = true;
        title.visible = false;
        addNewObs(); //add a starting obstacle
    }//not yet started game
    else if (STARTED) {
        fish.speedY = FISH_SPEED;
    }//game started
};//click

stage.mouseUp = stage.onTouchEnd = function(){
    down = false;
}//release

/**********************************
 * Water Background
 **********************************/
var water = PIXI.Texture.fromImage('textures/water.png');
var tilingWater = new PIXI.TilingSprite(water, WIDTH, HEIGHT);
tilingWater.tileScale.y = 0.6;
stage.addChild(tilingWater);

/**********************************
 * Surface (Sky)
 **********************************/
var surface = PIXI.Texture.fromImage('textures/sky.png');
var tilingSurface = new PIXI.TilingSprite(surface, WIDTH, HEIGHT);
//surface.width = WIDTH;
tilingSurface.height = WATER_LEVEL;
//tilingSurface.position.x = 0;
//tilingSurface.position.y = 0;
stage.addChild(tilingSurface);

/**********************************
 * Ground
 **********************************/
var sand = new PIXI.Texture.fromImage('textures/sand.png');
var tilingGround = new PIXI.TilingSprite(sand, WIDTH, HEIGHT);
tilingGround.width = WIDTH;
tilingGround.height = GROUND_HEIGHT;
//tilingGround.anchor.x = 0.5;
//tilingGround.anchor.y = 0.5;
tilingGround.position.x = 0;
tilingGround.position.y = HEIGHT - GROUND_HEIGHT;
stage.addChild(tilingGround);

/**********************************
 * Fish
 **********************************/
var fish = PIXI.Sprite.fromImage('textures/bunny.png');
fish.position.set(FISH_OFFSET,HEIGHT/2);
fish.interactive = true;
fish.speedY = FISH_SPEED;
fish.downRate = DESCENT_RATE;
fish.airTime = 0;
fish.pivot.x = 13;
fish.pivot.y = 18;
stage.addChild(fish);

/**********************************
 * Obstacles (Collision items)
 **********************************/
var obst = new PIXI.Container();
stage.addChild(obst);

function addNewObs(){
    var obj = new PIXI.Texture.fromImage('textures/dam.png');
    var tilingDam = new PIXI.TilingSprite(obj, WIDTH, HEIGHT);
    tilingDam.width = OBST_WIDTH;
    tilingDam.height = OBST_HEIGHT;
    tilingDam.anchor.x = 0.5;
    tilingDam.anchor.y = 0.5;
    //tilingDam.rotation = Math.PI;

    tilingDam.position.y = Math.floor(Math.random() * HEIGHT);
    tilingDam.position.x = WIDTH + OBST_WIDTH;

    //Add to container
    obst.addChild(tilingDam);

    if(MAX_OBSTS.length > MAX_OBSTS){
        OBSTACLES.shift();
    }//trim array

    //Push to array so we can track it later
    OBSTACLES.push(tilingDam);
}//add new obstacles


/**********************************
 * Text styles
 **********************************/
var style = {
    font : 'bold italic 36px Arial',
    fill : '#F7EDCA',
    stroke : '#4a1850',
    strokeThickness : 5,
    dropShadow : true,
    dropShadowColor : '#000000',
    dropShadowAngle : Math.PI / 6,
    dropShadowDistance : 6,
    wordWrap : true,
    wordWrapWidth : 440
};

var messageStyle = {
    font : 'bold 30px Arial',
    fill : '#F7EDCA',
    stroke : '#111111',
    strokeThickness : 3,
    wordWrap : true,
    wordWrapWidth : WIDTH - 80 //30 and 10 for one size * 2
};

var warningStyle = {
    font : '30px Arial',
    fill : '#ff4000',
    stroke : '#000000',
    strokeThickness : 0,
}

/**********************************
 * Restart Button
 **********************************/
var restartBtn = new PIXI.Text("Restart", style);
restartBtn.x = 180;
restartBtn.y = 505;
restartBtn.interactive = true;
restartBtn.buttonMode = true;
//Reset all the values
restartBtn.click = restartBtn.tap = function() {
    fish.position.y = HEIGHT/2;
    fish.speedY = FISH_SPEED;
    fish.airTime = 0;
    fish.rotation = 0;
    summary.visible = false;
    obst.children = [];
    OBSTACLES = [];
    CAUSE = 0;
    STARTED = true;
    DEAD = false;
    addNewObs();
}//restart

/**********************************
 * Text and Messages
 **********************************/


//Title
var title = new PIXI.Text('Salmon Struggles: The Story of Sam the Salmon', style);
title.x = 30;
title.y = 180;
stage.addChild(title);

//text placed in the summary container
var warning = new PIXI.Text("", warningStyle);
warning.x = 20;
warning.y = 20;
stage.addChild(warning);

//post death summary container
var summary = new PIXI.Graphics();
//rectangle
summary.lineStyle(2, 0xFF00FF, 1);
summary.beginFill(0xFF00BB, 0.35);
summary.drawRoundedRect(30, 30, WIDTH - 60, HEIGHT - 100, 15);
summary.endFill();
//text placed in the summary container
var message = new PIXI.Text("", messageStyle);
message.x = 40;
message.y = 40;
//add contents to the summary
summary.addChild(restartBtn); //add restart button
summary.addChild(message); //add cause of death
summary.visible = false;
stage.addChild(summary); //add dialog to stage





/**********************************
 * Animate
 **********************************/
animate();

function animate() {
    requestAnimationFrame(animate);

    if(STARTED) {
        if( fish.airTime > 100) {
            CAUSE = 0;
            DEAD = true;
        }//death by bird
        else if(fish.position.y > HEIGHT){
            CAUSE = 1;
            DEAD = true;
        }//death by deep water
        else if(!DEAD){


            for (var i = 0; i < OBSTACLES.length; i++) {
                OBSTACLES[i].position.x -= 4;

                if(i == OBSTACLES.length - 1 && OBSTACLES[i].position.x <= WIDTH - 300){
                    addNewObs();
                }//check if its time to add new obstacle by checking last obstacle

                if(OBSTACLES[i].position.x + OBST_WIDTH/2 >= FISH_OFFSET - fish.width/2 && OBSTACLES[i].position.x - OBST_WIDTH/2 <= FISH_OFFSET + fish.width/2){
                    if((fish.position.y - fish.height/2) < OBSTACLES[i].position.y + OBST_HEIGHT/2 && (fish.position.y + fish.height/2) > OBSTACLES[i].position.y - OBST_HEIGHT/2){
                        CAUSE = 2;
                        DEAD = true;
                    }
                }//collision detection

            }//Move obstacles

            moveBackground();

            if(fish.position.y < WATER_LEVEL){
                if(fish.airTime > 20){
                    warning.text = "Bird Alert!";
                }//display warning
                fish.airTime += 1;
            }//check if over water
            else{
                fish.airTime = 0;
                warning.text = "";
            }//fish is under water

            //Let fish descend
            descend()
        }//if still alive

        if(DEAD){
            switch(CAUSE) {
                case 0:
                    message.text = "You were eaten by a hawk! Being in the air makes you a vulnerable target to birds.";
                    break;
                case 1:
                    message.text = "Death by cuttlefish."
                    break;
                case 2:
                    message.text = "You swam headfirst into a Dam."
                    break;
            }//switch

            STARTED = false;
            warning.text = false;
            summary.visible = true;
        }//check if died

    }//game started

    //render the container
    renderer.render(stage);
}//animate

function descend(){
    fish.speedY -= fish.downRate;
    fish.rotation += 0.1;
    fish.position.y -= fish.speedY;
}//descend logic

function moveBackground(){
    tilingWater.tilePosition.x -= 1; //water
    tilingSurface.tilePosition.x -= 0.25; //sky
    tilingGround.tilePosition.x -= 2; //ground
}//move background