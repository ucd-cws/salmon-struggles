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
var WATER_LEVEL = 100;
var OBSTACLES = []; //obstacles


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
stage.mousedown = stage.touchstart = function(){
    if(!STARTED){
        STARTED = true;
        title.visible = false;
    }//not yet started game
    else if (STARTED)
    {
        fish.speedY = FISH_SPEED;
    }//game started
};//click

/**********************************
 * Water Background
 **********************************/
var water = PIXI.Texture.fromImage('textures/water.png');
var tilingSprite = new PIXI.TilingSprite(water, WIDTH, HEIGHT);
stage.addChild(tilingSprite);

/**********************************
 * Surface
 **********************************/
var surface = new PIXI.Graphics();
surface.lineStyle(2, 0x0000FF, 1);
surface.beginFill(0xFF700B, 1);
surface.drawRect(0, 0, WIDTH, WATER_LEVEL);
stage.addChild(surface);

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
    var top = new PIXI.Sprite.fromImage('textures/bunny.png');
    var bot = new PIXI.Sprite.fromImage('textures/bunny.png');
    var pair = {};
    top.width = bot.width = 80;
    top.height = bot.height = 500;
    top.anchor.x = bot.anchor.x = 0.5;
    top.anchor.y = bot.anchor.y = 0.5;
    top.rotation = Math.PI;

    top.position.y = Math.floor(Math.random() * WIDTH);
    bot.position.y = top.height + top.position.y + 200;
    top.position.x = bot.position.x = WIDTH;

    obst.addChild(top);
    obst.addChild(bot);

    pair.top = top;
    pair.bot = bot;

    obst.addChild(top);
    obst.addChild(bot);
    OBSTACLES.push(obst);
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
    font : '30px Arial',
    fill : '#F7EDCA',
    stroke : '#000000',
    strokeThickness : 0,
    wordWrap : true,
    wordWrapWidth : WIDTH - 80 //30 and 10 for one size * 2
};

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
}//restart

/**********************************
 * Text and Messages
 **********************************/


//Title
var title = new PIXI.Text('Salmon Struggles: The Story of Sam the Salmon',style);
title.x = 30;
title.y = 180;
stage.addChild(title);

//text placed in the summary container
var message = new PIXI.Text("", messageStyle);
message.x = 40;
message.y = 40;

//post death summary
var summary = new PIXI.Graphics();

//rectangle
summary.lineStyle(2, 0xFF00FF, 1);
summary.beginFill(0xFF00BB, 0.25);
summary.drawRoundedRect(30, 30, WIDTH - 60, HEIGHT - 100, 15);
summary.endFill();

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
        console.log(fish.airTime);
        if( fish.airTime > 100) {
            CAUSE = 0;
            DEAD = true;
        }//death by bird
        else if(fish.position.y > HEIGHT){
            CAUSE = 1;
            DEAD = true;
        }//death by deep water
        else if(!DEAD){
            //Animate water
            tilingSprite.tileScale.y = 0.6;
            tilingSprite.tilePosition.x -= 1;

            for (var i = 0; i < OBSTACLES.length; i++) {
                OBSTACLES[i].top.position.x -= 4;
                OBSTACLES[i].bot.position.x -= 4;

            }//for
            if(OBSTACLES.length < 3){
                addNewObs();
            }

            if(fish.position.y < WATER_LEVEL){
                fish.airTime += 1;
            }//check if over water
            else{
                fish.airTime = 0;
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
                    message.text = "Death by deep water"
                    break;
            }//switch

            STARTED = false;
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
