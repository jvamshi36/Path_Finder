// Performs Dijkstra's algorithm; returns *all* nodes in the order
// in which they were visited. Also makes nodes point back to their
// previous node, effectively allowing us to compute the shortest path
// by backtracking from the finish node.

import { BinaryHeap } from "./binaryHeap";

let allowedDirections = 4;

function getHeap() {
  return new BinaryHeap(function (node) {
    return node.distance;
  });
}

export function dijkstra(grid, startNode, finishNode, allowedDir) {
  allowedDirections = allowedDir;
  const visitedNodesForAnimation = [];
  var heap = getHeap();

  startNode.distance = 0;
  heap.push(startNode);

  while (heap.size() > 0) {
    var closestNode = heap.pop();
    // If we encounter a wall, we skip it.
    if (closestNode.isWall) continue;

    // If the closest node is at a distance of infinity,
    // we must be trapped and should therefore stop.
    if (closestNode.distance === Infinity) return visitedNodesForAnimation;

    // Else we visit this node and update/relax the distance of its neighbors
    closestNode.isVisited = true;
    visitedNodesForAnimation.push(closestNode);

    // If finish node then we reach the destination
    if (closestNode === finishNode) return visitedNodesForAnimation;

    const unvisitedNeighbors = getAllUnvisitedNeighbors(closestNode, grid);

    for (const neighbor of unvisitedNeighbors) {
      if (neighbor.distance > closestNode.distance + neighbor.weight) {
        neighbor.distance = closestNode.distance + neighbor.weight;
        neighbor.previousNode = closestNode;
        if (heap.find(neighbor)) {
          heap.updateElement(neighbor);
        } else {
          heap.push(neighbor);
        }
      }
    }
  }

  return visitedNodesForAnimation;
}

function getAllUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const xdir = [1, -1, 0, 0, -1, -1, 1, 1];
  const ydir = [0, 0, 1, -1, 1, -1, 1, -1];

  const { col, row } = node;

  for (let i = 0; i < allowedDirections; ++i) {
    let nextrow = row + xdir[i];
    let nextcol = col + ydir[i];
    if (
      nextrow >= 0 &&
      nextrow < grid.length &&
      nextcol >= 0 &&
      nextcol < grid[0].length &&
      !grid[nextrow][nextcol].isVisited &&
      !grid[nextrow][nextcol].isWall
    )
      neighbors.push(grid[nextrow][nextcol]);
  }

  return neighbors;
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the dijkstra method above.
export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
