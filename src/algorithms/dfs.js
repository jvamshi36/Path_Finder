// Performs Depth First Search algorithm; returns *all* nodes in the order
// in which they were visited. Also makes nodes point back to their
// previous node, effectively allowing us to compute the shortest path
// by backtracking from the finish node.
let allowedDirections = 4;

export function dfs(grid, startNode, finishNode, allowedDir) {
  allowedDirections = allowedDir;
  const visitedNodesForAnimation = [];
  
  const nodesStack = [];
  nodesStack.push(startNode);
  // getAllFromGrid(grid);
  const xdir = [1, 0, -1, 0, 1, -1, -1, 1];
  const ydir = [0, 1, 0, -1, 1, -1, 1, -1];

  while (nodesStack.length) {
    const currentNode = nodesStack.pop();

    // If finish node then we reach the destination
    if (currentNode === finishNode) return visitedNodesForAnimation;

    if (!currentNode.isWall && !currentNode.isVisited) {
      currentNode.isVisited = true;
      visitedNodesForAnimation.push(currentNode);

      const { col, row } = currentNode;
      let nextNode;
      let nextrow, nextcol;

      for (let i = 0; i < allowedDirections; ++i) {
        nextrow = row + xdir[i];
        nextcol = col + ydir[i];

        if (
          nextrow >= 0 &&
          nextrow < grid.length &&
          nextcol >= 0 &&
          nextcol < grid[0].length
        ) {
          nextNode = grid[nextrow][nextcol];
          if (!nextNode.isVisited && !nextNode.isWall) {
            nextNode.previousNode = currentNode;
            nodesStack.push(nextNode);
          }
        }
      }
    }
  }
  return visitedNodesForAnimation;
}
