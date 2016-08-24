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
var DAM_WIDTH = 80;
var AIR_THRESHOLD = 130; //time units player can stay above water
var STAGE = 0; //what stage player is on (Fry, Smolt, Adult)
var FOOD_COUNT = 0;
var FOOD_REQ = [5, 10, 15];
//var FOOD_REQ = [2, 2, 2];
var LOW_FLOW = false;
var WAIT = 0; //used to prevent user from clicking when instructions opened
var WAIT_THRESHOLD = 35;//how long to wait before user can press Buttons

var s1Text = "This is the story of Sam the Salmon. Baby Salmon, Fry, eat things like Fly Larvae and Zooplankton to get bigger.\n\nEat 5 Orange Zooplankton while avoiding the nets.";
var s2Text = "Sam is now a Smolt, a teenage Salmon. Smolt need to eat Dragonfly Nymphs (babies), Stone Flies, and Worms.\n\nThis is also the time his scales fall off and he migrates to " +
    "the delta/ocean. He now needs to be aware of big fish and low water flow.\n\nEat 10 worms to survive.";
var s3Text = "Sam is now an adult and managed to survive in the ocean. Salmon swim back to where to they were born to reproduce.\n\n Adult salmon eat other fish, squid, and shrimp. Sam also now needs to face dams.\n\n Eat 15 pieces of food to survive.";
var endText = "Sam made it back to where he was born and reproduces with a female salmon. His arduous journey is over but a new generation of Salmon live on.\n\nTHE END";

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
        if (fish.rotation > -0.2) {
            fish.rotation -= 0.2;
        }//limit fish rotation

    }//game started
};//click

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
var fish = PIXI.Sprite.fromImage('textures/salmon.png');
fish.position.set(FISH_OFFSET,HEIGHT/2);
fish.interactive = true;
fish.speedY = FISH_SPEED;
fish.downRate = DESCENT_RATE;
fish.airTime = 0;

fish.pivot.x = 61;
fish.pivot.y = 24;
stage.addChild(fish);

/**********************************
 * Obstacles (Collision items)
 **********************************/
var obst = new PIXI.Container();
stage.addChild(obst);

function addNewObs(x, y, w, h, type){
    if(type == "Dam") {
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
    }//dam
    else if(type == "Net"){
        var net = new PIXI.Sprite.fromImage('textures/net.png');
        net.position.x = x + w;
        net.position.y = y;
        net.width = w;
        net.height = h;
        net.type = type;
        net.anchor.x = 0.5;
        net.anchor.y = 0.5;

        //Add to container
        obst.addChild(net);

        //Push to array so we can track it later
        OBSTACLES.push(net);
    }//net
    else if(type == "Food"){
        if(STAGE == 0){
            var food = new PIXI.Sprite.fromImage('textures/zooplankton.png');
        }//zooplankton as food
        else if(STAGE == 1){
            var food = new PIXI.Sprite.fromImage('textures/worm.png');
        }//worm as food
        else{
            var food = new PIXI.Sprite.fromImage('textures/zooplankton.png');
        }//

        food.position.x = x + w;
        food.position.y = y;
        food.width = w;
        food.height = h;
        food.type = type;
        food.anchor.x = 0.5;
        food.anchor.y = 0.5;

        //Add to container
        obst.addChild(food);

        //Push to array so we can track it later
        OBSTACLES.push(food);
    }
    else if(type == "Striped Bass"){
        var sBass = new PIXI.Sprite.fromImage('textures/striped_bass.png');
        sBass.position.x = x + w;
        sBass.position.y = y;
        sBass.width = w;
        sBass.height = h;
        sBass.type = type;
        sBass.anchor.x = 0.5;
        sBass.anchor.y = 0.5;

        //Add to container
        obst.addChild(sBass);

        //Push to array so we can track it later
        OBSTACLES.push(sBass);
    }

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
    font : 'bold 24px Arial',
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
var message2 = new PIXI.Text(s1Text, messageStyle);
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

                if(OBSTACLES[i].x < (OBSTACLES[i].width*-2)){
                    OBSTACLES.splice(i, 1);
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


                var BUFFER_X = 0;//used to fine tune collision detection
                var BUFFER_Y = 0;
                //fine tune collision detection based on current object type
                switch(OBSTACLES[i].type){
                    case "Net":
                        BUFFER_X = 50;
                        BUFFER_Y = 50;
                        message.text = "You swam into a Net!"
                        break;
                    case "Striped Bass":
                        BUFFER_X = 15;
                        BUFFER_Y = 30;
                        message.text = "You were eaten by a Striped Bass!"
                        break;
                }//switch


                //if in hit range in x axis
                if((OBSTACLES[i].position.x + OBSTACLES[i].width/2 - BUFFER_X) >= (fish.position.x - fish.width/2) &&
                    (OBSTACLES[i].position.x - OBSTACLES[i].width/2 + BUFFER_X) <= (fish.position.x + fish.width/2)){
                    //if in hit range in y axis
                    if((fish.position.y - fish.height/2 + BUFFER_Y) < (OBSTACLES[i].position.y + OBSTACLES[i].height/2) &&
                        (fish.position.y + fish.height/2 - BUFFER_Y) > (OBSTACLES[i].position.y - OBSTACLES[i].height/2)){
                        if(OBSTACLES[i].type != "Food"){
                            CAUSE = OBSTACLES[i].type;
                            DEAD = true;
                        }//hit into something bad
                        else{
                            FOOD_COUNT += 1;
                            if(FOOD_COUNT == FOOD_REQ[STAGE]) {

                                FOOD_COUNT = 0;

                                if (STAGE < 3) {
                                    STAGE += 1;

                                    switch(STAGE){
                                        case(1):
                                            stageText.text = "Stage 2: Smolt";
                                            stageText.style.stroke = "#007700";
                                            message2.text = s2Text;
                                            break;
                                        case(2):
                                            stageText.text = "Stage 3: Adult";
                                            stageText.style.stroke = "#770000";
                                            message2.text = s3Text;
                                            break;
                                        case(3):
                                            stageText.text = "Life cycle complete";
                                            stageText.style.stroke = "#550055";
                                            message2.text = endText;
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
                    message.text = "You were eaten by a Osprey! Being in the air makes you a vulnerable target to birds.";
                    break;
                case "Ground":
                    message.text = "Death by cuttlefish."
                    break;
                case "Dam":
                    message.text = "You swam into a Dam!"
                    break;
                case "Net":
                    message.text = "You swam into a Net!"
                    break;
                case "Striped Bass":
                    message.text = "You were eaten by a Striped Bass!"
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
    if(fish.rotation < 0.2) {
        fish.rotation += 0.004;
    }//limit fish descent
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
    var rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
    addNewObs(WIDTH, rand_y, 32, 32, "Food");
}//make food

function makeDebris(){
    var rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range

    //add new random obstacles
    var numTypes = 0;
    switch(STAGE){
        case 0:
            numTypes = 1;
            break;
        case 1:
            numTypes = 3;
            break;
        case 2:
            numTypes = 1;
            break;
    }//switch

    var selection = Math.floor(numTypes * Math.random());
    switch(selection) {
        case 0:
            addNewObs(WIDTH, rand_y, 130, 123, "Net");
            break;
        case 1:
            addNewObs(WIDTH, rand_y, 204, 96, "Striped Bass");
            break;
        case 2:
            addNewObs(WIDTH, rand_y, 130, 123, "Net");
            break;
    }//switch

    //create random predators, nets, and temperature fluctuations

}//make Debris

function makeDam(){
    addNewObs(WIDTH, HEIGHT/2 + 200, DAM_WIDTH, HEIGHT, "Dam");
    addNewObs(WIDTH+DAM_WIDTH, HEIGHT/2 + 150, DAM_WIDTH, HEIGHT, "Dam");
    addNewObs(WIDTH+DAM_WIDTH*2, HEIGHT/2 + 70, DAM_WIDTH, HEIGHT, "Dam");
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