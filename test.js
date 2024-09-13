const allListItemsThatHadTagIDinTags = [
  { id: 2, tags: ['ccc', 'ddd', 'aaa'] },
  { id: 3, tags: ['aaa', 'bbb'] },
];

const tagID = 'aaa';

const updatedListItems = allListItemsThatHadTagIDinTags.map((e) => ({
  ...e,
  tags: [...e.tags.filter((f) => f !== tagID)],
}));
