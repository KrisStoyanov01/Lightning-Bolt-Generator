
var maze = document.querySelector(".maze");
var ctx = maze.getContext("2d");

var topWallSpawnChance = 0.45;
var leftWallSpawnChance = 0.5;
var cellSize = 15;

class Maze {
  constructor(rowCount, columnCount) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.grid = [];
    this.width = columnCount * cellSize;
    this.height = rowCount * cellSize;

    //this is the shortes path from the top middle to any cell in the bottom
    this.solution = [];
  }

  setup() {
    //counts failed maze generations(when the maze didn't have a valid path from top middle to the bottom)
    var generationCounter = 0;
    this.generateMaze();
    while(!this.isSolvable(generationCounter)){
      this.generateMaze();
      
      generationCounter++;
      if(generationCounter > 20){
        alert("Problem generating maze, reducing wall spawn chance!");
        generationCounter = 0;
        topWallSpawnChance = topWallSpawnChance - 0.05;
        leftWallSpawnChance = leftWallSpawnChance -  0.05;
        //if a valid maze cannot be created, the wall spawn chance is reduced and an alert is shown
      }
    }


  }

  isSolvable(generationCounter){
    var currentIterationCells = [];
    var nextIterationCells = [];
    var pathFound = false;
    //debugger
    //initializes first cell - in the middle of top row
    currentIterationCells.push(this.grid[0][Math.floor(this.columnCount / 2)]);

    while(currentIterationCells.length > 0 && !pathFound){
      //debugger
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
      if(!pathFound){
        //prepare for next iteration
        currentIterationCells = nextIterationCells;
        nextIterationCells = []; 
      }     
    }
    //if lowest row is reached, than we have a path and the maze is valid
    if(pathFound){
      //debugger
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
        var cell = new Cell(rowIndex, columnIndex, this.width, this.height);
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
    //debugger
    for(var i = 0; i < this.solution.length; i++){
      this.solution[i].flashCell();
    }
  }
}

class Cell {
  constructor(rowIndex, columnIndex, width, height) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.width = width;
    this.height = height;
    //this path is the current path(also the shortest) used to reach this cell
    this.path = [];
    this.used = false;
    rowIndex === 0 ? this.hasTopWall = true : this.hasTopWall = createWall(topWallSpawnChance);
    columnIndex === 0 ? this.hasLeftWall = true : this.hasLeftWall = createWall(leftWallSpawnChance);  
  }

  drawTopWall(x, y, height, columnCount) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cellSize, y);
    ctx.stroke();
  }

  drawLeftWall(x, y, width, rowCount) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + cellSize);
    ctx.stroke();
  }

  //draws cell(actually draws just )
  show(rowCount, columnCount) {
    var x = this.columnIndex * cellSize;
    var y = this.rowIndex * cellSize;
    
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    if (this.hasTopWall) this.drawTopWall(x, y, this.height, columnCount);
    if (this.hasLeftWall) this.drawLeftWall(x, y, this.width, rowCount);
  }

  flashCell(){
    var x = this.columnIndex * cellSize;
    var y = this.rowIndex * cellSize;
    
    ctx.fillStyle = 'yellow';
    //ctx.fillRect(x, y, x + cellSize - 3, y + cellSize - 3);
    ctx.fillRect(x + 5, y + 5, 10, 10);

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
function processNeighbour(currentCell, neighbourCell, nextIterationCells, pathFound, rowCount){
  currentCell.isUsed = true;
  neighbourCell.isUsed = true;

  for(var i = 0; i < currentCell.path.length; i++){
    neighbourCell.path.push(currentCell.path[i]);
  }
  neighbourCell.path.push(currentCell);
  nextIterationCells.push(neighbourCell);

  //check if lowest row is reached
  if(nextIterationCells[nextIterationCells.length - 1] !== undefined && nextIterationCells[nextIterationCells.length - 1].rowIndex === rowCount - 1){
    return true;
  }
  return false;
}

function loadSolution() {
  newMaze.flashSolution();
}

//make the first parameter larger than the second one if you want a "lightning effect"
 let newMaze = new Maze(40, 20);
 newMaze.setup();
