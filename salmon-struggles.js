/**
 * Created by Lawrence on 8/11/2016.
 */

/** TO DO:
 * Preloader
 *
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
var OBSTACLES = []; //obstacles array
var OBST_WIDTH = 80;
var OBST_HEIGHT = 100;
var NUM_TYPES = 3; //number of types of obstacles
var AIR_THRESHOLD = 130; //time units player can stay above water
var STAGE = 1; //what stage player is on (Fry, Smolt, Adult)
var FOOD_COUNT = 0;
var FOOD_REQ = [10, 20, 40]

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
        addNewObs(WIDTH, HEIGHT/2, OBST_WIDTH, OBST_HEIGHT, 3); //add a starting obstacle
        stageText.text = "Stage 1: Fry";
        foodText.text = "Food: " + FOOD_COUNT + "/" + FOOD_REQ[STAGE];
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
var tilingWater = new PIXI.extras.TilingSprite(water, WIDTH, HEIGHT);
tilingWater.tileScale.y = 0.6;
stage.addChild(tilingWater);

/**********************************
 * Surface (Sky)
 **********************************/
var surface = PIXI.Texture.fromImage('textures/sky.png');
var tilingSurface = new PIXI.extras.TilingSprite(surface, WIDTH, HEIGHT);
//surface.width = WIDTH;
tilingSurface.height = WATER_LEVEL;
//tilingSurface.position.x = 0;
//tilingSurface.position.y = 0;
stage.addChild(tilingSurface);

/**********************************
 * Ground
 **********************************/
var sand = new PIXI.Texture.fromImage('textures/sand.png');
var tilingGround = new PIXI.extras.TilingSprite(sand, WIDTH, HEIGHT);
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

function addNewObs(x, y, w, h, type){
    var obj = new PIXI.Texture.fromImage('textures/dam.png');
    var tilingDam = new PIXI.extras.TilingSprite(obj, WIDTH, HEIGHT);
    tilingDam.width = w;
    tilingDam.height = h;
    tilingDam.anchor.x = 0.5;
    tilingDam.anchor.y = 0.5;

    tilingDam.position.y = y;
    tilingDam.position.x = x + w;

    tilingDam.type = type; //type used to determine death

    //Add to container
    obst.addChild(tilingDam);

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
    fill : '#EEEEEE',
    stroke : '#333333',
    strokeThickness : 5,
    wordWrap : true,
    wordWrapWidth : WIDTH - 80 //30 and 10 for one size * 2
};

var warningStyle = {
    font : 'bold 26px Arial',
    fill : '#ff1000',
    stroke : '#EEEEEE',
    strokeThickness : 5,
}

var hudStyle = {
    font : 'bold 20px Arial',
    fill : '#F7EDCA',
    stroke : '#000077',
    strokeThickness : 5,
}

/**********************************
 * Restart Button
 **********************************/
var restartBtn = new PIXI.Text("Restart Stage", style);
restartBtn.x = 130;
restartBtn.y = 510;
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
    stageText.text = "Stage: Fry";
    addNewObs(WIDTH, HEIGHT/2, OBST_WIDTH, OBST_HEIGHT, 3);
}//restart

/**********************************
 * Text and Messages
 **********************************/


//Title
var title = new PIXI.Text('Salmon Struggles: The Story of Sam the Salmon', style);
title.x = 30;
title.y = 180;
stage.addChild(title);

//Food text
var foodText = new PIXI.Text("", hudStyle);
foodText.x = 200;
foodText.y = 5;
stage.addChild(foodText);

//Stage text
var stageText = new PIXI.Text("", hudStyle);
stageText.x = 5;
stageText.y = 5;
stage.addChild(stageText);

//Bird Alert warning text
var warning = new PIXI.Text("", warningStyle);
warning.x = 170;
warning.y = 50;
stage.addChild(warning);

//post death summary container
var summary = new PIXI.Graphics();
//rectangle
summary.lineStyle(2, 0xFF00FF, 1);
summary.beginFill(0xFF00BB, 0.35);
summary.drawRoundedRect(30, 35, WIDTH - 60, HEIGHT - 100, 15);
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
        if( fish.airTime > AIR_THRESHOLD) {
            CAUSE = 0;
            DEAD = true;
        }//death by bird
        else if(fish.position.y > HEIGHT){
            CAUSE = 1;
            DEAD = true;
        }//death by deep water
        else if(!DEAD){


            for (var i = 0; i < OBSTACLES.length; i++) {

                if(OBSTACLES[i].x < -OBST_WIDTH*2){
                    OBSTACLES.shift();
                }//remove obstacles that have passed

                OBSTACLES[i].position.x -= 4;

                if(i == OBSTACLES.length - 1 && OBSTACLES[i].position.x <= FISH_OFFSET){
                    //add new random obstacles
                    var selection = Math.floor(NUM_TYPES * Math.random());
                    //var selection = 0;
                    var y = Math.floor(Math.random() * HEIGHT);
                    //console.log(selection);
                    switch(selection){
                        case 0:
                            makeDam();
                            break;
                        case 1:
                            addNewObs(WIDTH, y, OBST_WIDTH, OBST_HEIGHT, 3);
                            break;
                        case 2:
                            addNewObs(WIDTH, y, OBST_WIDTH, OBST_HEIGHT, 3);
                            break;
                    }

                }//check if its time to add new obstacle by checking last obstacle's position

                if(OBSTACLES[i].position.x + OBST_WIDTH/2 >= FISH_OFFSET - fish.width/2 && OBSTACLES[i].position.x - OBST_WIDTH/2 <= FISH_OFFSET + fish.width/2){
                    if((fish.position.y - fish.height/2) < OBSTACLES[i].position.y + OBSTACLES[i].height/2 && (fish.position.y + fish.height/2) > OBSTACLES[i].position.y - OBSTACLES[i].height/2){
                        CAUSE = OBSTACLES[i].type;
                        DEAD = true;
                    }
                }//collision detection

            }//Move obstacles and generate new ones

            moveBackground();

            if(fish.position.y < WATER_LEVEL){
                if(fish.airTime > 30){
                    warning.text = "Bird Alert! " + Math.floor((AIR_THRESHOLD - fish.airTime)/10);
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
                case 3:
                    message.text = "You swam into debris."
                    break;
            }//switch

            STARTED = false;
            //warning.visible = false;
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

function makeDam(){
    addNewObs(WIDTH, HEIGHT/2 + 200, OBST_WIDTH, HEIGHT, 2);
    addNewObs(WIDTH+OBST_WIDTH, HEIGHT/2 + 150, OBST_WIDTH, HEIGHT, 2);
    addNewObs(WIDTH+OBST_WIDTH*2, HEIGHT/2 + 70, OBST_WIDTH, HEIGHT, 2);
}//make Dam