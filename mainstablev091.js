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
  var isNewGame = true;

  // gameplay elements
  var GRID_WIDTH = 16,
      GRID_HEIGHT = 26,
      GRID_SIZE = 20;
  var grids = [];

  //Scores
  var currentScore = 0,
      scoreIncrement = 100;

  //Blocks Essentials
  var allBlocksIndex = [];
  var currentBlock = {
    blocks: []
  };
  currentBlock.blocks.push({xIndex: 0, yIndex: 0});
  currentBlock.blocks.push({xIndex: 0, yIndex: 0});
  currentBlock.blocks.push({xIndex: 0, yIndex: 0});
  currentBlock.blocks.push({xIndex: 0, yIndex: 0});

  var  nextBlock = {
    blocks: []
  };
  nextBlock.blocks.push({xIndex: 0, yIndex: 0});
  nextBlock.blocks.push({xIndex: 0, yIndex: 0});
  nextBlock.blocks.push({xIndex: 0, yIndex: 0});
  nextBlock.blocks.push({xIndex: 0, yIndex: 0});


  var fallingTime = 0.5;
  var timer = fallingTime;

  var xGridIndex = 0;
  var yGridIndex = 0;
  var currentIndex = 0;
  var previousIndex = -1;
  var nextIndex = 0;
  var isAtlast = false;

  //TYPES OF blocks
  var blockTypes = [];

  var blockType1 = {
    blocks: []
  }
  blockType1.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType1.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 0});
  blockType1.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 2});
  blockType1.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 1});
  blockTypes.push(blockType1);

  var blockType2 = {
    blocks: []
  }
  blockType2.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType2.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 2});
  blockType2.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 0});
  blockType2.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 1});
  blockTypes.push(blockType2);

  var blockType3 = {
    blocks: []
  }
  blockType3.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType3.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 0});
  blockType3.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 2});
  blockType3.blocks.push({xIndex: GRID_WIDTH/2 - 1, yIndex: 0});
  blockTypes.push(blockType3);

  var blockType4 = {
    blocks: []
  }
  blockType4.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 0});
  blockType4.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType4.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 0});
  blockType4.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 1});
  blockTypes.push(blockType4);

  var blockType5 = {
    blocks: []
  }
  blockType5.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType5.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 0});
  blockType5.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 2});
  blockType5.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 3});
  blockTypes.push(blockType5);

  var blockType6 = {
    blocks: []
  }
  blockType6.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType6.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 0});
  blockType6.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 1});
  blockType6.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 2});
  blockTypes.push(blockType6);

  var blockType7 = {
    blocks: []
  }
  blockType7.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 1});
  blockType7.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 0});
  blockType7.blocks.push({xIndex: GRID_WIDTH/2, yIndex: 2});
  blockType7.blocks.push({xIndex: GRID_WIDTH/2 + 1, yIndex: 0});
  blockTypes.push(blockType7);


  //input
  var pressingLeft = false,
      movedLeft = false,
      pressingRight= false,
      movedRight = false,
      pressingDown = false;

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
      needsReset = true;
      currentState = MENU;
    }
  }


  function updateGame(){
    //Updating Inputs
    if(pressingLeft && !pressingRight && !movedLeft){
      moveLeft();
      movedLeft = true;
    }
    if(pressingRight && !pressingLeft && !movedRight){
      moveRight();
      movedRight = true;
    }
    if(pressingDown){
      if(checkBelow()){
        moveBelow();
        currentScore += 1;
      }
    }

    timer -= dt;
    if(timer <= 0){
      if(checkBelow()){
        moveBelow();
      } else {
        changeCurrentBlock();
        checkIfAligned();
        if(!checkBelow()){
          currentState = GAMEOVER;
        }
      }
      timer = fallingTime;
    }

  }

  function moveBelow(){
      for(var i = 0; i < currentBlock.blocks.length; i++){
        currentBlock.blocks[i].yIndex++;
      }
  }

  function checkBelow(){
    for(var i = 0; i < currentBlock.blocks.length; i++){
      var b = currentBlock.blocks[i],
          gIndex = (b.yIndex + 1) * GRID_WIDTH + b.xIndex;
      if(gIndex >= grids.length || grids[gIndex] == 1){
        return false;
      }
    }
    return true;
  }

  function moveLeft(){
    if(checkLeftBounds() && checkIfOtherBlockLeft()){
      for(var i = 0; i < currentBlock.blocks.length; i++){
        currentBlock.blocks[i].xIndex--;
      }
    }

  }

  function moveRight(){
    if(checkRightBounds() && checkIfOtherBlockRight()){
      for(var i = 0; i < currentBlock.blocks.length; i++){
        currentBlock.blocks[i].xIndex++;
      }
    }
  }

  function checkLeftBounds(){
    for(var i = 0; i < currentBlock.blocks.length; i++){
      var block = currentBlock.blocks[i],
          gIndex = block.yIndex * GRID_WIDTH + block.xIndex;
      if(gIndex % GRID_WIDTH == 0){
        return false;
      }
    }
    return true;
  }

  function checkRightBounds(){
    for(var i = 0; i < currentBlock.blocks.length; i++){
      var block = currentBlock.blocks[i],
          gIndex = block.yIndex * GRID_WIDTH + block.xIndex;
      if((gIndex + 1) % GRID_WIDTH == 0){
        return false;
      }
    }
    return true;
  }

  function checkIfOtherBlockRight(){
    for(var i = 0; i < currentBlock.blocks.length; i++){
      var block = currentBlock.blocks[i],
          gIndex = block.yIndex * GRID_WIDTH + block.xIndex;
      if(grids[gIndex + 1] == 1){
        return false;
      }
    }
    return true;
  }

  function checkIfOtherBlockLeft(){
    for(var i = 0; i < currentBlock.blocks.length; i++){
      var block = currentBlock.blocks[i],
          gIndex = block.yIndex * GRID_WIDTH + block.xIndex;
      if(grids[gIndex - 1] == 1){
        return false;
      }
    }
    return true;
  }

  function rotateBlock(block){
    var centerBlock = block.blocks[0];
    var rotatedBlockXY = [];
    for(var i = 1; i < block.blocks.length; i++){
      var b = block.blocks[i];
      var x = b.xIndex - centerBlock.xIndex,
          y = b.yIndex - centerBlock.yIndex,
          rotatedX = -y,
          rotatedY = x;
          rotatedXIndex = centerBlock.xIndex + rotatedX,
          rotatedYIndex = centerBlock.yIndex + rotatedY,
          // block.blocks[i].xIndex = rotatedXIndex;
          // block.blocks[i].yIndex = rotatedYIndex;
          rotatedBlockXY.push({xIndex: rotatedXIndex, yIndex: rotatedYIndex});
          gRotatedIndex = rotatedYIndex * GRID_WIDTH + rotatedXIndex;
          if(gRotatedIndex >= grids.length ||
             grids[gRotatedIndex] == 1 ||
             gRotatedIndex % GRID_WIDTH == 0 ||
             (gRotatedIndex + 1) % GRID_WIDTH == 0){
            return false;
          }
    }

    for(var i = 1; i < block.blocks.length; i ++){
      block.blocks[i].xIndex = rotatedBlockXY[i - 1].xIndex;
      block.blocks[i].yIndex = rotatedBlockXY[i - 1].yIndex;
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
    changeCurrentBlock();
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

        // //checking to see if there are other above;
        // checkIfFalls();
        for(var k = i; k >= 1; k--){
          for(var l = 0; l < GRID_WIDTH; l++){
            var bIndex = k * GRID_WIDTH + l;
            var aboveBIndex = (k - 1) * GRID_WIDTH + l;
            if(grids[aboveBIndex] == 1){
              grids[aboveBIndex] = 0;
              grids[bIndex] = 1;
            }
          }
        }

      }
    }
  }

  /* This function checks and bring back all the blocks to one step downwards
  **Which is not what very good
  **********
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
  }
  */

  function changeCurrentBlock(){
    if(!needsReset){
      for(var i = 0; i < currentBlock.blocks.length; i++){
        var block = currentBlock.blocks[i],
        gIndex = block.yIndex * GRID_WIDTH + block.xIndex;
        grids[gIndex] = 1;
      }
    }
    resetBlock();
  }

  function resetBlock(){
    var randomNumber = utils.randomInt(0, blockTypes.length - 1);
    var blockType = blockTypes[randomNumber];

    if(isNewGame){
      for(var i = 0; i < blockType.blocks.length; i++){
        nextBlock.blocks[i].xIndex = blockType.blocks[i].xIndex;
        nextBlock.blocks[i].yIndex = blockType.blocks[i].yIndex;
      }
    }

    for(var i = 0;i < nextBlock.blocks.length; i++){
      currentBlock.blocks[i].xIndex = nextBlock.blocks[i].xIndex;
      currentBlock.blocks[i].yIndex = nextBlock.blocks[i].yIndex;
    }
    for(var i = 0; i < blockType.blocks.length; i++){
      nextBlock.blocks[i].xIndex = blockType.blocks[i].xIndex;
      nextBlock.blocks[i].yIndex = blockType.blocks[i].yIndex;
    }
    isNewGame = false;
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

    for(var i = 0; i < currentBlock.blocks.length; i++){
      var xIndex = currentBlock.blocks[i].xIndex,
          yIndex = currentBlock.blocks[i].yIndex,
          bIndex = yIndex * GRID_WIDTH + xIndex,
          x = (xIndex - GRID_WIDTH/2) * GRID_SIZE,
          y = (yIndex - GRID_HEIGHT/2) * GRID_SIZE;
      context.fillRect(x, y, GRID_SIZE, GRID_SIZE);
    }

    context.textBaseline = "middle";
    context.textAlign = "center"
    context.font = "30px Verdana";
    context.fillText("SCORE: " + currentScore, width/2 - 400, -height/2 + 200);

    context.font = "20px verdana"
    context.fillText("Next Block", width/2 - 400, -height/2 + 300);
    for(var i = 0;i < nextBlock.blocks.length; i++){
      var block = nextBlock.blocks[i];
      context.fillRect( (width/2 - 600) + (block.xIndex * GRID_SIZE), -height/2 + 320 + block.yIndex * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

  }

  function renderGameOver(){
    context.font = "30px Verdana";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText("Game Over!", 0, 0);
  }

  function renderGameMenu(){
    context.setTransform(1, 0, 0, 1, width/2, height/2);
    context.clearRect(-width/2, -height/2, width/3, height);
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
    if(currentState == PLAYING){
      switch(event.keyCode){
        case 37: //left
        pressingLeft = true;
        break;
        case 39: //right
        pressingRight = true;
        break;
        case 40:
        pressingDown = true;
        break;
        case 32:
        rotateBlock(currentBlock);
        break;
      }
    }
  });

    document.body.addEventListener("keyup", function(event){
      if(currentState == PLAYING){
        switch(event.keyCode){
          case 37: //left
          pressingLeft = false;
          movedLeft = false;
          break;
          case 39: //right
          pressingRight = false;
          movedRight = false;
          break;
          case 40:
          pressingDown = false;
          break;
          case 32:
          break;
        }
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
