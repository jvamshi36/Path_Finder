/*
Notes:

1) The JavaScript prototype property allows you to add new properties and methods to object constructors:

*/

export function BinaryHeap(priorityFunction) {
  this.heap = [];
  this.priorityFunction = priorityFunction;
}

BinaryHeap.prototype = {
  push: function (node) {
    // add new value to the end of the array
    this.heap.push(node);

    //balance the heap
    this.heapify(this.heap.length - 1);
  },

  pop: function () {
    // return the first element
    var result = this.heap[0];

    var end = this.heap.pop();

    //If any element is left, put the end element to the start, and let it bubble up
    if (this.heap.length > 0) {
      this.heap[0] = end;
      //push the element downwards if it is greater than its childern
      this.balanceHeapDownwards(0);
    }
    return result;
  },

  remove: function (node) {
    //Get first index of value in heap
    // var i = this.heap.indexOf(node);
    //to be completed
  },

  size: function () {
    return this.heap.length;
  },
  find: function (node) {
    var i = this.heap.indexOf(node);
    if (i === -1) return 0;
    else return 1;
  },
  updateElement: function (node) {
    this.heapify(this.heap.indexOf(node));
  },
  heapify: function (ind) {
    var element = this.heap[ind];

    while (ind > 0) {
      var parentInd = ((ind + 1) >> 1) - 1;
      var parent = this.heap[parentInd];

      //Swap if parent is greater than child
      if (this.priorityFunction(element) < this.priorityFunction(parent)) {
        this.heap[parentInd] = element;
        this.heap[ind] = parent;
        //update ind
        ind = parentInd;
      } else {
        break;
      }
    }
  },
  balanceHeapDownwards: function (n) {
    var length = this.heap.length;
    var element = this.heap[n];
    var elemScore = this.priorityFunction(element);

    while (true) {
      //Compute indices of child elements
      var child2N = (n + 1) << 1;
      var child1N = child2N - 1;

      var swap = null; //store the new position of element
      var child1Score;

      if (child1N < length) {
        //if child exists
        var child1 = this.heap[child1N];
        child1Score = this.priorityFunction(child1);

        //If child's Score is less than parent
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      if (child2N < length) {
        //if child exists
        var child2 = this.heap[child2N];
        var child2Score = this.priorityFunction(child2);

        if (child2Score < (swap == null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }
      // element needs to be moved up
      if (swap != null) {
        this.heap[n] = this.heap[swap];
        this.heap[swap] = element;
        n = swap;
      } else {
        break;
      }
    }
  },
};
