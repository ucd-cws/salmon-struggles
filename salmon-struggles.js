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
var OBSTACLES = []; //obstacles array
var OBST_WIDTH = 80;
var OBST_HEIGHT = 100;
var AIR_THRESHOLD = 130; //time units player can stay above water
var STAGE = 0; //what stage player is on (Fry, Smolt, Adult)
var FOOD_COUNT = 0;
//var FOOD_REQ = [5, 10, 15];
var FOOD_REQ = [2, 2, 2];
var LOW_FLOW = false;
var WAIT = 0; //used to prevent user from clicking when instructions opened
var WAIT_THRESHOLD = 35;//how long to wait

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
    if(!STARTED && !DEAD && OBSTACLES.length < 1){
        title.visible = false;
        instructions.visible = true;
        clickText.visible = false;
        makeFood(); //add a starting obstacle
        stageText.visible = true;
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

var titleStyle = {
    font : 'bold 72px Comic Sans MS',
    fill : '#EEEEEE',
    stroke : '#4a1850',
    strokeThickness : 5,
    align: 'center',
    dropShadow : true,
    dropShadowColor : '#000000',
    dropShadowAngle : Math.PI / 6,
    dropShadowDistance : 6,
    wordWrap : true,
    wordWrapWidth : 440
};

var clickStyle = {
    font : 'bold italic 32px Arial',
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
restartBtn.y = 160;
restartBtn.interactive = true;
restartBtn.buttonMode = true;
//Reset all the values
restartBtn.click = restartBtn.tap = function() {
    restartStage();
}//restart

/**********************************
 * Let's Go! Button
 **********************************/
var letsgoBtn = new PIXI.Text("Let's Go!", style);
letsgoBtn.x = 170;
letsgoBtn.y = HEIGHT - 90;
letsgoBtn.interactive = true;
letsgoBtn.buttonMode = true;

letsgoBtn.click = letsgoBtn.tap = function() {
    if (WAIT > WAIT_THRESHOLD) {
        STARTED = true;
        instructions.visible = false;
        WAIT = 0;
    }//check wait
}//user clicked button

/**********************************
 * Play Again Button
 **********************************/

var playagainBtn = new PIXI.Text("Play Again", style);
playagainBtn.x = 150;
playagainBtn.y = HEIGHT - 90;
playagainBtn.interactive = true;
playagainBtn.buttonMode = true;
playagainBtn.visible = false;
//Reset all the values
playagainBtn.click = playagainBtn.tap = function() {
    if (WAIT > WAIT_THRESHOLD) {
        WAIT = 0;
        STAGE = 0;
        restartStage();
        stageText.text = "Stage 1: Fry";
        stageText.style.stroke = "#000077";
        STARTED = true;
        playagainBtn.visible = false;
        letsgoBtn.visible = true;
        instructions.visible = false;
    }//check wait
}//restart



/**********************************
 * Texts
 **********************************/
//Title
var title = new PIXI.Text('Salmon Struggles', titleStyle);
title.x = 80;
title.y = 70;
stage.addChild(title);

var clickText = new PIXI.Text('Click to start', clickStyle);
clickText.x = 150;
clickText.y = 300;
stage.addChild(clickText);

//Food text
var foodText = new PIXI.Text("", hudStyle);
foodText.x = 200;
foodText.y = 5;
stage.addChild(foodText);

//Stage text
var stageText = new PIXI.Text("Stage 1: Fry", hudStyle);
stageText.x = 5;
stageText.y = 5;
stageText.visible = false;
stage.addChild(stageText);

//Bird Alert warning text
var warning = new PIXI.Text("", warningStyle);
warning.x = 170;
warning.y = 50;
stage.addChild(warning);

//Low Flow warning text
var lowflowText = new PIXI.Text("Low Flow!", hudStyle);
lowflowText.x = 350;
lowflowText.y = 5;
lowflowText.style.stroke = '#FF0000';
lowflowText.style.strokeThickness = 4;
lowflowText.visible = false;
stage.addChild(lowflowText);

/**********************************
 * Containers for text
 **********************************/
//post death summary container
var summary = new PIXI.Graphics();
//rectangle
summary.lineStyle(2, 0xFF00FF, 1);
summary.beginFill(0xFF00BB, 0.35);
summary.drawRoundedRect(30, 35, WIDTH - 60, 150, 15);
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

//instructions container
var instructions = new PIXI.Graphics();
//rectangle
instructions.lineStyle(2, 0x3366FF, 1);
instructions.beginFill(0x3399FF, 0.35);
instructions.drawRoundedRect(30, 35, WIDTH - 60, HEIGHT - 100, 15);
instructions.endFill();
//text placed in the instructions container
var message2 = new PIXI.Text("This is the story of Sam the Salmon. Baby Salmon, Fry, Salmon eat smaller fish and bugs to get bigger.\n\nEat 5 pieces of food while avoiding the debris.", messageStyle);
message2.x = 40;
message2.y = 40;
//add contents to the instructions
instructions.addChild(letsgoBtn); //add restart button
instructions.addChild(playagainBtn); //add restart button
instructions.addChild(message2); //add cause of death
instructions.visible = false;
stage.addChild(instructions); //add dialog to stage




/**********************************
 * Animate
 **********************************/
animate();

function animate() {
    requestAnimationFrame(animate);

    if(STARTED) {
        if( fish.airTime > AIR_THRESHOLD) {
            CAUSE = "Bird";
            DEAD = true;
        }//death by bird
        else if(fish.position.y > HEIGHT){
            CAUSE = "Ground";
            DEAD = true;
        }//death by deep water
        else if(!DEAD){


            for (var i = 0; i < OBSTACLES.length; i++) {

                if(OBSTACLES[i].x < -OBST_WIDTH*2){
                    OBSTACLES.shift();
                }//remove obstacles that have passed

                //Low flow logic for second stage

                if(STAGE == 1 && (FOOD_COUNT % 3 == 0)) {
                    LOW_FLOW = true;
                    lowflowText.visible = true;
                }//turn on low flow
                else {
                    LOW_FLOW = false;
                    lowflowText.visible = false;
                }//turn off low flow


                if(LOW_FLOW && (STAGE == 1))
                    OBSTACLES[i].position.x -= 2;
                else
                    OBSTACLES[i].position.x -= 4;

                if(i == OBSTACLES.length - 1 && OBSTACLES[i].position.x <= FISH_OFFSET){
                    spawnObstacle();

                }//check if its time to add new obstacle by checking last obstacle's position

                if(OBSTACLES[i].position.x + OBST_WIDTH/2 >= FISH_OFFSET - fish.width/2 && OBSTACLES[i].position.x - OBST_WIDTH/2 <= FISH_OFFSET + fish.width/2){
                    if((fish.position.y - fish.height/2) < OBSTACLES[i].position.y + OBSTACLES[i].height/2 && (fish.position.y + fish.height/2) > OBSTACLES[i].position.y - OBSTACLES[i].height/2){
                        if(OBSTACLES[i].type != "Food"){
                            CAUSE = OBSTACLES[i].type;
                            DEAD = true;
                        }//hit into something bad
                        else{
                            FOOD_COUNT += 1;
                            console.log(STAGE);
                            if(FOOD_COUNT == FOOD_REQ[STAGE]) {

                                FOOD_COUNT = 0;

                                if (STAGE < 3) {
                                    STAGE += 1;

                                    switch(STAGE){
                                        case(1):
                                            stageText.text = "Stage 2: Smolt";
                                            stageText.style.stroke = "#007700";
                                            message2.text = "Sam is now a Smolt, a teenage Salmon.\n\nHe now needs to avoid big fish, low water flow, nets, and high temperatures.\n\nEat 10 pieces of food to survive.";
                                            break;
                                        case(2):
                                            stageText.text = "Stage 3: Adult";
                                            stageText.style.stroke = "#770000";
                                            message2.text = "Sam is now an adult. Salmon swim back to where to they were born to reproduce.\n\n Sam now needs to face dams.\n\n Eat 15 pieces of food to survive.";
                                            break;
                                        case(3):
                                            stageText.text = "Life cycle complete";
                                            stageText.style.stroke = "#550055";
                                            message2.text = "Sam made it back to where he was born and reproduces with a female salmon. His arduous journey is over but a new generation of Salmon live on.\n\nTHE END";
                                            letsgoBtn.visible = false;
                                            playagainBtn.visible = true;
                                            break;
                                    }//update Stage text

                                }//stage up

                                STARTED = false;
                                instructions.visible = true; //show instructions

                            }//check if met food requirements to start new stage

                            if(STAGE == 3) {
                                foodText.text = "Food: " + FOOD_REQ[STAGE-1] + "/" + FOOD_REQ[STAGE-1];
                            }//update text only when needed
                            else{
                                foodText.text = "Food: " + FOOD_COUNT + "/" + FOOD_REQ[STAGE];
                            }

                            OBSTACLES[i].visible = false;
                            OBSTACLES.splice(i, 1);
                            spawnObstacle();
                        }//hit into food
                    }//hit
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
                case "Bird":
                    message.text = "You were eaten by a hawk! Being in the air makes you a vulnerable target to birds.";
                    break;
                case "Ground":
                    message.text = "Death by cuttlefish."
                    break;
                case "Dam":
                    message.text = "You swam headfirst into a Dam."
                    break;
                case "Debris":
                    message.text = "You swam into debris."
                    break;
            }//switch

            STARTED = false;
            restartBtn.visible = true;
            warning.visible = false;
            summary.visible = true;
        }//check if died

    }//game started

    if(!STARTED && instructions.visible == true){
        WAIT++;
    }//wait

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

function spawnObstacle(){
    //add new random obstacles
    var numTypes = 0;
    switch(STAGE){
        case 0:
            numTypes = 2;
            break;
        case 1:
            numTypes = 2;
            break;
        case 2:
            numTypes = 3;
            break;
    }//switch

    var selection = Math.floor(numTypes * Math.random());
    switch(selection) {
        case 0:
            makeFood();
            break;
        case 1:
            makeDebris();
            if(STAGE == 2)
                makeFood();
            break;
        case 2:
            makeDam();
            break;
    }//switch
}//spawn random obstacle

function makeFood(){
    //console.log((HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2));
    var rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
    //console.log("added food at " + rand_y);
    addNewObs(WIDTH, rand_y, 32, 32, "Food");
}//make food

function makeDebris(){
    //console.log((HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2));
    var rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
    //console.log("added debris at " + rand_y);
    addNewObs(WIDTH, rand_y, OBST_WIDTH, OBST_HEIGHT, "Debris");
}//make Debris

function makeDam(){
    addNewObs(WIDTH, HEIGHT/2 + 200, OBST_WIDTH, HEIGHT, "Dam");
    addNewObs(WIDTH+OBST_WIDTH, HEIGHT/2 + 150, OBST_WIDTH, HEIGHT, "Dam");
    addNewObs(WIDTH+OBST_WIDTH*2, HEIGHT/2 + 70, OBST_WIDTH, HEIGHT, "Dam");
}//make Dam

function restartStage(){
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
    FOOD_COUNT = 0;
    foodText.text = "Food: " + FOOD_COUNT + "/" + FOOD_REQ[STAGE];
    warning.visible = true;
    makeFood();
}//restart stage