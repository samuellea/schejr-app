const listItems = [
  { listItemID: 111, manualOrder: 1 }, // 0
  { listItemID: 222, manualOrder: 2 }, // 1 DDD
  { listItemID: 333, manualOrder: 3 }, // 2
  { listItemID: 444, manualOrder: 4 }, // 3 SSS
  { listItemID: 555, manualOrder: 5 }, // 4
];
const startIndex = 3;
const destinationIndex = 1;
// ----
const reordered = [...listItems];
const itemToMove = reordered[startIndex];
const itemAtDestination = reordered[destinationIndex];

reordered.splice(startIndex, 1);
reordered.splice(destinationIndex, 0, itemToMove);
// then map to change ALL manualOrders to index + 1
const newManualOrders = reordered.map((e, i) => ({
  ...e,
  manualOrder: i + 1,
}));

// only update objects where .manualOrder has changed
const onlyChanged = newManualOrders.reduce((acc, f, i) => {
  const original = listItems.find((e) => e.listItemID === f.listItemID);
  if (f.manualOrder !== original.manualOrder) acc.push(f);
  return acc;
}, []);
