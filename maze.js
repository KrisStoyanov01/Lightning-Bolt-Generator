
var maze = document.querySelector(".maze");
var ctx = maze.getContext("2d");

var topWallSpawnChance = 0.3;
var leftWallSpawnChance = 0.5;
var mazeWidth = 400;
var mazeHeight = 600;

class Maze {
  constructor(size, rowCount, columnCount) {
    this.size = size;
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.grid = [];
  }

  setup() {
    for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      var row = [];
      for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        var cell = new Cell(rowIndex, columnIndex, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
  }

  draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = 'black';
    for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        var grid = this.grid;
        grid[rowIndex][columnIndex].show(this.size, this.rowCount, this.columnCount);
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
  constructor(rowIndex, columnIndex, parentGrid, parentSize) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    rowIndex === 0 ? this.hasTopWall = true : this.hasTopWall = createWall(topWallSpawnChance);
    columnIndex === 0 ? this.hasLeftWall = true : this.hasLeftWall = createWall(leftWallSpawnChance);  
    //this.hasTopWall = true;
    //this.hasLeftWall = true;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
  }

  drawTopWall(x, y, size, rows, columns) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }

  
  drawLeftWall(x, y, size, rows, columns) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  show(size, rows, columns) {
    let x = (this.columnIndex * size) / columns;
    let y = (this.rowIndex * size) / rows;
    
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    if (this.hasTopWall) this.drawTopWall(x, y, size, rows, columns);
    if (this.hasLeftWall) this.drawLeftWall(x, y, size, rows, columns);
  }
}

 let newMaze = new Maze(600, 10, 10);
 newMaze.setup();
 newMaze.draw();