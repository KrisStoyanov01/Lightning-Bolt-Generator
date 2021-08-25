
var maze = document.querySelector(".maze");
var ctx = maze.getContext("2d");

var topWallSpawnChance = 0.3;
var leftWallSpawnChance = 0.5;
var cellSize = 20;

class Maze {
  constructor(rowCount, columnCount) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.grid = [];
    this.width = columnCount * cellSize;
    this.height = rowCount * cellSize;
  }

  setup() {
    for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      var row = [];
      for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        var cell = new Cell(rowIndex, columnIndex, this.width, this.height, this.grid);
        row.push(cell);
      }
      this.grid.push(row);
    }
  }

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

//make the height larger than the width
 let newMaze = new Maze(30, 20);
 newMaze.setup();
 newMaze.draw();