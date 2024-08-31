// test/helpers.test.js
import { expect } from 'chai';
import { updatedManualOrders } from '../src/helpers.js';

describe('arr of 2', function () {
  const listItems = [
    { listItemID: 111, manualOrder: 1 },
    { listItemID: 222, manualOrder: 2 },
  ];
  it('1 to end', function () {
    const objAtIndex = 0;
    const moveToIndex = 1;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
    ];
    const ocExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('2 to start', function () {
    const objAtIndex = 1;
    const moveToIndex = 0;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
    ];
    const ocExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  describe('arr of 3', function () {
    const listItems = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 222, manualOrder: 2 },
      { listItemID: 333, manualOrder: 3 },
    ];
    it('1 to 2', function () {
      const objAtIndex = 0;
      const moveToIndex = 1;
      const { newMOrders, onlyChanged } = updatedManualOrders(
        listItems,
        objAtIndex,
        moveToIndex
      );
      const nmoExpected = [
        { listItemID: 222, manualOrder: 1 },
        { listItemID: 111, manualOrder: 2 },
        { listItemID: 333, manualOrder: 3 },
      ];
      const ocExpected = [
        { listItemID: 222, manualOrder: 1 },
        { listItemID: 111, manualOrder: 2 },
      ];
      expect(newMOrders).to.deep.equal(nmoExpected);
      expect(onlyChanged).to.deep.equal(ocExpected);
    });

    it('1 to 3', function () {
      const objAtIndex = 0;
      const moveToIndex = 2;
      const { newMOrders, onlyChanged } = updatedManualOrders(
        listItems,
        objAtIndex,
        moveToIndex
      );
      const nmoExpected = [
        { listItemID: 222, manualOrder: 1 },
        { listItemID: 333, manualOrder: 2 },
        { listItemID: 111, manualOrder: 3 },
      ];
      const ocExpected = [
        { listItemID: 222, manualOrder: 1 },
        { listItemID: 333, manualOrder: 2 },
        { listItemID: 111, manualOrder: 3 },
      ];
      expect(newMOrders).to.deep.equal(nmoExpected);
      expect(onlyChanged).to.deep.equal(ocExpected);
    });

    it('2 to 1', function () {
      const objAtIndex = 1;
      const moveToIndex = 0;
      const { newMOrders, onlyChanged } = updatedManualOrders(
        listItems,
        objAtIndex,
        moveToIndex
      );
      const nmoExpected = [
        { listItemID: 222, manualOrder: 1 },
        { listItemID: 111, manualOrder: 2 },
        { listItemID: 333, manualOrder: 3 },
      ];
      const ocExpected = [
        { listItemID: 222, manualOrder: 1 },
        { listItemID: 111, manualOrder: 2 },
      ];
      expect(newMOrders).to.deep.equal(nmoExpected);
      expect(onlyChanged).to.deep.equal(ocExpected);
    });

    it('2 to 3', function () {
      const objAtIndex = 1;
      const moveToIndex = 2;
      const { newMOrders, onlyChanged } = updatedManualOrders(
        listItems,
        objAtIndex,
        moveToIndex
      );
      const nmoExpected = [
        { listItemID: 111, manualOrder: 1 },
        { listItemID: 333, manualOrder: 2 },
        { listItemID: 222, manualOrder: 3 },
      ];
      const ocExpected = [
        { listItemID: 333, manualOrder: 2 },
        { listItemID: 222, manualOrder: 3 },
      ];
      expect(newMOrders).to.deep.equal(nmoExpected);
      expect(onlyChanged).to.deep.equal(ocExpected);
    });

    it('3 to 1', function () {
      const objAtIndex = 2;
      const moveToIndex = 0;
      const { newMOrders, onlyChanged } = updatedManualOrders(
        listItems,
        objAtIndex,
        moveToIndex
      );
      const nmoExpected = [
        { listItemID: 333, manualOrder: 1 },
        { listItemID: 111, manualOrder: 2 },
        { listItemID: 222, manualOrder: 3 },
      ];
      const ocExpected = [
        { listItemID: 333, manualOrder: 1 },
        { listItemID: 111, manualOrder: 2 },
        { listItemID: 222, manualOrder: 3 },
      ];
      expect(newMOrders).to.deep.equal(nmoExpected);
      expect(onlyChanged).to.deep.equal(ocExpected);
    });

    it('3 to 2', function () {
      const objAtIndex = 2;
      const moveToIndex = 1;
      const { newMOrders, onlyChanged } = updatedManualOrders(
        listItems,
        objAtIndex,
        moveToIndex
      );
      const nmoExpected = [
        { listItemID: 111, manualOrder: 1 },
        { listItemID: 333, manualOrder: 2 },
        { listItemID: 222, manualOrder: 3 },
      ];
      const ocExpected = [
        { listItemID: 333, manualOrder: 2 },
        { listItemID: 222, manualOrder: 3 },
      ];
      expect(newMOrders).to.deep.equal(nmoExpected);
      expect(onlyChanged).to.deep.equal(ocExpected);
    });

    /////////////////////////////////////////////
  });
});

describe('arr of 4', function () {
  const listItems = [
    { listItemID: 111, manualOrder: 1 },
    { listItemID: 222, manualOrder: 2 },
    { listItemID: 333, manualOrder: 3 },
    { listItemID: 444, manualOrder: 4 },
  ];
  it('1 to 2', function () {
    const objAtIndex = 0;
    const moveToIndex = 1;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
      { listItemID: 333, manualOrder: 3 },
      { listItemID: 444, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('1 to 3', function () {
    const objAtIndex = 0;
    const moveToIndex = 2;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 111, manualOrder: 3 },
      { listItemID: 444, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 111, manualOrder: 3 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('1 to 4', function () {
    const objAtIndex = 0;
    const moveToIndex = 3;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 111, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 111, manualOrder: 4 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('2 to 1', function () {
    const objAtIndex = 1;
    const moveToIndex = 0;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
      { listItemID: 333, manualOrder: 3 },
      { listItemID: 444, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 222, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('2 to 3', function () {
    const objAtIndex = 1;
    const moveToIndex = 2;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 444, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('2 to 4', function () {
    const objAtIndex = 1;
    const moveToIndex = 3;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 222, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 222, manualOrder: 4 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('3 to 1', function () {
    const objAtIndex = 2;
    const moveToIndex = 0;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 333, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 444, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 333, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('3 to 2', function () {
    const objAtIndex = 2;
    const moveToIndex = 1;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 444, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 333, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('3 to 4', function () {
    const objAtIndex = 2;
    const moveToIndex = 3;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 222, manualOrder: 2 },
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('4 to 1', function () {
    const objAtIndex = 3;
    const moveToIndex = 0;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 444, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 444, manualOrder: 1 },
      { listItemID: 111, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('4 to 2', function () {
    const objAtIndex = 3;
    const moveToIndex = 1;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 444, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 444, manualOrder: 2 },
      { listItemID: 222, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  it('4 to 3', function () {
    const objAtIndex = 3;
    const moveToIndex = 2;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
      { listItemID: 111, manualOrder: 1 },
      { listItemID: 222, manualOrder: 2 },
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    const ocExpected = [
      { listItemID: 444, manualOrder: 3 },
      { listItemID: 333, manualOrder: 4 },
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
});

/*
    it('', function () {
    const listItems = [
    
    ];
    const objAtIndex = 0;
    const moveToIndex = 1;
    const { newMOrders, onlyChanged } = updatedManualOrders(
      listItems,
      objAtIndex,
      moveToIndex
    );
    const nmoExpected = [
    
    ];
    const ocExpected = [
    
    ];
    expect(newMOrders).to.deep.equal(nmoExpected);
    expect(onlyChanged).to.deep.equal(ocExpected);
  });
  */
