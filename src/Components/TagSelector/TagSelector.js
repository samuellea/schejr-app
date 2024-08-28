import React, { useState, useEffect, useRef } from 'react';
import TagOptions from './TagOptions';
import styles from './TagSelector.module.css';
import * as u from '../../utils';
import * as h from '../../helpers';

function TagSelector({
  userUID,
  listItem,
  updateListItem,
  setListItemsModified,
  fetchTags,
  existingTags,
}) {
  const [isInFocus, setIsInFocus] = useState(false);
  const [tagsModified, setTagsModified] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagColor, setNewTagColor] = useState(null);
  const [viewTagOptions, setViewTagOptions] = useState(null);

  const tagSelectorRef = useRef(null);

  const inputContainerCombined = `${styles.inputContainer} ${
    isInFocus ? styles.isInFocus : null
  }`;

  const inputCombined = `${isInFocus ? styles.isInFocus : null} ${
    styles.tagSelectorInput
  }`;

  const tagColorOptions = [
    '#373737', // lightgray
    '#5a5a5a', // gray
    '#603b2c', // brown
    '#654c1c', // orange
    '#835e33', // yellow
    '#2b5940', // green
    '#28456c', // blue
    '#493064', // purple
    '#69314C', // pink
    '#6E3630', // red
  ];

  useEffect(() => {
    console.log('TagSelector useEffect!');
    fetchTags();

    const handleClickOutside = (event) => {
      if (
        tagSelectorRef.current &&
        !tagSelectorRef.current.contains(event.target)
      ) {
        setIsInFocus(false);
        // printSelectedTags(selectedTagsRef.current); // Use the ref to get the latest value
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const leastUsedColours = h.leastUsedColours(tagColorOptions, existingTags);
    const randomIndex = Math.floor(Math.random() * leastUsedColours.length);
    const newTagColor = leastUsedColours[randomIndex];
    setNewTagColor(newTagColor);
  }, [existingTags]);

  useEffect(() => {
    fetchTags();
    setTagsModified(false);
  }, [tagsModified]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
  };

  const handleCreateTag = async (newTagColor) => {
    const tagData = {
      name: inputText,
      color: newTagColor, //
      userUID,
    };
    try {
      const newTagID = await u.createNewTag(tagData);
      try {
        const updatedListItemTags = [...(listItem.tags || []), newTagID];
        const listItemTagsUpdated = await updateListItem(
          listItem.listItemID,
          'tags',
          updatedListItemTags
        );
        setListItemsModified(true);
      } catch (error) {
        console.error('Failed to write tag to list item:', error);
      }
      setTagsModified(true);
      setInputText('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleSelectExistingTag = async (tag) => {
    console.log(tag);
    console.log(listItem.tags);
    if (listItem?.tags?.find((e) => e === tag.tagID)) return;
    // add this tag to this List's tags
    try {
      const updatedListItemTags = listItem.tags?.length
        ? [...listItem.tags, tag.tagID]
        : [tag.tagID];
      const listItemTagsUpdated = await updateListItem(
        listItem.listItemID,
        'tags',
        updatedListItemTags
      );
      setListItemsModified(true);
      setInputText('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }

    // const updatedSelectedTags = [...selectedTags, tag];
    // setSelectedTags(updatedSelectedTags);
  };

  const handleRemoveSelectedTag = async (tagID) => {
    // const updatedSelectedTags = [
    //   ...selectedTags.filter((e) => e.tagID !== tagID),
    // ];
    // console.log(updatedSelectedTags.map((e) => e.name));
    // setSelectedTags(updatedSelectedTags);
    try {
      const updatedListItemTags = [
        ...listItem?.tags.filter((e) => e !== tagID),
      ];
      const listItemTagsUpdated = await updateListItem(
        listItem.listItemID,
        'tags',
        updatedListItemTags
      );
      setListItemsModified(true);
      setInputText('');
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleOptionsClick = (tag) => {
    if (!viewTagOptions) {
      setViewTagOptions(tag);
    } else {
      setViewTagOptions(null);
    }
  };

  return (
    <div
      className={styles.container}
      ref={tagSelectorRef}
      onClick={(e) => {
        // e.stopPropagation();
      }}
    >
      <div className={inputContainerCombined}>
        {listItem?.tags?.map((tagID) => {
          const matchingTag = existingTags?.find(
            (existingTag) => existingTag.tagID === tagID
          );
          return (
            <div
              className={styles.selectedTag}
              style={{ backgroundColor: matchingTag?.color }}
            >
              <p>{matchingTag?.name}</p>
              {isInFocus ? (
                <div
                  role="button"
                  className={styles.selectedTagRemoveButton}
                  onClick={() => handleRemoveSelectedTag(matchingTag?.tagID)}
                >
                  X
                </div>
              ) : null}
            </div>
          );
        })}
        <input
          className={inputCombined}
          onClick={(e) => {
            e.stopPropagation();
            setIsInFocus(true);
          }}
          onChange={handleInputChange}
          value={inputText}
        />
        {isInFocus ? (
          <div className={styles.dropdown}>
            <p className={styles.selectP}>Select a tag or create one</p>
            {/* map over tags that exist - if no text entered, display all existing tags - if text entered filter out any that don't match input text */}
            {existingTags
              .filter((e) =>
                e.name.toLowerCase().includes(inputText.toLowerCase())
              )
              .map((tag) => (
                <div
                  className={styles.existingTagButton}
                  onClick={() => handleSelectExistingTag(tag)}
                >
                  <div
                    className={styles.existingTagLabel}
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </div>
                  <div
                    role="button"
                    className={styles.existingTagOptionsButton}
                    onClick={(e) => {
                      // e.stopPropagation();
                      handleOptionsClick(tag);
                    }}
                  >
                    💬
                    {viewTagOptions && tag.tagID === viewTagOptions.tagID ? (
                      <TagOptions
                        tag={viewTagOptions}
                        tagColorOptions={tagColorOptions}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            {/* if input text doesn't EXACTLY match any existing tags, have a 'Create <new tag name>' button */}
            {inputText.length &&
            !existingTags
              .map((e) => e.name.toLowerCase())
              .includes(inputText.toLowerCase()) ? (
              <div
                className={styles.createTagButton}
                onClick={() => handleCreateTag(newTagColor)}
              >
                <div className={styles.createTagButtonLabel}>Create</div>
                <div
                  className={styles.createTagButtonName}
                  style={{ backgroundColor: newTagColor }}
                >
                  {inputText}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TagSelector;
