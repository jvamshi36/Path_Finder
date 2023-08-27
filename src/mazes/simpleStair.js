export function simpleStair(grid) {
  let order = [];
  let j = 0;
  while (grid.length - 1 - j >= 0) order.push(grid[grid.length - 1 - j][j++]);
  let i = 1,
    changeDir = 1;
  while (j < grid[0].length) {
    order.push(grid[i][j++]);
    if (i + 1 === grid.length - 1) changeDir = -1;
    else if (i - 1 === 0) changeDir = 1;
    i += changeDir;
  }

  return order;
}
