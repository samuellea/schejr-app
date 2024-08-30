// test/helpers.test.js
import { expect } from 'chai';
import { reorderListItemsOnManualOrder } from '../src/helpers';

describe('reorderListItemsOnManualOrder', function () {
  const listItems = [
    { listItemID: 111, manualOrder: 1 },
    { listItemID: 222, manualOrder: 2 },
    { listItemID: 333, manualOrder: 3 },
    { listItemID: 444, manualOrder: 4 },
    { listItemID: 555, manualOrder: 5 },
  ];

  it('should reorder items correctly', function () {
    const result = reorderListItemsOnManualOrder(listItems, 0, 2);
    const expected = [
      { listItemID: 222, manualOrder: 2 },
      { listItemID: 333, manualOrder: 3 },
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 444, manualOrder: 4 },
      { listItemID: 555, manualOrder: 5 },
    ];
    expect(result).to.deep.equal(expected);
  });
});
