/**
 * Created by Lawrence on 8/11/2016.
 */


// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = PIXI.autoDetectRenderer(500, 600,{backgroundColor : 0x1099bb, antialias: true});

// add canvas to game area
document.getElementById("game").appendChild(renderer.view);

// Globals
var FISH_SPEED = 8;
var DESCENT_RATE = 0.4;
var STARTED = false;
var DEAD = false;
var CAUSE = 0; //cause of death

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;
stage.buttonMode = true;

// Mouse click
stage.mousedown = stage.touchstart = function(){
    if(!STARTED){
        STARTED = true;
        title.visible = false;
    }//not yet started game
    else if (STARTED)
    {
        fish.speedY = FISH_SPEED;
    }//game started
}; // click

//water background
var water = PIXI.Texture.fromImage('textures/water.png');
var tilingSprite = new PIXI.extras.TilingSprite(water, renderer.width, renderer.height);
stage.addChild(tilingSprite);

//fish
var fish = PIXI.Sprite.fromImage('textures/bunny.png');

fish.position.set(100,renderer.height/2);
fish.interactive = true;
fish.speedY = FISH_SPEED;
fish.downRate = DESCENT_RATE;
fish.airTime = 0;

stage.addChild(fish);
fish.pivot.x = 13;
fish.pivot.y = 18;

//Text
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

// Title
var title = new PIXI.Text('Salmon Struggles: The Story of Sam the Salmon',style);
title.x = 30;
title.y = 180;
stage.addChild(title);

//restart button
var restartBtn = new PIXI.Text("Restart", style);
restartBtn.x = 180;
restartBtn.y = 405;
restartBtn.interactive = true;
restartBtn.buttonMode = true;
//Reset all the values
restartBtn.click = restartBtn.tap = function() {
    fish.position.y = renderer.height/2;
    fish.speedY = FISH_SPEED;
    fish.airTime = 0;
    fish.rotation = 0;
    summary.visible = false;
    CAUSE = 0;
    STARTED = true;
    DEAD = false;
}//restart

// text placed in the summary container
var messageStyle = {
    font : '30px Arial',
    fill : '#F7EDCA',
    stroke : '#000000',
    strokeThickness : 0,
    wordWrap : true,
    wordWrapWidth : renderer.width - 80 //30 and 10 for one size * 2
};

var message = new PIXI.Text("", messageStyle);
message.x = 40;
message.y = 40;

// post death summary
var summary = new PIXI.Graphics();

// rectangle
summary.lineStyle(2, 0xFF00FF, 1);
summary.beginFill(0xFF00BB, 0.25);
summary.drawRoundedRect(30, 30, renderer.width - 60, renderer.height - 200, 15);
summary.endFill();

// add contents to the summary
summary.addChild(restartBtn); // add restart button
summary.addChild(message); // add cause of death
summary.visible = false;
stage.addChild(summary); //add dialog to stage

// start animating
animate();

function animate() {
    requestAnimationFrame(animate);

    if(STARTED) {
        console.log(fish.airTime);
        if( fish.airTime > 100) {
            CAUSE = 0;
            DEAD = true;
        }//death by bird
        else if(fish.position.y > renderer.height){
            CAUSE = 1;
            DEAD = true;
        }//death by deep water
        else if(!DEAD){
            // Animate water
            tilingSprite.tileScale.y = 0.6;
            tilingSprite.tilePosition.x -= 1;

            if(fish.position.y < 0){
                fish.airTime += 1;
            }// check if over water
            else{
                fish.airTime = 0;
            }// fish is under water

            // Let fish descend
            descend()
        }

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

    }// game started

    // render the container
    renderer.render(stage);
}// animate

function descend(){
    fish.speedY -= fish.downRate;
    fish.rotation += 0.1;
    fish.position.y -= fish.speedY;
}
