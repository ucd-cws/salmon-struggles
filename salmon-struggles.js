/**
 * Created by Lawrence on 8/11/2016.
 */

/**
 * TODO:
 * -Fix Deprecation Warning
 *
 * -Add large mouth bass for Smolt and Adult stages
 * -Add Catfish for Smolt and Adult stages
 * -Find a better way to do collision detection.
 * -Prevent dam from appearing if jumped over requirement
 * -Add water rippling effect
 *
 * Long term
 * -Implement Temperature as way of dying
 * -Getting lost in the delta
 * -Hatchery vs. Wildfish
 * -Choose own story
 * -Add pumps
 * -Sound effects
 * -Different difficulties
 * -Enhanced bird alert
 */

/**
 * DEBUG MODE
 * -Debug offers only 2 food requirements per stage
 * -Press up arrow to add food. You can change what this does in the up.press = function() {} definition
 * -Debug mode is good for showing the whole game in a short amount of time.
 */
var DEBUG = false;

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
var STAGE = 0; //what stage player is on (Fry, Smolt, Adult, Spawning Adult)
var FOOD_COUNT = 0;
if(DEBUG){
    var FOOD_REQ = [2, 2, 2];
}//debug on
else{
    var FOOD_REQ = [5, 8, 10];
}//normal
//var LOW_FLOW = false;
var WAIT = 0; //used to prevent user from clicking when instructions opened
var WAIT_THRESHOLD = 35;//how long to wait before user can press Buttons
var DAMS_JUMPED = 0;
var DAMS_REQ = 5; //dams needed to jump over to make it to spawning grounds

//Stage Macros
var FRY = 0;
var SMOLT = 1;
var ADULT = 2;
var SPAWNING_ADULT = 3;

//Text
var s1Text = "This is the story of Sam the Salmon. Baby Salmon, Fry, eat things like Fly Larvae and Zooplankton to get bigger." +
    "\n\nEat 5 Orange Zooplankton while avoiding the obstacles." +
    "\n\n\n\n - Keep clicking to swim upwards -";
var s2Text = "Sam is now a Smolt, a teenage Salmon. Smolt Salmon eat Dragonfly Nymphs (babies), Stone Flies, and Worms." +
    "\n\nSam's scales changed as a he migrates to the delta/ocean. It is here where about 90% of Salmon die. He now needs to be aware of big fish, hooks, and low water flow." +
    "\n\nEat 8 worms to survive.";
var s3Text = "Sam is now an adult and has made it to the ocean. This is where Salmon spend most of their life." +
    "\n\nHere they face different predators such as Orcas (Killer Whales) and Seals. Adult salmon eat other fish, squid, and shrimp." +
    "\n\nEat 10 shrimp to survive.";
var s4Text = "Sam is now an adult and managed to survive two years in the ocean. Salmon swim back to the freshwater where to they were born to reproduce. " +
    "Sam developed a hooked jaw (Kype) and his skin turned red to notify his readiness to spawn. " +
    "\n\nAdult Salmon do not eat during spawning season. Instead, they feed off their bodily reserves. Sam now needs to jump over dams." +
    "\n\n Jump over 5 Dams to make it home!";
var endText = "Sam made it back to where he was born and reproduces with a female salmon. He is now a kelt." +
    "\n\nSome kelt survive and make it back to the ocean (about 5%). Sadly, Sam is not one of them. His's arduous journey is over but a new generation of Salmon live on." +
    "\n\n                     - THE END -";

//Swapping Textures
var fryTexture = PIXI.Texture.fromImage('textures/fry.png');
var smoltTexture = PIXI.Texture.fromImage('textures/smolt.png');
var adultTexture = PIXI.Texture.fromImage('textures/adult.png');
var spawningAdultTexture = PIXI.Texture.fromImage('textures/adult2.png');
var surface = PIXI.Texture.fromImage('textures/sky.png');
var surface2 = PIXI.Texture.fromImage('textures/sky2.png');

//sounds
var swimSound = loadAudio("audio/splash.wav");

function loadAudio(uri){
    var audio = new Audio();
    audio.src = uri;
    return audio;
}

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
        makeDebris(); //add a starting obstacle
        stageText.visible = true;
        updateObjectiveText();
    }//not yet started game
    else if (STARTED) {
        swimSound.play();
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
var tilingSurface = new PIXI.extras.TilingSprite(surface, WIDTH, HEIGHT);
tilingSurface.texture = surface;
tilingSurface.height = WATER_LEVEL;
stage.addChild(tilingSurface);

/**********************************
 * Ground
 **********************************/
var sand = new PIXI.Texture.fromImage('textures/sand.png');
var tilingGround = new PIXI.extras.TilingSprite(sand, WIDTH, HEIGHT);
tilingGround.width = WIDTH;
tilingGround.height = GROUND_HEIGHT;
tilingGround.position.x = 0;
tilingGround.position.y = HEIGHT - GROUND_HEIGHT;
stage.addChild(tilingGround);

/**********************************
 * Fish
 **********************************/
var fish = new PIXI.Sprite(fryTexture);
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
        if(STAGE == FRY){
            var food = new PIXI.Sprite.fromImage('textures/zooplankton.png');
        }//zooplankton as food
        else if(STAGE == SMOLT){
            var food = new PIXI.Sprite.fromImage('textures/worm.png');
        }//worm as food
        else if(STAGE == ADULT){
            var food = new PIXI.Sprite.fromImage('textures/shrimp.png');
            w = 43;
            h = 16;
        }//shrimp as food
        else{
            var food = new PIXI.Sprite.fromImage('textures/zooplankton.png');
        }//else

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
    else if(type == "Hook"){
        var hook = new PIXI.Sprite.fromImage('textures/hook.png');
        hook.position.x = x + w;
        hook.position.y = y;
        hook.width = w;
        hook.height = h;
        hook.type = type;
        hook.anchor.x = 0.5;
        hook.anchor.y = 0.5;

        //Add to container
        obst.addChild(hook);

        //Push to array so we can track it later
        OBSTACLES.push(hook);
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
    else if(type == "Orca"){
        var orca = new PIXI.Sprite.fromImage('textures/orca.png');
        orca.position.x = x + w;
        orca.position.y = y;
        orca.width = w;
        orca.height = h;
        orca.type = type;
        orca.anchor.x = 0.5;
        orca.anchor.y = 0.7; //anchor near bottom

        //Add to container
        obst.addChild(orca);

        //Push to array so we can track it later
        OBSTACLES.push(orca);
    }
    else if(type == "Seal"){
        var orca = new PIXI.Sprite.fromImage('textures/seal.png');
        orca.position.x = x + w;
        orca.position.y = y;
        orca.width = w;
        orca.height = h;
        orca.type = type;
        orca.anchor.x = 0.5;
        orca.anchor.y = 0.5; //anchor near bottom

        //Add to container
        obst.addChild(orca);

        //Push to array so we can track it later
        OBSTACLES.push(orca);
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
    strokeThickness : 4,
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
    strokeThickness : 4,
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
        fish.texture = fryTexture;
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
var objectiveText = new PIXI.Text("", hudStyle);
objectiveText.x = 200;
objectiveText.y = 5;
stage.addChild(objectiveText);

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

                    if(OBSTACLES[i].type == "Dam") {
                        DAMS_JUMPED++;
                        updateObjectiveText();

                        if (DAMS_JUMPED/3 == DAMS_REQ) {
                            stageText.text = "Life cycle complete";
                            stageText.style.stroke = "#550055";
                            message2.text = endText;
                            letsgoBtn.visible = false;
                            playagainBtn.visible = true;

                            STARTED = false;
                            instructions.visible = true; //show instructions
                        }//made required jumps
                    }//jumped over dam pillar

                }//remove obstacles that have passed

                //Low flow logic for smolt stage
                /*if(STAGE == SMOLT && (FOOD_COUNT % 3 == 0)) {
                    LOW_FLOW = true;
                    lowflowText.visible = true;
                }//turn on low flow
                else {
                    LOW_FLOW = false;
                    lowflowText.visible = false;
                }//turn off low flow*/


                /*if(LOW_FLOW && (STAGE == SMOLT)) {
                    if(OBSTACLES[i].type == "Striped Bass"){
                        OBSTACLES[i].position.x -= 3.5;
                    }//predators will move faster
                    else{
                        OBSTACLES[i].position.x -= 2.5;
                    }//other
                }//low flow
                else {*/
                if(OBSTACLES[i].type == "Striped Bass"){
                    OBSTACLES[i].position.x -= 5;
                }//bass will move faster
                else if(OBSTACLES[i].type == "Orca"){
                    OBSTACLES[i].position.x -= 3.5;
                }//bass will move faster
                else if(OBSTACLES[i].type == "Seal"){
                    OBSTACLES[i].position.x -= 3.25;
                }//bass will move faster
                else{
                    OBSTACLES[i].position.x -= 4;
                }//other
                //}//normal


                if(OBSTACLES[i].type == "Striped Bass"){
                    OBSTACLES[i].position.y += ((WATER_LEVEL + WATER_LEVEL/2) - OBSTACLES[i].position.y)/(WIDTH/2);
                }//if predator, make it go towards middle of water

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
                        break;
                    case "Striped Bass":
                        BUFFER_X = 30;
                        BUFFER_Y = 30;
                        break;
                    case "Dam":
                        BUFFER_X = 15;
                        BUFFER_Y = 15;
                        break;
                    case "Hook":
                        BUFFER_X = 15;
                        BUFFER_Y = 30;
                        break;
                    case "Orca":
                        BUFFER_X = 80;
                        BUFFER_Y = 130;
                        break;
                    case "Seal":
                        BUFFER_X = 35;
                        BUFFER_Y = 40;
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
                                        case(SMOLT):
                                            fish.texture = smoltTexture;
                                            stageText.text = "Stage 2: Smolt";
                                            stageText.style.stroke = "#007700";
                                            message2.text = s2Text;
                                            WATER_LEVEL = 300;
                                            tilingSurface.texture = surface2;
                                            tilingSurface.height = WATER_LEVEL;
                                            break;
                                        case(ADULT):
                                            fish.texture = adultTexture;
                                            stageText.text = "Stage 3: Adult";
                                            stageText.style.stroke = "#770000";
                                            message2.text = s3Text;
                                            WATER_LEVEL = 100;
                                            tilingSurface.texture = surface;
                                            tilingSurface.height = WATER_LEVEL;
                                            break;
                                        case(SPAWNING_ADULT):
                                            fish.texture = spawningAdultTexture;
                                            stageText.text = "Stage 4: Spawning";
                                            stageText.style.stroke = "#990000";
                                            message2.text = s4Text;
                                            break;
                                    }//update Stage text

                                }//stage up

                                //reset obstacles
                                obst.children = [];
                                OBSTACLES = [];
                                fish.speedY = FISH_SPEED;

                                STARTED = false;
                                instructions.visible = true; //show instructions

                            }//check if met food requirements to start new stage

                            updateObjectiveText();
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
                    message.text = "You were eaten by a Sturgeon!"
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
                case "Hook":
                    message.text = "You got hooked!"
                    break;
                case "Orca":
                    message.text = "You were eaten by an Orca!"
                    break;
                case "Seal":
                    message.text = "You were eaten by a Seal!"
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
        case FRY:
        case SMOLT:
        case ADULT:
            numTypes = 2;
            break;
        case SPAWNING_ADULT:
            numTypes = 3;
            break;
    }//switch

    var selection = Math.floor(numTypes * Math.random());
    switch(selection) {
        case 0:
            if(STAGE != SPAWNING_ADULT) {
                makeFood();
            }//only make food when not spawning adult
            else{
                makeDebris();
            }//else
            break;
        case 1:
            makeDebris();
            break;
        case 2:
            if(DAMS_JUMPED/3 != DAMS_REQ){
                makeDam();
            }//only make the required amount of dams
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
        case FRY:
            numTypes = 1;
            break;
        case SMOLT:
            numTypes = 3;
            break;
        case ADULT:
        case SPAWNING_ADULT:
            numTypes = 3;
            break;
    }//switch

    var selection = Math.floor(numTypes * Math.random());

    switch(selection) {
        case 0:
            addNewObs(WIDTH, rand_y, 130, 123, "Net");
            break;
        case 1:
            if(STAGE == SMOLT) {
                addNewObs(WIDTH, rand_y, 204, 96, "Striped Bass");
                rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
                addNewObs(WIDTH, rand_y, 204, 96, "Striped Bass");
            }//add bass if smolt
            else if(STAGE == ADULT) {
                if (FOOD_COUNT % 2 == 0) {
                    addNewObs(WIDTH, rand_y, 850, 357, "Orca");
                }//add orca
                else {
                    addNewObs(WIDTH, rand_y, 391, 128, "Seal");
                    rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
                    addNewObs(WIDTH, rand_y, 32, 32, "Food");
                }//add seal and food
            }//add orca and seal if adult
            else{
                addNewObs(WIDTH, rand_y, 32, 71, "Hook");
                rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
                addNewObs(WIDTH, rand_y, 130, 123, "Net");
                break;
            }//spawning adult
            break;
        case 2:
            addNewObs(WIDTH, rand_y, 32, 71, "Hook");
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
    DAMS_JUMPED = 0;
    updateObjectiveText();
    warning.visible = true;
    makeDebris();
}//restart stage

function updateObjectiveText(){
    if(STAGE != SPAWNING_ADULT)
        objectiveText.text = "Food: " + FOOD_COUNT + "/" + FOOD_REQ[STAGE];
    else
        objectiveText.text = "Dams Jumped: " + Math.floor(DAMS_JUMPED / 3) + "/" + DAMS_REQ;
}//updates text in hud



function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };
    //The `upHandler`
    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };
    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}
var up = keyboard(38);
up.press = function() {
    if(DEBUG) {
        makeFood();
        updateObjectiveText();
        //var rand_y = Math.floor(Math.random() * (HEIGHT - WATER_LEVEL - GROUND_HEIGHT/2)) + WATER_LEVEL; //adjust rand_y to spawn only in a range
        //addNewObs(WIDTH, rand_y, 391, 128, "Seal");

    }
};