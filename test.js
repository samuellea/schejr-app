const existingTags = [
  { color: '', name: 'Man' },
  { color: '', name: 'Woman' },
  { color: '', name: 'Fish' },
];

const inputText = 'man';

const res = existingTags
  .map((e) => e.name.toLowerCase())
  .includes(inputText.toLowerCase());
console.log(res);

const colors = ['red', 'blue', 'green', 'yellow'];

const thing = (colorOptions, existingTags) => {
  const initialTally = colorOptions.map((e) => ({ [e]: 0 }));

  const tags = [
    { id: 1, color: 'blue' },
    { id: 2, color: 'green' },
    { id: 3, color: 'red' },
    { id: 4, color: 'yellow' },
    { id: 5, color: 'red' },
    { id: 6, color: 'red' },
    { id: 7, color: 'yellow' },
  ];

  const tally = initialTally.map((obj) => {
    const key = Object.keys(obj)[0];
    const count = existingTags.filter((tag) => tag.color === key).length;
    return { [key]: count };
  });

  const getObjectsWithLowestValue = (arr) => {
    const values = arr.map((obj) => Math.min(...Object.values(obj)));
    const minValue = Math.min(...values);
    const onlyLowestObjs = arr.filter(
      (obj) => Math.min(...Object.values(obj)) === minValue
    );
    return onlyLowestObjs.map((e) => Object.keys(e)[0]);
  };

  const leastUsedColours = getObjectsWithLowestValue(tally);
  return leastUsedColours;
};
