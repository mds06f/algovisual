// public/algorithms/stackQueue.js

export const algorithm = {
  name: 'Stack & Queue Data Structures',
  category: 'Data Structures',
  description:
    'Interactive visualization of fundamental linear data structures. Demonstrates Last-In First-Out (LIFO) Stack operations (Push, Pop) and First-In First-Out (FIFO) Queue operations (Enqueue, Dequeue) with dynamic pointer markers.',
  pseudocode: [
    'Stack Push(x): top = top + 1, stack[top] = x',
    'Stack Pop(): val = stack[top], top = top - 1',
    'Queue Enqueue(x): rear = rear + 1, queue[rear] = x',
    'Queue Dequeue(): val = queue[front], front = front + 1',
    'Deque PushFront(x): shift elements right, deque[0] = x',
    'Deque PopFront(): val = deque[0], shift elements left'
  ],
  generator: function (arr) {
    const snapshots = [];
    const elements = [...arr];
    const n = elements.length;

    let operationCount = 0;
    const stats = () => ({
      comparisons: operationCount,
      swaps: 0,
      complexity: { time: 'O(1)', space: 'O(n)' },
    });

    // Initial snapshot: Stack state
    snapshots.push({
      array: [...elements],
      highlights: [n - 1],
      pointers: { TOP: n - 1, FRONT: 0, REAR: n - 1 },
      executingLine: 0,
      stats: stats(),
      description: `Initialized linear data structure with ${n} elements. Stack TOP at index ${n - 1}, Queue FRONT at 0, REAR at ${n - 1}.`,
    });

    // Demonstrate Stack Push demo step
    const pushVal = 50;
    elements.push(pushVal);
    operationCount++;
    snapshots.push({
      array: [...elements],
      highlights: [elements.length - 1],
      pointers: { TOP: elements.length - 1, FRONT: 0, REAR: elements.length - 1 },
      executingLine: 0,
      stats: stats(),
      description: `Stack PUSH / Queue ENQUEUE: Inserted element ${pushVal}. TOP/REAR updated to index ${elements.length - 1}.`,
    });

    // Demonstrate Stack Pop / Queue Dequeue demo step
    const poppedVal = elements.pop();
    operationCount++;
    snapshots.push({
      array: [...elements],
      highlights: [elements.length - 1],
      pointers: { TOP: elements.length - 1, FRONT: 0, REAR: elements.length - 1 },
      executingLine: 1,
      stats: stats(),
      description: `Stack POP: Removed top element ${poppedVal}. TOP restored to index ${elements.length - 1}.`,
    });

    return snapshots;
  },
};
