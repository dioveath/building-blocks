window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;

  var LOADING = 0,
      MENU = 1,
      PLAYING = 2,
      GAMEOVER = 3;
  var currentState = LOADING;
  var dt = 0,
      previousTime = Date.now();
  var gameInterval;
  var needsReset = true;
  var firstTime = true;

  // gameplay elements
  var GRID_WIDTH = 6,
      GRID_HEIGHT = 6,
      GRID_SIZE = 20;
  var grids = [];

  //Scores
  var currentScore = 0,
      scoreIncrement = 20;

  //Blocks Essentials
  var allBlocksIndex = [];
  var currentBlock, nextBlock;
  var fallingTime = 0.5;
  var timer = fallingTime;

  var xGridIndex = 0;
  var yGridIndex = 0;
  var currentIndex = 0;
  var previousIndex = -1;
  var nextIndex = 0;
  var isAtlast = false;

  //input
  var pressingLeft = false,
      movedLeft = false,
      pressingRight= false,
      movedRight = false;

  //Menu objects
  var newGameRect = {
    x: -width/3 - width/16,
    y: -75,
    width: width/8,
    height: 30
  };
  var optionsRect = {
    x: -width/3 - width/16,
    y: -15,
    width: width/8,
    height: 30
  };
  var helpRect = {
    x: -width/3 - width/16,
    y: 45,
    width: width/8,
    height: 30
  };

  load();

  function load(){
    currentState = MENU;
    gameInterval = setInterval(update, 1000/60);
  }

  function update(){
    dt = (Date.now() - previousTime) / 1000;
    previousTime = Date.now();
    if(currentState == PLAYING){
      if(needsReset){
        resetGame();
      }
      updateGame();
      renderGame();
    }
    if(currentState == MENU){
      if(firstTime){
        resetGame();
        renderGame();
        firstTime = false;
      }
      renderGameMenu();
    }
    if(currentState == GAMEOVER){
      renderGameOver();
      currentState = MENU;
    }
  }


  function updateGame(){
    //Updating Inputs
    if(pressingLeft && !pressingRight && !movedLeft){
      if(currentBlock.xGridIndex % GRID_WIDTH != 0){
        var currentBIndex = currentBlock.yGridIndex * GRID_WIDTH + currentBlock.xGridIndex;
        if(grids[currentBIndex - 1] == 0){
          currentBlock.xGridIndex--;
        }
      }
      movedLeft = true;
    }
    if(pressingRight && !pressingLeft && !movedRight){
      if(((currentBlock.xGridIndex + 1) % GRID_WIDTH) != 0){
        var currentBIndex = currentBlock.yGridIndex * GRID_WIDTH + currentBlock.xGridIndex;
        if(grids[currentBIndex + 1] == 0){
          currentBlock.xGridIndex++;
        }
      }
      movedRight = true;
    }

    //Updating currentIndex
    //Basically Moving downwards
    xGridIndex = currentBlock.xGridIndex;
    yGridIndex = currentBlock.yGridIndex;
    currentIndex = yGridIndex * GRID_WIDTH + xGridIndex;
    nextIndex = (yGridIndex + 1) * GRID_WIDTH + xGridIndex;
    if(previousIndex != -1){
      grids[previousIndex] = 0;
    }
    grids[currentIndex] = 1;

    if(grids[nextIndex] == 0){
      isAtlast = false;
      timer -= dt;
      if(timer <= 0){
        currentBlock.yGridIndex ++;
        timer = fallingTime;
      }
    } else {
      timer -= dt;
      if(timer <= 0){
        isAtlast = true;
        previousIndex = -1;
        currentBlock.yGridIndex ++;
        timer = fallingTime;
        changeCurrentBlock(currentIndex);
        checkIfAligned();
      }
    }

    if(!isAtlast){
      previousIndex = currentIndex;
    }
  }

  //Resets to a new game;
  function resetGame(){
    for(var i = 0; i < GRID_HEIGHT; i++){
      for(var j = 0; j < GRID_WIDTH; j++){
        var bIndex = i * GRID_WIDTH + j;
        grids[bIndex] = 0;
      }
    }
    currentScore = 0;
    nextBlock = {
      xGridIndex: GRID_WIDTH/2,
      yGridIndex: 0,
      direction: []
    };
    currentBlock = {
      xGridIndex: GRID_WIDTH/2,
      yGridIndex: 0,
      direction: []
    };
    needsReset = false;
  }

  /*
  Check to see if any blocks are aligned
  */
  function checkIfAligned(){
    for(var i = 0; i < GRID_HEIGHT; i++){
      var isAligned = false,
          bIndex = 0;
      for(var j = 0; j < GRID_WIDTH - 1; j++){
        bIndex = i * GRID_WIDTH + j;
        if(grids[bIndex] == 1){
          if(grids[bIndex + 1] == 1){
            if(j == GRID_WIDTH - 2){
              isAligned = true;
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
      if(isAligned){
        currentScore += scoreIncrement;
        for(var j = 0; j < GRID_WIDTH; j++){
          bIndex = i * GRID_WIDTH + j;
          grids[bIndex] = 0;
        }
        checkIfFalls();
      }
    }
  }

  function checkIfFalls(){
    for(var i = GRID_HEIGHT - 1; i >= 1; i--){
      for(var j = 0; j < GRID_WIDTH; j++){
        var bIndex = i * GRID_WIDTH + j;
        var aboveBIndex = (i - 1) * GRID_WIDTH + j;
        if(grids[aboveBIndex] == 1){
          grids[aboveBIndex] = 0;
          grids[bIndex] = 1;
        }
      }
    }
    // for(var i = 0; i < GRID_HEIGHT; i++){
    //   for(var j = 0; j < GRID_WIDTH; j++){
    //     var bIndex = i * GRID_WIDTH + j;
    //     if(grids[bIndex] == 1){
    //       if(i < GRID_WIDTH - 1){
    //         grids[(i+1) * GRID_WIDTH + j] = 1;
    //         grids[bIndex] = 0;
    //       }
    //     }
    //   }
    // }

  }

  function changeCurrentBlock(currentIndex){
    allBlocksIndex.push(currentIndex);
    grids[currentIndex] = 1;
    for(var i = 0; i < GRID_WIDTH; i++){
      var checkIndex = GRID_WIDTH + i;
      if(grids[checkIndex] == 0){
        currentBlock = nextBlock;
        nextBlock.xGridIndex = GRID_WIDTH/2;
        nextBlock.yGridIndex = 0;
      } else {
        grids[currentBlock.xGridIndex] = 1;
        needsReset = true;
        currentState = GAMEOVER;
      }
    }
    // if(grids[GRID_WIDTH + GRID_WIDTH / 2] == 0){
    //   currentBlock = nextBlock;
    //   nextBlock.xGridIndex = GRID_WIDTH/2;
    //   nextBlock.yGridIndex = 0;
    // } else {
    //   needsReset = true;
    //   currentState = GAMEOVER;
    // }
  }

  function renderGame(){
    context.setTransform(1, 0, 0, 1, width/2, height/2);
    context.clearRect(-width/2, -height/2, width, height);

    for(var i = 0; i < GRID_HEIGHT; i++){
      for(var j = 0; j < GRID_WIDTH; j++){
        var x = (j - GRID_WIDTH/2) * GRID_SIZE,
            y = (i - GRID_HEIGHT/2) * GRID_SIZE;
        var bIndex = i * GRID_WIDTH + j;
        if(grids[bIndex] == 0){
          context.beginPath();
          context.rect(x, y, GRID_SIZE, GRID_SIZE);
          context.stroke();
        } else if(grids[bIndex] == 1){
          context.fillRect(x, y, GRID_SIZE, GRID_SIZE);
        }
      }
    }

    context.font = "30px Verdana"
    context.fillText("SCORE: " + currentScore, width/2 - 200, -height/2 + 200);

  }

  function renderGameOver(){
    context.font = "30px Verdana";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText("Game Over!", 0, 0);
  }

  function renderGameMenu(){
    context.setTransform(1, 0, 0, 1, width/2, height/2);
    context.font = "14px Verdana";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.beginPath();
    context.rect(newGameRect.x, newGameRect.y, newGameRect.width, newGameRect.height);
    context.fillText("New Game", -width/3, -60);
    context.rect(optionsRect.x, optionsRect.y, optionsRect.width, optionsRect.height);
    context.fillText("Options", -width/3, 0);
    context.rect(helpRect.x, helpRect.y, helpRect.width, helpRect.height);
    context.fillText("Help", -width/3, 60);
    context.stroke();
  }

  document.body.addEventListener("keydown", function(event){
    switch(event.keyCode){
      case 37: //left
      pressingLeft = true;
      break;
      case 39: //right
      pressingRight = true;
      break;
    }
  });

    document.body.addEventListener("keyup", function(event){
      switch(event.keyCode){
        case 37: //left
        pressingLeft = false;
        movedLeft = false;
        break;
        case 39: //right
        pressingRight = false;
        movedRight = false;
        break;
      }
    });

    document.addEventListener("mousedown", function(event){
      if(utils.pointInRect(newGameRect, event.clientX - width/2, event.clientY - height/2)){
        currentState = PLAYING;
      }
      if(utils.pointInRect(optionsRect, event.clientX - width/2, event.clientY - height/2)){
        console.log("options");
      }
      if(utils.pointInRect(helpRect, event.clientX - width/2, event.clientY - height/2)){
        console.log("help");
      }
    });

};
