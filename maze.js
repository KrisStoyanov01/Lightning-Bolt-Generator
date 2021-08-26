var maze = document.querySelector(".maze");
var ctx = maze.getContext("2d");

//defines the chance of spawning a wall
//if it's over 0.50 loading a valid one will be slow
var topWallSpawnChance = 0.45;
var leftWallSpawnChance = 0.45;

class Maze {
  constructor(rowCount, columnCount, cellSize, shouldReduce) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.cellSize = cellSize;
    this.shouldReduce = shouldReduce;

    this.grid = [];
    this.width = columnCount * this.cellSize;
    this.height = rowCount * this.cellSize;
    //this is the shortest path from the top middle to any cell in the bottom
    this.solution = [];
  }

  //generaatess a random maze, until a solvable one is found
  setup() {
    //counts failed maze generations(when the maze didn't have a valid path from top middle to the bottom)
    var generationCounter = 0;
    this.generateMaze();

    while(!this.isSolvable(generationCounter)){

      this.generateMaze();
      generationCounter++;

      //if a valid maze cannot be created, the wall spawn chance is reduced and an alert is shown
      if(generationCounter > 20){
        alert("Problem generating maze, reducing wall spawn chance!");
        generationCounter = 0;
        topWallSpawnChance = topWallSpawnChance - 0.05;
        leftWallSpawnChance = leftWallSpawnChance -  0.05;
      }
    }
  }

  isSolvable(generationCounter){
    var currentIterationCells = [];
    var nextIterationCells = [];
    var pathFound = false;

    //initializes first cell - in the middle of top row
    currentIterationCells.push(this.grid[0][Math.floor(this.columnCount / 2)]);

    while(currentIterationCells.length > 0 && !pathFound){
      for(var i = 0; i < currentIterationCells.length; i++){
        var currentCell = currentIterationCells[i];

        //left neighbour check
        if(!currentCell.hasLeftWall && currentCell.columnIndex !== 0 ){
          var neighbourCell = this.grid[currentCell.rowIndex][currentCell.columnIndex - 1];
          if(!neighbourCell.isUsed  && !pathFound){
            pathFound = processNeighbour(currentCell, neighbourCell, nextIterationCells, pathFound, this.rowCount);
          }
        }

        //up neighbour check
        if(!currentCell.hasTopWall && currentCell.rowIndex !== 0){
          var neighbourCell = this.grid[currentCell.rowIndex - 1][currentCell.columnIndex];
          if(!neighbourCell.isUsed  && !pathFound){
            pathFound = processNeighbour(currentCell, neighbourCell, nextIterationCells, pathFound, this.rowCount);
          }
        }

        //right neighbour check
        if(currentCell.columnIndex !== this.columnCount - 1 && !this.grid[currentCell.rowIndex][currentCell.columnIndex + 1].hasLeftWall){
          var neighbourCell = this.grid[currentCell.rowIndex][currentCell.columnIndex + 1];
          if(!neighbourCell.isUsed && !pathFound){
            pathFound = processNeighbour(currentCell, neighbourCell, nextIterationCells, pathFound, this.rowCount);
          }
        }
      
        //down neighbour check
        if(currentCell.rowIndex !== this.rowCount - 1 && !this.grid[currentCell.rowIndex + 1][currentCell.columnIndex].hasTopWall){
          var neighbourCell =  this.grid[currentCell.rowIndex + 1][currentCell.columnIndex];
          if(!neighbourCell.isUsed  && !pathFound){
            pathFound = processNeighbour(currentCell, neighbourCell, nextIterationCells, pathFound, this.rowCount);
          }
        }
      }

      //prepare for next iteration, because the bottom row hasn't been reached
      if(!pathFound){
        currentIterationCells = nextIterationCells;
        nextIterationCells = []; 
      }     
    }

    //if bottom row is reached, then we have a path and the maze is valid
    if(pathFound){
      var finalCell = nextIterationCells[nextIterationCells.length - 1];
      for(var i = 0; i < finalCell.path.length; i++){
        this.solution.push(finalCell.path[i]);
      }
      this.solution.push(finalCell);
      return true;
    }else{
      return false;
    }
  } 

  //deletes previously created maze, creates a new one and draws it
  generateMaze(){
    this.grid = [];
    for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      var row = [];
      for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        var cell = new Cell(rowIndex, columnIndex, this.cellSize, this.width, this.height);
        row.push(cell);
      }
      this.grid.push(row);
    }
    this.draw();
  }
  
  //draws maze
  draw() {
    maze.width = this.width;
    maze.height = this.height;
    maze.style.background = 'black';
    for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        var grid = this.grid;
        grid[rowIndex][columnIndex].show(this.rowCount, this.columnCount);
      }
    }
  }

  flashSolution(){
    //this controls if the solution should be simplified(removes most of the grouped cells in it)
    if(this.shouldReduce)this.solution = reduceSolution();

    for(var i = 0; i < this.solution.length; i++){
      this.solution[i].flashCell();
    }
  }
}

class Cell {
  constructor(rowIndex, columnIndex, cellSize, width, height) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;

    //this path is the current path(also the shortest) used to reach this cell
    this.path = [];
    this.used = false;

    //creates topWall for cells; cells on the first row automaticaly have a top wall
    rowIndex === 0 ? this.hasTopWall = true : this.hasTopWall = createWall(topWallSpawnChance);

    //creates leftWall for cells; cells on the left column automaticaly have a left wall
    columnIndex === 0 ? this.hasLeftWall = true : this.hasLeftWall = createWall(leftWallSpawnChance);  
  }

  //displays top wall
  drawTopWall(x, y, height, columnCount) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + this.cellSize, y);
    ctx.stroke();
  }

  //displays left wall
  drawLeftWall(x, y, width, rowCount) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + this.cellSize);
    ctx.stroke();
  }

  //draws cell(actually draws just their walls)
  show(rowCount, columnCount) {
    var x = this.columnIndex * this.cellSize;
    var y = this.rowIndex * this.cellSize;
    
    //currently they are not displayed
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    if (this.hasTopWall) this.drawTopWall(x, y, this.height, columnCount);
    if (this.hasLeftWall) this.drawLeftWall(x, y, this.width, rowCount);
  }

  //visualizes a cell as an yellow square in order to indicate that it is a part of the solution path
  flashCell(){
    //top coordinates of the cell square
    var x = this.columnIndex * this.cellSize;
    var y = this.rowIndex * this.cellSize;
    
    ctx.fillStyle = 'yellow';
    ctx.fillRect(x, y, this.cellSize, this.cellSize);
  }
}

//wallPercentage is decimal between 0 and 1
function createWall(wallSpawnChance){
  var random = Math.random();
  if(random <= wallSpawnChance){
    return true;
  }
  return false;
}

//this executes everytime when we find a valid neighbour
//it transfers the path of the current cell to the neighbour cellSize
//returns true if the neighbour cell is on the bottom row, false in any other case
function processNeighbour(currentCell, neighbourCell, nextIterationCells, pathFound, rowCount){
  currentCell.isUsed = true;
  neighbourCell.isUsed = true;

  for(var i = 0; i < currentCell.path.length; i++){
    neighbourCell.path.push(currentCell.path[i]);
  }
  neighbourCell.path.push(currentCell);
  nextIterationCells.push(neighbourCell);

  //check if bottom row is reached
  if(nextIterationCells[nextIterationCells.length - 1] !== undefined && nextIterationCells[nextIterationCells.length - 1].rowIndex === rowCount - 1){
    return true;
  }
  return false;
}

function loadSolution() {
  newMaze.flashSolution();
}

//reduces solution array
//removes "squares" of cells
//works in about 95% of the cases
//black magic
function reduceSolution(){
  var solution = newMaze.solution;
  var reducedSolution = [];
  var i = 0;
  for(; i < solution.length - 4; i++){
    var currentCell = solution[i];
    var checkedCell = solution[i + 3];
    
    if(checkedCell.rowIndex === currentCell.rowIndex &&
      Math.abs(checkedCell.columnIndex - currentCell.columnIndex) === 1){
      solution.push(currentCell);
      i = i + 3;
    }else{
      if(checkedCell.columnIndex === currentCell.columnIndex &&
        Math.abs(checkedCell.rowIndex - currentCell.rowIndex) === 1){
        reducedSolution.push(currentCell);
        i = i + 3;
      }
    }

    reducedSolution.push(solution[i]);
  }

  while(i <= solution.length - 1){
    reducedSolution.push(solution[i]);
    i++;
  }
  return reducedSolution;
}

//gets user defined information from the html and updates the slider number
function loadResources(){
  var rowCountSlider = document.getElementById("rowCount"); 
  var columnCountSlider = document.getElementById("columnCount"); 
  var cellSizeSlider = document.getElementById("cellSize"); 
  var shouldReduceCheckBox = document.getElementById("shouldReduce");
  
  var rowCountOutput = document.getElementById("rowCountOutput");
  var columnCountOutput = document.getElementById("columnCountOutput");
  var cellSizeOutput = document.getElementById("cellSizeOutput");

  var rowCount = rowCountSlider.value;
  var columnCount = columnCountSlider.value;
  var cellSize = cellSizeSlider.value;
  var shouldReduce = shouldReduceCheckBox.checked;

  rowCountOutput.innerHTML = rowCount;
  columnCountOutput.innerHTML = columnCount;
  cellSizeOutput.innerHTML = cellSize;

  rowCountSlider.oninput = function() {
    rowCountOutput.innerHTML = this.value;
  }

  columnCountSlider.oninput = function() {
    columnCountOutput.innerHTML = this.value;
  }

  cellSizeSlider.oninput = function() {
    cellSizeOutput.innerHTML = this.value;
  }
  return {"rowCount": rowCount, "columnCount": columnCount, "cellSize": cellSize, "shouldReduce": shouldReduce}
}

//loads the data needed for creating a new maze and then updates(recreates) newMaze with it
function loadAndCreateNewMaze(){
  resources = loadResources();

  newMaze = new Maze(resources['rowCount'], resources['columnCount'], resources['cellSize'], resources['shouldReduce']);
  newMaze.setup();
  loadSolution();
  return newMaze;
}

//this is needed so a maze can be visualized when index.html is opened
//after this new mazes are created from the loadAndCreateNewMaze() function
var newMaze = loadAndCreateNewMaze();
