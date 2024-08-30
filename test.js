// const justDeletedListItemID = 222;
// const listItems = [
//   { listItemID: 111, name: 'a', manualOrder: 1 },
//   { listItemID: 222, name: 'b', manualOrder: 2 },
//   { listItemID: 333, name: 'c', manualOrder: 3 },
//   { listItemID: 444, name: 'd', manualOrder: 4 },
// ];

// const listItemsMinusOneJustDeleted = listItems
//   .filter((e) => e.listItemID !== justDeletedListItemID)
//   .sort((a, b) => a.manualOrder - b.manualOrder);

// const updatedManualOrders = listItemsMinusOneJustDeleted.map((e, i) => ({
//   ...e,
//   manualOrder: i + 1,
// }));

// console.log(updatedManualOrders);

// const updates = updatedManualOrders.map((e) => {
//   const { listItemID, ...newObj } = e;
//   return { id: e.listItemID, data: { ...newObj } };
// });

// console.log(updates);

// // if the item's starting index is lower than the destination index: all objects with .mO <= destination index have their .m0s - 1'd
// // if the item's starting index is higher than the destination index: all objects with .m0 >= destination index have their .m0s + 1'd
