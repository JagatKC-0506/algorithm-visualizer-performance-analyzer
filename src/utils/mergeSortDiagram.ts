export interface MergeSortNodeData {
  id: string;
  start: number;
  end: number;
  values: number[];
  depth: number;
  children: [string, string] | null;
}

export interface MergeSortFrameNode {
  id: string;
  values: number[];
  state: 'hidden' | 'dividing' | 'merging' | 'done';
}

export interface MergeSortFrameData {
  nodes: MergeSortFrameNode[];
  description: string;
}

export interface MergeSortDiagramData {
  allNodes: MergeSortNodeData[];
  frames: MergeSortFrameData[];
}

interface TreeBuilder {
  node: MergeSortNodeData;
  left?: TreeBuilder;
  right?: TreeBuilder;
}

function buildTree(arr: number[], start: number, end: number, depth: number): TreeBuilder {
  const id = `${start}-${end}`;
  const values = arr.slice(start, end);
  if (end - start <= 1) {
    return { node: { id, start, end, values, depth, children: null } };
  }
  const mid = Math.floor((start + end) / 2);
  const left = buildTree(arr, start, mid, depth + 1);
  const right = buildTree(arr, mid, end, depth + 1);
  return {
    node: { id, start, end, values, depth, children: [left.node.id, right.node.id] },
    left,
    right,
  };
}

function flattenTree(builder: TreeBuilder): MergeSortNodeData[] {
  const result = [builder.node];
  if (builder.left) result.push(...flattenTree(builder.left));
  if (builder.right) result.push(...flattenTree(builder.right));
  return result;
}

function mergeSorted(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++]);
    else result.push(b[j++]);
  }
  return [...result, ...a.slice(i), ...b.slice(j)];
}

function makeFrame(
  allNodes: MergeSortNodeData[],
  nodeValues: Map<string, number[]>,
  nodeStates: Map<string, 'hidden' | 'dividing' | 'merging' | 'done'>,
  description: string,
): MergeSortFrameData {
  return {
    nodes: allNodes.map(n => ({
      id: n.id,
      values: [...(nodeValues.get(n.id) ?? n.values)],
      state: nodeStates.get(n.id) ?? 'hidden',
    })),
    description,
  };
}

export function generateMergeSortDiagram(arr: number[]): MergeSortDiagramData {
  if (arr.length === 0) return { allNodes: [], frames: [] };

  const tree = buildTree(arr, 0, arr.length, 0);
  const allNodes = flattenTree(tree);

  const frames: MergeSortFrameData[] = [];
  const nodeValues = new Map<string, number[]>();
  const nodeStates = new Map<string, 'hidden' | 'dividing' | 'merging' | 'done'>();

  for (const n of allNodes) {
    nodeValues.set(n.id, [...n.values]);
    nodeStates.set(n.id, 'hidden');
  }

  function revealPreOrder(builder: TreeBuilder) {
    nodeStates.set(builder.node.id, 'dividing');

    const desc = builder.node.children
      ? `Divide [${builder.node.values}] → [` +
        `${builder.left!.node.values}] and [${builder.right!.node.values}]`
      : `Single element [${builder.node.values}] \u2014 base case`;

    frames.push(makeFrame(allNodes, nodeValues, nodeStates, desc));
    nodeStates.set(builder.node.id, 'done');

    if (builder.left) revealPreOrder(builder.left);
    if (builder.right) revealPreOrder(builder.right);
  }

  revealPreOrder(tree);

  function mergePostOrder(builder: TreeBuilder) {
    if (!builder.left || !builder.right) return;

    mergePostOrder(builder.left);
    mergePostOrder(builder.right);

    const leftVals = nodeValues.get(builder.left.node.id)!;
    const rightVals = nodeValues.get(builder.right.node.id)!;
    const merged = mergeSorted(leftVals, rightVals);

    nodeValues.set(builder.node.id, merged);
    nodeStates.set(builder.node.id, 'merging');

    frames.push(makeFrame(
      allNodes,
      nodeValues,
      nodeStates,
      `Merge [${leftVals}] + [${rightVals}] \u2192 [${merged}]`,
    ));

    nodeStates.set(builder.node.id, 'done');
  }

  mergePostOrder(tree);

  nodeStates.set(tree.node.id, 'done');
  frames.push(makeFrame(
    allNodes,
    nodeValues,
    nodeStates,
    `Sorted array: [${nodeValues.get(tree.node.id)}]`,
  ));

  return { allNodes, frames };
}
