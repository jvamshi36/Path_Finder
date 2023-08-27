// import React, { Component, forwardRef } from "react";

import React, { Component } from "react";
import Node from "./Node/Node";
import ControlPanel from "./ControlPanel/ControlPanel";
import "./PathfindingVisualizer.css";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { dfs } from "../algorithms/dfs";
import { bfs } from "../algorithms/bfs";
import { aStar } from "../algorithms/aStar";
import { RecursiveDivision } from "../mazes/recursiveDiv";
import { basicRandom } from "../mazes/basicRandom";
import { simpleStair } from "../mazes/simpleStair";
import { basicWeight } from "../mazes/basicWeight";
// import { Alert } from "bootstrap";
// import { dijkstraOld } from "../algorithms/dijkstraOld";

let StartNodeRow = 8;
let StartNodeCol = 10;
let EndNodeRow = 8;
let EndNodeCol = 50;
let AlgorithmSelected = 0;
let weight = 0;
let speed_selected = 1;
let isAlgoRunning = 0;
let isGeneratingGrid = 0;
let stationNodeRow = -1;
let stationNodeCol = -1;
let allowedDirections = 4;
let theme = 1;
let extraWallClass = "";

export default class PathfindingVisualizer extends Component {
  constructor(props) {
    super(props); //Call Construct To Parent Class
    //props refer to the properties, special symbol. Used for passing data to one component to another
    this.state = {
      grid: [],
      GridRowSize: 21,
      GridColSize: 61,
      startNodeChange: false,
      endNodeChange: false,
      mouseIsPressed: false,
      wallNodeChange: false,
      addingStations: false,
      stationsPresent: true,
      stationNodeChange: false,
      addingWeights: 0,
    };
  }

  // componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
  // Initialization that requires DOM nodes should go here.
  componentDidMount() {
    const grid = initializeGrid(this.state.GridRowSize, this.state.GridColSize);
    this.setState({ grid: grid });
  }

  //This function changes the state of react and DOM element
  changeState = (
    row,
    col,
    isFinish,
    isStart,
    isWall,
    extraClassName,
    isStation = false,
    weight = 0
  ) => {
    const node = this.state.grid[row][col];
    node.isFinish = isFinish;
    node.isStart = isStart;
    node.isWall = isWall;
    node.isStation = isStation;
    node.isVisited = false;
    node.distance = Infinity;
    node.previousNode = null;
    if (weight) node.weight = weight;
    const element = document.getElementById(`node-${node.row}-${node.col}`);

    if (weight > 1) {
      extraClassName = `${extraClassName}-${weight}`;
    } else if (!isFinish && !isStart && !isWall && !isStation && weight === 1) {
      extraClassName = "";
    }

    element.className = `node ${extraClassName}`;
    element.isFinish = isFinish;
    element.isStart = isStart;
    element.isWall = isWall;
    element.isStation = isStation;
    element.extraClassName = extraClassName;
    return;
  };

  /********************************
  Handling Mouse Events 
  Code By: Keerthi , Vamshi 
  **********************************/

  handleMouseDown(row, col) {
    //If algo is running no mouse event will be entertained
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    const node = this.state.grid[row][col];

    //Start & End Node Change is only allowed when weights and stations are not being added
    if (node.isStart && !this.addingWeights && !this.addingStations) {
      this.startNodeChange = true;
    }
    //changing End Node
    else if (node.isFinish && !this.addingWeights && !this.addingStations) {
      this.endNodeChange = true;
    }
    //Changing Station Node
    //Adding weights & stations only when the node is not a special node
    else if (
      node.isStation &&
      !this.addingWeights &&
      !this.addingStations &&
      !this.startNodeChange &&
      !this.endNodeChange
    ) {
      this.stationNodeChange = true;
    }
    //Adding weights
    else if (
      !node.isFinish &&
      !node.isStart &&
      !node.isStation &&
      !node.isWall &&
      this.addingWeights === 1
    ) {
      this.addingWeights = 2;
      this.changeState(
        row,
        col,
        false,
        false,
        false,
        "node-weight",
        false,
        weight
      );
    }
    //Adding Station Nodes
    else if (
      !node.isFinish &&
      !node.isStart &&
      !node.isStation &&
      !node.isWall &&
      this.addingStations === true &&
      stationNodeRow === -1 &&
      node.weight <= 1
    ) {
      this.stationsPresent = true;
      stationNodeRow = row;
      stationNodeCol = col;
      const buttonElement = document.getElementById("station-button");
      document.getElementById("station-button").style.color = "white";
      buttonElement.innerHTML = "Remove Station";
      this.changeState(row, col, false, false, false, "node-station", true);
    }
    //Allowing wall addition only when adding station and adding weight task are not performed
    else if (
      (row !== stationNodeRow || col !== stationNodeCol) &&
      !this.addingStations &&
      !this.addingWeights &&
      node.weight < 2
    ) {
      const node = this.state.grid[row][col];
      this.wallNodeChange = true;
      let className = `node-wall${extraWallClass}`;
      if (node.isWall) className = "";
      this.changeState(row, col, false, false, !node.isWall, className);
    }
  }

  handleMouseEnter(row, col) {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    const node = this.state.grid[row][col];

    //StartNode Change
    if (
      this.startNodeChange === true &&
      node.isWall === false &&
      node.isStation === false &&
      node.weight < 2
    ) {
      this.changeState(row, col, false, true, false, "node-start");
      StartNodeRow = row;
      StartNodeCol = col;
    }
    //End Node Change
    else if (
      this.endNodeChange === true &&
      node.isWall === false &&
      node.isStation === false &&
      node.weight < 2
    ) {
      this.changeState(row, col, true, false, false, "node-finish");
      EndNodeRow = row;
      EndNodeCol = col;
    }
    //Station Node Change
    else if (
      this.stationNodeChange === true &&
      node.isWall === false &&
      node.weight < 2
    ) {
      if (node.isStart || node.isFinish) {
        let classTemp = node.isStart ? "node-start" : "node-finish";
        this.changeState(
          row,
          col,
          node.isFinish,
          node.isStart,
          false,
          classTemp
        );
        this.stationNodeChange = false;
        this.addStation();
      } else {
        stationNodeRow = row;
        stationNodeCol = col;
        this.changeState(row, col, false, false, false, "node-station", true);
      }
    }
    //Adding weights
    else if (
      !node.isFinish &&
      !node.isStart &&
      !node.isStation &&
      !node.isWall &&
      this.addingWeights === 2
    ) {
      this.changeState(
        row,
        col,
        false,
        false,
        false,
        "node-weight",
        false,
        weight
      );
    }

    //Changing wall states
    else if (
      !node.isFinish &&
      !node.isStart &&
      (row !== stationNodeRow || col !== stationNodeCol) &&
      this.wallNodeChange === true &&
      !this.addingStations &&
      !this.addingWeights &&
      node.weight < 2
    ) {
      let className = `node-wall${extraWallClass}`;
      if (node.isWall) className = "";
      this.changeState(row, col, false, false, !node.isWall, className);
    }
  }
  handleMouseLeave(row, col) {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    const node = this.state.grid[row][col];
    if (this.startNodeChange === true && node.isWall === false) {
      if (row === EndNodeRow && col === EndNodeCol) {
        this.changeState(row, col, true, true, false, "node-finish");
        StartNodeRow = row;
        StartNodeCol = col;
      } else {
        this.changeState(row, col, false, false, false, "node ");
      }
    }

    if (this.endNodeChange === true && node.isWall === false) {
      if (row === StartNodeRow && col === StartNodeCol) {
        this.changeState(row, col, true, true, false, "node-start");
        EndNodeRow = row;
        EndNodeCol = col;
      } else {
        this.changeState(row, col, false, false, false, "node ");
      }
    }

    if (this.stationNodeChange === true && node.isWall === false) {
      if (row === StartNodeRow && col === StartNodeCol) {
        this.changeState(row, col, false, true, false, "node-start");
      } else if (row === EndNodeRow && col === EndNodeCol) {
        this.changeState(row, col, true, false, false, "node-finish");
      } else {
        this.changeState(row, col, false, false, false, "node ", false);
      }
    }
  }

  handleMouseUp(row, col) {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    if (this.startNodeChange === true) {
      this.startNodeChange = false;
      // In case up node is a wall
      this.changeState(row, col, false, true, false, "node-start");
      StartNodeRow = row;
      StartNodeCol = col;
    } else if (this.endNodeChange === true) {
      this.endNodeChange = false;
      // In case up node is a wall
      this.changeState(row, col, true, false, false, "node-finish");
      EndNodeRow = row;
      EndNodeCol = col;
    } else if (this.wallNodeChange === true) {
      this.wallNodeChange = false;
    } else if (this.addingWeights === 2) {
      this.addingWeights = 0;
      document.getElementById("weight-button").style.color = "white";
    } else if (this.stationNodeChange === true) {
      this.stationNodeChange = false;
    } else if (
      StartNodeRow !== row &&
      StartNodeCol !== col &&
      StartNodeRow !== row &&
      StartNodeCol !== col &&
      this.addingStations
    ) {
      this.addingStations = false;
    }
  }
  /********************************
  Select the algorithm
  Code By: Keerthi , Vamshi .
  **********************************/
  selectAnAlgorithm = (algo) => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    AlgorithmSelected = algo;
    const buttonElement = document.getElementById("visualise-button");
    var algoName = "";
    if (algo === 1) {
      algoName = "Djikstra";
    } else if (algo === 2) {
      algoName = "A* Star";
    } else if (algo === 3) {
      algoName = "DFS";
    } else if (algo === 4) {
      algoName = "BFS";
    }
    if ((algo === 3 || algo === 4) && isWeightPresent(this.state.grid)) {
      if (algo === 3) {
        // buttonElement.innerHTML = `DFS can't run with weighted grid. Remove the weights first`;
        alert("DFS can't run with weighted grid. Remove the weights first");
      } else if (algo === 4) {
        // buttonElement.innerHTML = `BFS can't run with weighted grid. Remove the weights first`;
        alert("BFS can't run with weighted grid. Remove the weights first");
      }
      AlgorithmSelected = 0;
      return;
    }
    buttonElement.innerHTML = `Visualise ${algoName}`;
  };

  /********************************
  Generate the maze
  Code By: Keerthi, Vamshi
  **********************************/

  mazeGenerate = (mazeAlgo) => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    this.clearBoard();
    isGeneratingGrid = 1;
    // updateButtonState("text-danger");
    updateAlertBox("block", isAlgoRunning, isGeneratingGrid);

    const { grid } = this.state;
    var forWalls;
    if (mazeAlgo === 1) {
      forWalls = RecursiveDivision(grid);
    } else if (mazeAlgo === 2) {
      forWalls = basicRandom(grid);
    } else if (mazeAlgo === 3) {
      forWalls = basicWeight(grid);
    } else if (mazeAlgo === 4) {
      forWalls = simpleStair(grid);
    } else {
      return;
    }
    for (let i = 0; i < forWalls.length; i++) {
      setTimeout(() => {
        isGeneratingGrid = 1;
        const node = forWalls[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (
          element.className !== "node node-start" &&
          element.className !== "node node-finish"
        ) {
          // element.className = "node node-visited";
          if (mazeAlgo === 3) {
            this.changeState(
              node.row,
              node.col,
              false,
              false,
              false,
              "node-weight",
              false,
              node.weight
            );
          } else {
            this.changeState(
              node.row,
              node.col,
              false,
              false,
              true,
              `node-wall${extraWallClass} wall-animate${extraWallClass}`
            );
          }
        }
        if (i === forWalls.length - 1) {
          isGeneratingGrid = 0;
          updateAlertBox("none", isAlgoRunning, isGeneratingGrid);
        }
      }, 20 * i);
    }

    return;
  };

  /********************************
  Adding Weights
  Code By: Keerthi, Vamshi
  **********************************/

  addWeight = (wht) => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    if (wht > 1 && AlgorithmSelected === 3) {
      alert("DFS can't run with weighted grid.");
      return;
    }
    if (wht > 1 && AlgorithmSelected === 4) {
      alert("BFS can't run with weighted grid.");
      return;
    }
    this.addingWeights = 1;
    this.addingStations = false;
    this.wallNodeChange = false;
    weight = wht;
    if (wht > 1)
      document.getElementById("weight-button").style.color = "#216cf8";
  };

  /********************************
  Add station functionality
  Code By: Keerthi, Vamshi
  **********************************/
  addStation = () => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    if (stationNodeRow !== -1) {
      this.changeState(
        stationNodeRow,
        stationNodeCol,
        false,
        false,
        false,
        "node ",
        false,
        1
      );
      stationNodeRow = -1;
      stationNodeCol = -1;
      const buttonElement = document.getElementById("station-button");
      buttonElement.innerHTML = "Add Station";
    } else {
      this.addingStations = true;
      this.addingWeights = 0;
      document.getElementById("station-button").style.color = "#216cf8";
    }
  };

  // Clearing the board if user wants to run algorithm again to make visited node unvisited
  removePrevForNextAlgo = () => {
    isAlgoRunning = 0;
    document.getElementById("distance").innerHTML = 0;
    for (let r = 0; r < this.state.GridRowSize; ++r) {
      for (let c = 0; c < this.state.GridColSize; ++c) {
        const node = this.state.grid[r][c];
        if (r === EndNodeRow && c === EndNodeCol) {
          this.changeState(r, c, true, false, false, "node-finish");
        } else if (r === StartNodeRow && c === StartNodeCol) {
          this.changeState(r, c, false, true, false, "node-start");
        } else {
          // const element = document.getElementById(`node-${r}-${c}`);
          let class_name = "";
          if (node.isWall === true) {
            class_name = `node-wall${extraWallClass}`;
          } else if (node.isStation === true) {
            class_name = "node-station";
          } else if (node.weight > 1) {
            class_name = "node-weight";
          }
          this.changeState(
            r,
            c,
            false,
            false,
            node.isWall,
            class_name,
            node.isStation,
            node.weight
          );
        }
      }
    }
  };

  // Resetting visiting distance and previous properties for station feature
  resetForStationPath = () => {
    for (let r = 0; r < this.state.GridRowSize; ++r) {
      for (let c = 0; c < this.state.GridColSize; ++c) {
        const node = this.state.grid[r][c];
        node.isVisited = false;
        node.distance = Infinity;
        node.previousNode = null;
      }
    }
  };

  /********************************
  Animate the Algorithm
  Code By: Keerthi, Vamshi
  **********************************/
  // We have all the visited nodes in order and the path vector just have to animate it using appropriate timing
  animateAlgorithm(
    visitedNodesInOrder,
    nodesInShortestPathOrder,
    startToStation
  ) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i * speed_selected);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (
          element.className !== "node node-start" &&
          element.className !== "node node-finish" &&
          node.isStation === false
        ) {
          let class_name = "node-visited";
          if (i > startToStation) {
            class_name = "node-visited-station";
          }
          if (node.weight > 1) {
            class_name = "node-visited node-weight-s";
            this.changeState(
              node.row,
              node.col,
              false,
              false,
              node.isWall,
              class_name,
              node.isStation,
              node.weight
            );
          } else {
            this.changeState(
              node.row,
              node.col,
              false,
              false,
              node.isWall,
              class_name
            );
          }
        }
      }, 10 * i * speed_selected);
    }
  }

  /********************************
  Animate The Path
  Code By: Keerthi, Vamshi
  **********************************/

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById("distance").innerHTML =
          parseInt(document.getElementById("distance").innerHTML) + node.weight;
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (
          element.className !== "node node-start" &&
          element.className !== "node node-finish" &&
          node.isStation === false
        ) {
          // element.className = "node node-shortest-path";
          const next_col = nodesInShortestPathOrder[i + 1].col;
          const next_row = nodesInShortestPathOrder[i + 1].row;
          let class_name = "";
          if (node.weight > 1) {
            class_name = `node-shortest-path node-weight-${node.weight}`;
          } else if (next_col === node.col && next_row === node.row + 1) {
            class_name = "node-shortest-path node-down";
          } else if (next_col === node.col && next_row === node.row - 1) {
            class_name = "node-shortest-path node-up";
          } else if (next_col === node.col - 1 && next_row === node.row) {
            class_name = "node-shortest-path node-left";
          } else if (next_col === node.col + 1 && next_row === node.row) {
            class_name = "node-shortest-path node-right";
          } else if (next_col === node.col + 1 && next_row === node.row + 1) {
            class_name = "node-shortest-path node-downright";
          } else if (next_col === node.col - 1 && next_row === node.row + 1) {
            class_name = "node-shortest-path node-downleft";
          } else if (next_col === node.col + 1 && next_row === node.row - 1) {
            class_name = "node-shortest-path node-upright";
          } else if (next_col === node.col - 1 && next_row === node.row - 1) {
            class_name = "node-shortest-path node-upleft";
          }

          this.changeState(node.row, node.col, false, false, false, class_name);
        }
        if (i === nodesInShortestPathOrder.length - 1) {
          isAlgoRunning = 0;
          updateAlertBox("none", isAlgoRunning, isGeneratingGrid);
        }
      }, 30 * i * speed_selected);
    }
  }

  /********************************
  Visualise the algorithm
  Code By: Keerthi, Vamshi
  **********************************/

  visulalizeAlgorithm = () => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    this.removePrevForNextAlgo();
    document.getElementById("distance").innerHTML = 0;
    const { grid } = this.state;
    const startNode = grid[StartNodeRow][StartNodeCol];
    const finishNode = grid[EndNodeRow][EndNodeCol];
    let visitedNodesInOrderToStation = [];
    let nodesInShotestPathOrderToStation = [];
    let isStation = false;
    let startToStation = Infinity;
    if (stationNodeRow !== -1) {
      isStation = true;
    }
    let stationNode;

    if (isStation) {
      stationNode = grid[stationNodeRow][stationNodeCol];
    }

    let visitedNodesInOrder = [];
    isAlgoRunning = 1;
    // updateButtonState("text-danger");
    if (AlgorithmSelected === 1) {
      isAlgoRunning = 1;
      if (isStation) {
        visitedNodesInOrderToStation = dijkstra(
          grid,
          startNode,
          stationNode,
          allowedDirections
        );
        nodesInShotestPathOrderToStation =
          getNodesInShortestPathOrder(stationNode);
        startToStation = visitedNodesInOrderToStation.length;
        nodesInShotestPathOrderToStation.pop();
        this.resetForStationPath();
      }
      if (isStation) {
        visitedNodesInOrder = dijkstra(
          grid,
          stationNode,
          finishNode,
          allowedDirections
        );
        visitedNodesInOrder =
          visitedNodesInOrderToStation.concat(visitedNodesInOrder);
      } else {
        visitedNodesInOrder = dijkstra(
          grid,
          startNode,
          finishNode,
          allowedDirections
        );
      }
    } else if (AlgorithmSelected === 2) {
      isAlgoRunning = 2;
      if (isStation) {
        visitedNodesInOrderToStation = aStar(
          grid,
          startNode,
          stationNode,
          allowedDirections
        );
        nodesInShotestPathOrderToStation =
          getNodesInShortestPathOrder(stationNode);
        startToStation = visitedNodesInOrderToStation.length;
        nodesInShotestPathOrderToStation.pop();
        this.resetForStationPath();
      }
      if (isStation) {
        visitedNodesInOrder = aStar(
          grid,
          stationNode,
          finishNode,
          allowedDirections
        );
        visitedNodesInOrder =
          visitedNodesInOrderToStation.concat(visitedNodesInOrder);
      } else {
        visitedNodesInOrder = aStar(
          grid,
          startNode,
          finishNode,
          allowedDirections
        );
      }
    } else if (AlgorithmSelected === 3) {
      isAlgoRunning = 3;
      if (isStation) {
        visitedNodesInOrderToStation = dfs(
          grid,
          startNode,
          stationNode,
          allowedDirections
        );
        nodesInShotestPathOrderToStation =
          getNodesInShortestPathOrder(stationNode);
        startToStation = visitedNodesInOrderToStation.length;
        nodesInShotestPathOrderToStation.pop();
        this.resetForStationPath();
      }
      if (isStation) {
        visitedNodesInOrder = dfs(
          grid,
          stationNode,
          finishNode,
          allowedDirections
        );
        visitedNodesInOrder =
          visitedNodesInOrderToStation.concat(visitedNodesInOrder);
      } else {
        visitedNodesInOrder = dfs(
          grid,
          startNode,
          finishNode,
          allowedDirections
        );
      }
    } else if (AlgorithmSelected === 4) {
      isAlgoRunning = 4;
      if (isStation) {
        visitedNodesInOrderToStation = bfs(
          grid,
          startNode,
          stationNode,
          allowedDirections
        );
        nodesInShotestPathOrderToStation =
          getNodesInShortestPathOrder(stationNode);
        startToStation = visitedNodesInOrderToStation.length;
        nodesInShotestPathOrderToStation.pop();
        this.resetForStationPath();
      }
      if (isStation) {
        visitedNodesInOrder = bfs(
          grid,
          stationNode,
          finishNode,
          allowedDirections
        );
        visitedNodesInOrder =
          visitedNodesInOrderToStation.concat(visitedNodesInOrder);
      } else {
        visitedNodesInOrder = bfs(
          grid,
          startNode,
          finishNode,
          allowedDirections
        );
      }
    } else {
      const buttonElement = document.getElementById("visualise-button");
      buttonElement.innerHTML = "!!! Select Algorithm !!!";
      isAlgoRunning = 0;
      return;
    }
    updateAlertBox("block", isAlgoRunning, isGeneratingGrid);
    let nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

    if (isStation) {
      nodesInShortestPathOrder = nodesInShotestPathOrderToStation.concat(
        nodesInShortestPathOrder
      );
    }
    this.animateAlgorithm(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      startToStation
    );
  };

  /********************************
  Clear Functionalities 
  Code By: Keerthi, Vamshi
  **********************************/

  clearBoard = () => {
    document.getElementById("distance").innerHTML = 0;
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    stationNodeCol = -1;
    stationNodeRow = -1;
    const buttonElement = document.getElementById("station-button");
    buttonElement.innerHTML = "Add Station";
    this.addingStations = false;
    for (let r = 0; r < this.state.GridRowSize; ++r) {
      for (let c = 0; c < this.state.GridColSize; ++c) {
        if (r === EndNodeRow && c === EndNodeCol) {
          this.changeState(r, c, true, false, false, "node-finish", false, 1);
        } else if (r === StartNodeRow && c === StartNodeCol) {
          this.changeState(r, c, false, true, false, "node-start", false, 1);
        } else {
          this.changeState(r, c, false, false, false, "node ", false, 1);
        }
      }
    }
  };

  clearWalls = () => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    for (let r = 0; r < this.state.grid.length; ++r) {
      for (let c = 0; c < this.state.grid[r].length; ++c) {
        if (this.state.grid[r][c].isWall) {
          this.changeState(r, c, false, false, false, "", false, 1);
        }
      }
    }
  };

  clearWeight = () => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    for (let r = 0; r < this.state.grid.length; ++r) {
      for (let c = 0; c < this.state.grid[r].length; ++c) {
        if (this.state.grid[r][c].weight > 1) {
          this.changeState(r, c, false, false, false, "", false, 1);
        }
      }
    }
  };

  clearPath = () => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    this.removePrevForNextAlgo();
  };

  /********************************
  Change Direction
  Code By: Keerthi, Vamshi
  **********************************/
  changeDirection = (directionCount) => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }
    if (directionCount === 4) {
      document.getElementById("select-directions-toggle-text").innerHTML =
        "Directions-4";
    } else if (directionCount === 8) {
      document.getElementById("select-directions-toggle-text").innerHTML =
        "Directions-8";
    }
    allowedDirections = directionCount;
  };

  /********************************
  Changing Speed
  Code By: Keerthi, Vamshi
  **********************************/
  selectSpeedOfVisualization = (speed) => {
    if (isAlgoRunning >= 1 || isGeneratingGrid === 1) {
      return;
    }

    if (speed === 1.5) {
      // console.log( document.getElementById("select-speed-toggle-text").innerHTML);
      document.getElementById("select-speed-toggle-text").innerHTML =
        "Speed-Slow";
    } else if (speed === 1.0) {
      document.getElementById("select-speed-toggle-text").innerHTML =
        "Speed-Avg";
    } else if (speed === 0.5) {
      document.getElementById("select-speed-toggle-text").innerHTML =
        "Speed-Fast";
    }
    speed_selected = speed;
  };

  /********************************
  Change Theme
  Code By: Keerthi, Vamshi
  **********************************/

  toggleTheme = () => {
    if (theme === 1) {
      theme = 2;
      extraWallClass = "-dark";
      this.setState({});
      document.getElementById("wall-icon").style.backgroundColor =
        "rgb(37,98,145)";
      document.getElementById("unvisited-icon").style.backgroundColor =
        "#17191f";
      document.getElementById("path_find").className = "backg";
      document.getElementById("cth").style.color = "white";
      document.getElementById("alert-box-text").style.color = "darkgrey";
      document.getElementById("albx").className = "shallow-bulge-dark";
      document.getElementById("wn").style.color = "white";
      document.getElementById("st").style.color = "white";
      document.getElementById("en").style.color = "white";
      document.getElementById("sta").style.color = "white";
      document.getElementById("we").style.color = "white";
      document.getElementById("uv").style.color = "white";
      document.getElementById("vis").style.color = "white";
      document.getElementById("sp").style.color = "white";
    } else {
      theme = 1;
      extraWallClass = "";
      this.setState({});
      document.getElementById("wall-icon").style.backgroundColor =
        "rgb(12,53,71)";
      document.getElementById("unvisited-icon").style.backgroundColor =
        "rgb(255,255,255)";
      document.getElementById("path_find").className = "";
      document.getElementById("wn").style.color = "black";
      document.getElementById("alert-box-text").style.color = "#868b8f";
      document.getElementById("albx").className = "shallow-bulge";
      document.getElementById("cth").style.color = "black";
      document.getElementById("st").style.color = "black";
      document.getElementById("en").style.color = "black";
      document.getElementById("sta").style.color = "black";
      document.getElementById("we").style.color = "black";
      document.getElementById("uv").style.color = "black";
      document.getElementById("vis").style.color = "black";
      document.getElementById("sp").style.color = "black";
    }
  };

  /********************************
  Render Function
  Code By: Keerthi, Vamshi
  **********************************/
  render() {
    return (
      <div id="path_find" className="">
        <ControlPanel
          onClickClear_={() => this.clearBoard()}
          onClickVisualize_={() => this.visulalizeAlgorithm()}
          onClickSelect_={(algo) => this.selectAnAlgorithm(algo)}
          onClickAddStation_={() => this.addStation()}
          onClickAddWeight_={(weight) => this.addWeight(weight)}
          onClickChangeSpeed_={(speed) =>
            this.selectSpeedOfVisualization(speed)
          }
          onClickClearPath_={() => this.clearPath()}
          onClickClearWeight_={() => this.clearWeight()}
          onClickClearWalls_={() => this.clearWalls()}
          onClickGenerateMaze_={(mazeAlgo) => this.mazeGenerate(mazeAlgo)}
          onClickChangeDirection_={(directionCount) =>
            this.changeDirection(directionCount)
          }
          onClickToggleTheme_={() => this.toggleTheme()}
          theme={theme}
        ></ControlPanel>
        <div className="grid">
          {this.state.grid.map((row, rowId) => {
            return (
              <div key={rowId} className="mar">
                {row.map((node, nodeId) => {
                  const {
                    col,
                    row,
                    isFinish,
                    isStart,
                    isWall,
                    isStation,
                    refElement,
                  } = node;
                  return (
                    <Node
                      ref={refElement}
                      key={nodeId}
                      col={col}
                      row={row}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      isStation={isStation}
                      theme={theme}
                      onMouseDown_={(row, col) =>
                        this.handleMouseDown(row, col)
                      }
                      onMouseUp_={(row, col) => this.handleMouseUp(row, col)}
                      onMouseEnter_={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseLeave_={(row, col) =>
                        this.handleMouseLeave(row, col)
                      }
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

function initializeGrid(GridRowSize, GridColSize) {
  const grid = [];
  for (let r = 0; r < GridRowSize; ++r) {
    const row = [];
    for (let c = 0; c < GridColSize; ++c) {
      row.push(createNode(r, c));
    }
    grid.push(row);
  }
  return grid;
}

const createNode = (row, col) => {
  return {
    col,
    row,
    isFinish: row === EndNodeRow && col === EndNodeCol,
    isStart: row === StartNodeRow && col === StartNodeCol,
    isWall: false,
    isStation: false,
    distance: Infinity,
    isVisited: false,
    previousNode: null,
    weight: 1,
    refElement: React.createRef(),
  };
};

const updateAlertBox = (display, algoRun, gridGeneration) => {
  document.getElementById("alert-box").style.display = display;
  if (algoRun === 0 && gridGeneration >= 1) {
    document.getElementById("alert-box-text").innerHTML =
      "Buttons Disabled. Generating Grid.";
  } else if (algoRun === 1 && gridGeneration === 0) {
    document.getElementById("alert-box-text").innerHTML =
      "Buttons Disabled. Running Djikstra, a weighted algorithm.";
  } else if (algoRun === 2 && gridGeneration === 0) {
    document.getElementById("alert-box-text").innerHTML =
      "Buttons Disabled. Running A*, a weighted algorithm.";
  } else if (algoRun === 3 && gridGeneration === 0) {
    document.getElementById("alert-box-text").innerHTML =
      "Buttons Disabled. DFS is an unweighted algorithm which does not gaurantee shortest path.";
  } else if (algoRun === 4 && gridGeneration === 0) {
    document.getElementById("alert-box-text").innerHTML =
      "Buttons Disabled. BFS is an unweighted Algorithm.";
  }
};

const isWeightPresent = (grid) => {
  for (let r = 0; r < grid.length; ++r) {
    for (let c = 0; c < grid[r].length; ++c) {
      if (grid[r][c].weight > 1) return true;
    }
  }
  return false;
};
