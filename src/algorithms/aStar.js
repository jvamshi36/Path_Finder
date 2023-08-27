import { BinaryHeap } from "./binaryHeap";

let Grid, finishAt;
let allowedDirections = 4;
let parameterValues = []; //store values for nodes

export function aStar(grid, startNode, finishNode, allowedDir) {
  let visitedNodesForAnimation = [];
  Grid = grid;
  // startAt = startNode;
  finishAt = finishNode;
  allowedDirections = allowedDir;
  var heap = getHeap();
  parameterValues = initializeParameters(grid.length, grid[0].length);
  // var closestNode = startNode;
  var startNodeParam = parameterValues[startNode.row][startNode.col];
  startNodeParam.hScore = heuristicScore(startNode, finishNode);
  startNodeParam.gScore = 0;
  startNodeParam.fScore = startNodeParam.gScore + startNodeParam.hScore;

  heap.push(startNode);

  while (heap.size() > 0) {
    //Get node with lowest f value

    var currentNode = heap.pop();
    visitedNodesForAnimation.push(currentNode);
    //End node has been found
    if (currentNode === finishNode) {
      return visitedNodesForAnimation;
    }

    //Move currentNode from open to close list
    var currNodeParam = parameterValues[currentNode.row][currentNode.col];
    currNodeParam.isClose = true;

    //neighbours of current node
    var neighbors = getNeighbors(currentNode);

    for (var i = 0; i < neighbors.length; ++i) {
      var neighbor = neighbors[i];
      var neighborParam = parameterValues[neighbor.row][neighbor.col];
      if (neighborParam.isClose || neighbor.isWall) {
        continue;
      }

      //Get gScore. gScore = shortest distance from start
      var gScore = currNodeParam.gScore + getCost(currentNode, neighbor);
      var visited = neighbor.isVisited;

      if (!visited || gScore < neighborParam.gScore) {
        // Found an optimal path till this node
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode;
        neighborParam.gScore = gScore;
        neighborParam.hScore = heuristicScore(neighbor);
        neighborParam.fScore = neighborParam.gScore + neighborParam.hScore;

        if (!visited) {
          //push to the heap
          heap.push(neighbor);
        } else {
          heap.updateElement(neighbor);
        }
      }
    }
  }
  return visitedNodesForAnimation;
}

function getHeap() {
  return new BinaryHeap(function (node) {
    return parameterValues[node.row][node.col].fScore;
  });
}

function isValid(x, y) {
  if (x >= 0 && x < Grid.length && y >= 0 && y < Grid[0].length) {
    return true;
  } else {
    return false;
  }
}

function getNeighbors(node) {
  var r = node.row;
  var c = node.col;
  var ret = [];
  var x = [1, 0, -1, 0, 1, -1, -1, 1];
  var y = [0, 1, 0, -1, 1, -1, 1, -1];

  for (var i = 0; i < allowedDirections; ++i) {
    if (isValid(r + x[i], c + y[i])) {
      ret.push(Grid[r + x[i]][c + y[i]]);
    }
  }

  return ret;
}

function getCost(src, dest) {
  return dest.weight;
}

function heuristicScore(node, endNode) {
  var d1 = Math.abs(node.row, finishAt.row);
  var d2 = Math.abs(node.col, finishAt.col);
  return d1 + d2;
}

function initializeParameters(GridRowSize, GridColSize) {
  const parameters = [];
  for (let r = 0; r < GridRowSize; ++r) {
    const row = [];
    for (let c = 0; c < GridColSize; ++c) {
      row.push(createNode(r, c));
    }
    parameters.push(row);
  }
  return parameters;
}

const createNode = (row, col) => {
  return {
    col,
    row,
    gScore: Infinity,
    hScore: Infinity,
    fScore: Infinity,
    isOpen: false,
    isClose: false,
  };
};
