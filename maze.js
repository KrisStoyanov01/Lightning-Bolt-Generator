
var maze = document.querySelector(".maze");
var ctx = maze.getContext("2d");

var topWallSpawnChance = 0.5;
var leftWallSpawnChance = 0.5;
var cellSize = 20;

function containsByXYU(array, cell){
  for(var i = 0; i < array.length; i++){
    if(array[i].rowIndex === cell.rowIndex && array[i].columnIndex === cell.columnIndex){
      return true;
    }
  }

  return false;
}
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

    //initializes first cell - in the middle of top row
    currentIterationCells.push(this.grid[0][Math.floor(this.columnCount / 2)]);

    while(currentIterationCells.length > 0 && !pathFound){
      for(var i = 0; i < currentIterationCells.length; i++){
        var currentCell = currentIterationCells[i];

        //left neighbour check
        if(!currentCell.hasLeftWall && currentCell.columnIndex !== 0 && !containsByXYU(currentCell.path, this.grid[currentCell.rowIndex][currentCell.columnIndex - 1])){
          this.grid[currentCell.rowIndex][currentCell.columnIndex - 1].path.push(currentCell);
          nextIterationCells.push(this.grid[currentCell.rowIndex][currentCell.columnIndex - 1]);
        }

        //up neighbour check
        if(!currentCell.hasTopWall && currentCell.rowIndex !== 0 && !containsByXYU(currentCell.path, this.grid[currentCell.rowIndex - 1][currentCell.columnIndex])){
          this.grid[currentCell.rowIndex - 1][currentCell.columnIndex].path.push(currentCell);
          nextIterationCells.push(this.grid[currentCell.rowIndex - 1][currentCell.columnIndex]);
        }

        //right neighbour check
        if(currentCell.columnIndex !== this.columnCount - 1 && !this.grid[currentCell.rowIndex][currentCell.columnIndex + 1].hasLeftWall && !containsByXYU(currentCell.path, this.grid[currentCell.rowIndex][currentCell.columnIndex + 1])){
          this.grid[currentCell.rowIndex][currentCell.columnIndex + 1].path.push(currentCell);
          nextIterationCells.push(this.grid[currentCell.rowIndex][currentCell.columnIndex + 1]);
        }

        //down neighbour check
        if(currentCell.rowIndex !== this.rowCount - 1 && !this.grid[currentCell.rowIndex + 1][currentCell.columnIndex].hasTopWall && !containsByXYU(currentCell.path, this.grid[currentCell.rowIndex + 1][currentCell.columnIndex])){
          this.grid[currentCell.rowIndex + 1][currentCell.columnIndex].path.push(currentCell);
          nextIterationCells.push(this.grid[currentCell.rowIndex + 1][currentCell.columnIndex]);
        }

        //check if lowest row is reached
        if(nextIterationCells[nextIterationCells.length - 1] !== undefined && nextIterationCells[nextIterationCells.length - 1].rowIndex === this.rowCount - 1){
          pathFound = true;
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
      this.solution = nextIterationCells[nextIterationCells.length - 1].path;
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
        var cell = new Cell(rowIndex, columnIndex, this.width, this.height, this.grid);
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
}

//wallPercentage is decimal between 0 and 1
function createWall(wallSpawnChance){
  var random = Math.random();
  if(random <= wallSpawnChance){
    return true;
  }else{ 
    return false;
  }
}

class Cell {
  constructor(rowIndex, columnIndex, width, height, parentGrid) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.width = width;
    this.height = height;
    //this path is the current path(also the shortest) used to reach this cell
    this.path = [];
    rowIndex === 0 ? this.hasTopWall = true : this.hasTopWall = createWall(topWallSpawnChance);
    columnIndex === 0 ? this.hasLeftWall = true : this.hasLeftWall = createWall(leftWallSpawnChance);  
    this.parentGrid = parentGrid;
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

  //draws cell
  show(rowCount, columnCount) {
    var x = this.columnIndex * this.width / columnCount;
    var y = this.rowIndex * this.height / rowCount;
    
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    if (this.hasTopWall) this.drawTopWall(x, y, this.height, columnCount);
    if (this.hasLeftWall) this.drawLeftWall(x, y, this.width, rowCount);
  }
}

//make the first parameter larger than the second one if you want a "lightning effect"
 let newMaze = new Maze(30, 20);
 newMaze.setup();
