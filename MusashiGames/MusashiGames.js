const GAME_STATE_NEW = 'New';
const GAME_STATE_START = 'START';
const GAME_STATE_PAUSE = 'PAUSE';
const GAME_STATE_END = 'END';

let gameNextStageFlag = "lose";
let muHeadState = 'Normal';

//Audio
let vegAudio = new Audio("Audio/vegAudio.wav");
vegAudio.volume = 0.3;
let chickenAudio = new Audio('Audio/chickenAudio.wav');
chickenAudio.volume = 0.3;
let lemonAudio = new Audio('Audio/lemonAudio.wav');
lemonAudio.volume = 0.3;

// Canvas Sizes and Object Sizes
const MAXCOL = 5;
const MAXROW = 4;

//Object Image
const MUHEADIMG = new Image();
MUHEADIMG.src = "IMG/MuGameHead.png";

const STEAK = new Image();
STEAK.src = "IMG/ChickenLogo.png";

const GRASS = new Image();
GRASS.src = "IMG/Grass.png";

const LEMON = new Image();
LEMON.src = "IMG/Lemon.png";


//NewBie Practise - global variable of current instance
let musashiCatchGameStatus;

class GameStatus {
    mainCanvas;
    ctx;
    gameState;
    #gameObjects;
    playerInfo;
    previousFrameTimestamp;
    nextFrameTimestamp;

    constructor() {
        this.gameState = '';
        this.#gameObjects = [];
        this.playerInfo = {
            targetScore: 10,
            score: 0,
            lives: 3,
            level: 1
        };
        this.previousFrameTimestamp = performance.now();
        this.nextFrameTimestamp = performance.now();
    }

    addGameObject(gameObject) {
        return this.#gameObjects.push(gameObject) - 1;
    }

    removeGameObject(gameObject) {
       return this.#gameObjects.splice(this.#gameObjects.indexOf(gameObject),1);
    }

    removeGameObjectByIdx(gameObjectIdx) {
       return this.#gameObjects.splice(gameObjectIdx,1);
    }

    getGameObject(gameObjectIndex) {
        return this.#gameObjects[gameObjectIndex];
    }

    forEachGameObject(processFunction) {
       this.#gameObjects.forEach(processFunction);
    }
}

const MOVEPERHEIGHT= 10;
const MAXGAMEHEIGHT = MAXROW * MOVEPERHEIGHT;

class GameObjectType {
    static #_MUSASHI_HEAD = 'MUSASHI_HEAD';
    static #_STEAK = 'STEAK';
    static #_GRASS = 'GRASS';
    static #_LEMON = 'LEMON';

    static get MUSASHI_HEAD(){ return this.#_MUSASHI_HEAD; }
    static get STEAK(){ return this.#_STEAK; }
    static get GRASS(){ return this.#_GRASS; }
    static get LEMON(){ return this.#_LEMON; }
}

class GameObject {
    constructor(type, positionX, positionY, velocityX, velocityY, size, renderingFunction) {
        this.type = type;
        this.objCanvas = document.createElement("canvas");
        this.objCanvas.width = size;
        this.objCanvas.height = size;
        this.positionX = positionX;
        this.positionY = positionY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.maxSpeed = 10;
        this.renderingFunction = renderingFunction;
    }

    calculateMove(timeElasped) {

    }
}

function initialiseGame() {
    // 1. initialise all nessary game status of the game
    musashiCatchGameStatus = new GameStatus();
    musashiCatchGameStatus.mainCanvas = document.getElementById("myCanvas"); 
    musashiCatchGameStatus.ctx = musashiCatchGameStatus.mainCanvas.getContext("2d");
    musashiCatchGameStatus.ctx.imageSmoothingEnabled = true;
    musashiCatchGameStatus.ctx.imageSmoothingQuality = 'high'; 
    
    // 2. update game state to 'New'
    musashiCatchGameStatus.gameState = GAME_STATE_NEW;
    musashiCatchGameStatus.playerInfo.score = 0;
    musashiCatchGameStatus.playerInfo.lives = 3;
    musashiCatchGameStatus.playerInfo.level = 1;

    //Create controllable Musashi
    this.canvas = document.createElement("canvas");

    let mushHead = new GameObject(GameObjectType.MUSASHI_HEAD, 2, MAXGAMEHEIGHT-MOVEPERHEIGHT, 3, 0, 0, (objCanvas)=>{
        objCanvas.width = MUHEADIMG.width;
        objCanvas.height = MUHEADIMG.height;
        var ctx = objCanvas.getContext("2d");
        ctx.clearRect(0, 0, objCanvas.width, objCanvas.height);
        ctx.drawImage(MUHEADIMG, 0, 0);
    });
    let muHeadIdx = musashiCatchGameStatus.addGameObject(mushHead);
    musashiCatchGameStatus.playerInfo.musashiHeadIdx = muHeadIdx;

    //create dropping game Object
    generateRandomIdx(musashiCatchGameStatus);
}

function startGame() {
    // Update the game state to 'Start'
    musashiCatchGameStatus.gameState = GAME_STATE_START;
    // 2. start the gamne loop
    gameInput(musashiCatchGameStatus);
    musashiCatchGameStatus.previousFrameTimestamp = performance.now();
    gameMainLoop();
    changeVisibility("gameStats", "visible");
    changeVisibility("lives", "visible");
    changeVisibility("score", "visible");
    musashiCatchGameStatus.mainCanvas.style.visibility = "visible";
    const OC = document.getElementsByClassName("originalCanvas");
    Array.from(OC).forEach((item) => {
        item.style.display = "none";
    });
    const FOOTER = document.getElementsByTagName("footer");
    Array.from(FOOTER).forEach((item) => {
        item.style.visibility = "hidden";
    });
}

function generateRandomIdx(gameStatus){
    let ranGameIdx = Math.round(Math.random()* 2);
    if (ranGameIdx == 0){

        return generateGameObj(gameStatus, GameObjectType.STEAK, STEAK);
    }else if (ranGameIdx == 1){
        return generateGameObj(gameStatus, GameObjectType.GRASS, GRASS);
    }else{
        return generateGameObj(gameStatus, GameObjectType.LEMON, LEMON);
    }

}

function generateGameObj(gameStatus, GameObjType, img) {
    let objSpeed = gameStatus.playerInfo.score + 15;
    let ranGameObj = new GameObject(GameObjType, Math.round(Math.random()* (MAXCOL-1)), 0, 0, objSpeed, 140, (objCanvas)=>{
        var ctx = objCanvas.getContext("2d");
        objCanvas.width = img.width;
        objCanvas.height = img.height;
        ctx.clearRect(0, 0, objCanvas.width, objCanvas.height);
        ctx.drawImage(img, 0, 0);
    })
    gameStatus.addGameObject(ranGameObj);
    return gameStatus;

   
}
function pauseGame() {
    // optional
    // 1. stop the game loop if needed
    // 2. update the game state to 'Pause'
    if (musashiCatchGameStatus.gameState != GAME_STATE_PAUSE){
        musashiCatchGameStatus.gameState = GAME_STATE_PAUSE;
    }else{
        musashiCatchGameStatus.previousFrameTimestamp = performance.now();
        musashiCatchGameStatus.gameState = GAME_STATE_START;
    }
    
}

function stopGame(gameStatus, winLose) {
    // 1. stop the game loop if needed
    // 2. update the game state to 'Stop'
    if (winLose == "win"){
        gameStatus.gameState = GAME_STATE_END;
        document.getElementById("gameOverIcon").src = "IMG/MuVeg.png";
        document.getElementById("gameOverCaption").innerHTML = "You Win!";
        document.getElementById("tryAgainBtn").innerHTML = "Next Level";
        changeVisibility("gameOver", "visible");
        changeVisibility("tryAgainBtn", "visible");
        gameNextStageFlag = "win";
        // nextLevel(gameStatus);
    }else{
        gameStatus.gameState = GAME_STATE_END;
        document.getElementById("gameOverIcon").src = "IMG/MuLemon.png";
        document.getElementById("gameOverCaption").innerHTML = "Game Over";
        document.getElementById("tryAgainBtn").innerHTML = "Try Again";
        changeVisibility("gameOver", "visible");
        changeVisibility("tryAgainBtn", "visible");
        gameNextStageFlag = "lose";
        console.log(gameNextStageFlag);
    }
    
}


function gameMainLoop() {
    let gameStatus = musashiCatchGameStatus;
    requestAnimationFrame(gameMainLoop);
    let currentTime = performance.now();
    if(currentTime - gameStatus.previousFrameTimestamp > 33) {
        if (gameStatus.gameState == GAME_STATE_START){
            //Update next frame timestamp to now
            gameStatus.nextFrameTimestamp = currentTime;
            let timeElasped = gameStatus.nextFrameTimestamp - gameStatus.previousFrameTimestamp;
            //Calculate all movement, logic, score, etc...
            gameProcess(gameStatus, timeElasped);
            //Render the canvas of calculated result
            gameRendering(gameStatus.mainCanvas, gameStatus);
            //update previous frame timestamp to next frame timestamp
            gameStatus.previousFrameTimestamp = gameStatus.nextFrameTimestamp;
        }else if (gameStatus.gameState == GAME_STATE_PAUSE){
            gameRendering(gameStatus.mainCanvas, gameStatus);
        }
    }
}

function gameInput(gameStatus) {
    // get user input
    let muHead = gameStatus.playerInfo.musashiHeadIdx;
    let muHeadObj = gameStatus.getGameObject(muHead);
    addEventListener("keydown", (event) => {
        if(event.key == "ArrowLeft"){
            if(muHeadObj.positionX > 0){
                muHeadObj.positionX --;
                console.log("Musashi moved Left");
            }
        }else if(event.key == "ArrowRight"){
            if(muHeadObj.positionX < MAXCOL - 1){
                muHeadObj.positionX ++;
                console.log("Musashi moved Right");
            }
        }
    })
    // handle any logic related to user input
    // e.g. when user press 'LEFT', update the movement of the object to left
}

function gameProcess(gameStatus, timeElasped) {
    // 1. calucluate the position of all object in next frame
    let muHead = gameStatus.getGameObject(gameStatus.playerInfo.musashiHeadIdx);
    let muHeadPoY = muHead.positionY;
    let muHeadPoX = muHead.positionX;
    let objToBeRemoved = [];
    let genGameObjFlag = false;
    gameStatus.forEachGameObject((object) => {
        if (object.type != GameObjectType.MUSASHI_HEAD){
            object.positionY += object.velocityY * (timeElasped) /1000;
            if (object.positionY >= (muHeadPoY - MOVEPERHEIGHT) && object.positionX == muHeadPoX){
                genGameObjFlag = true;
                objToBeRemoved.push(object);
                if (object.type == GameObjectType.GRASS){
                    vegAudio.play();
                    muHeadToggle('Happy');
                    gameStatus.playerInfo.score++;
                    document.getElementById("scoreValue").innerHTML = gameStatus.playerInfo.score;
                }else if(object.type == GameObjectType.LEMON){
                    muHeadToggle('Sad');
                    lemonAudio.play();
                    if(gameStatus.playerInfo.score > 0){
                        gameStatus.playerInfo.score--;
                        document.getElementById("scoreValue").innerHTML = gameStatus.playerInfo.score;
                    }
                    if(gameStatus.playerInfo.lives == 3){
                        gameStatus.playerInfo.lives--;
                        changeVisibility("lemon1", "hidden");
                    }else if(gameStatus.playerInfo.lives == 2){
                        gameStatus.playerInfo.lives--;
                        changeVisibility("lemon2", "hidden");
                    }else if(gameStatus.playerInfo.lives == 1){
                        gameStatus.playerInfo.lives--;
                        changeVisibility("lemon3", "hidden");
                        stopGame(gameStatus, "lose"); 
                    }
                }else if(object.type == GameObjectType.STEAK){
                    chickenAudio.play();
                }
                if(gameStatus.playerInfo.score >= gameStatus.playerInfo.targetScore){
                    stopGame(gameStatus, "win");
                }
            }else if (object.positionY >= MAXGAMEHEIGHT){
                //Remove gameObjects
                objToBeRemoved.push(object);
                genGameObjFlag = true;
            }
        }
     
    });
    //Detect and handle any collision
    objToBeRemoved.forEach((object) => {
        gameStatus.removeGameObject(object);
    });

    if (genGameObjFlag == true){
        generateRandomIdx(gameStatus);
        genGameObjFlag = false;
    }
    // notes: clauculate the postion base on the time elasped between previous frame and next frame
}

function gameRendering(canvas, gameStatus) {
    //Render the canvas base on the current status of the game
    if (gameStatus.gameState == GAME_STATE_START) {
        //Muhead Render
        let ctx = gameStatus.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (window.innerWidth > window.innerHeight) {
            canvas.width = window.innerWidth * 0.6
            canvas.height = window.innerWidth * 0.35;
        }else {
            canvas.width = window.innerWidth * 0.6
            canvas.height = window.innerWidth * 0.35;
        }
        let canvasWidthUnit = canvas.width/MAXCOL;
        let canvasHeightUnit = canvas.height/MAXGAMEHEIGHT;
        let objHeight = canvas.height/MAXROW;
        gameStatus.forEachGameObject((gameObject) => {
            gameObject.renderingFunction(gameObject.objCanvas);
            ctx.drawImage(gameObject.objCanvas, 
                gameObject.positionX * canvasWidthUnit, gameObject.positionY * canvasHeightUnit,
                canvasWidthUnit, objHeight);
        });

    }else if(gameStatus.gameState == GAME_STATE_PAUSE){
        let ctx = gameStatus.ctx;
        console.log("paused 2");
        ctx.fillStyle = "rgba(16, 15, 15, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // 4. if game is ended(gameState = 'Stop'), render a ending screen
}

// Music Toggle
function toggleMute(){
    var homeMusicInstance = document.getElementById('musicBtn');
    homeMusicInstance.muted=!homeMusicInstance.muted;
    toggleMuteImg(homeMusicInstance.muted);

}
function autoplay(){
    var homeMusicInstance = document.getElementById('musicBtn');
    homeMusicInstance.volume = 0.2;
    homeMusicInstance.play();
}
function toggleMuteImg(muted){
    var muteIcon = document.getElementById('VOn');
    var muteIconHover = document.getElementsByClassName('vOnHover');
   if(muted==true){
    muteIcon.src = "IMG/VOff.png";
    Array.from(muteIconHover).forEach((item) => {
        item.src = "IMG/VOffHover.png";
    });
   }else{
    muteIcon.src = "IMG/VOn.png"
    Array.from(muteIconHover).forEach((item) => {
        item.src = "IMG/VOnHover.png";
    });
   }
}
function gameNextStage(){
    if (gameNextStageFlag == "lose"){
        console.log("reFresh Page");
        refreshPage();
    }else{
        console.log("next level");
        nextLevel(musashiCatchGameStatus);
    }
}
//Change HTML Variable
function docWrite(variable) {
    document.write(variable);
}

//Refresh Page
function refreshPage(){
    window.location.reload();
}

//Next Level
function nextLevel(gameStatus){
    console.log("next level to start");
    gameStatus.playerInfo.level++;
    let newLevel = gameStatus.playerInfo.level;
    console.log(newLevel);
    gameStatus.playerInfo.targetScore = newLevel * 10;
    document.getElementById("targetNum").innerHTML = gameStatus.playerInfo.targetScore;
    changeVisibility("gameOver", "hidden");
    changeVisibility("tryAgainBtn", "hidden");

    gameStatus.gameState = GAME_STATE_START;
    gameStatus.previousFrameTimestamp = performance.now();
    gameMainLoop();
}

//Change Mu Expression
function muHeadToggle(muHeadState){
    if (muHeadState == 'Happy') {
        MUHEADIMG.src = "IMG/MuVeg.png";
        setTimeout(() => {  MUHEADIMG.src = "IMG/MuGameHead.png"; }, 300);
    } else {
        MUHEADIMG.src = "IMG/MuLemon.png";
        setTimeout(() => {  MUHEADIMG.src = "IMG/MuGameHead.png"; }, 300);
    }
}

//Tutorial Tab
function closeTab(){
    changeVisibility("gameTutorial", "hidden");
}
function openTutorial(){
    changeVisibility("gameTutorial", "visible");
}

//Change Visibility
function changeVisibility(elementId, toggle){
    document.getElementById(elementId).style.visibility = toggle;
}