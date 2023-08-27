export function basicRandom(grid) {
  let order = [];
  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  let numNodes = randomNumber(400, 500);
  for (var n = 0; n <= numNodes; n++) {
    let row = randomNumber(0, grid.length - 1);
    let col = randomNumber(0, grid[0].length - 1);
    order.push(grid[row][col]);
  }
  return order;
}
