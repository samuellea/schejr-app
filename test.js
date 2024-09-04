const list = { id: 1, name: 'hello', comment: '' };
const newListValues = { name: 'goodbye' };

const { id: unneededListID, ...rest } = list;
const updatedList = { ...rest, ...newListValues };
