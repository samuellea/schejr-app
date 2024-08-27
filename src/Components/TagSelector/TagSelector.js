import React, { useState, useEffect, useRef } from 'react';
import styles from './TagSelector.module.css';
import * as u from '../../utils';

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

  const tagSelectorRef = useRef(null);

  const inputContainerCombined = `${styles.inputContainer} ${
    isInFocus ? styles.isInFocus : null
  }`;

  const inputCombined = `${isInFocus ? styles.isInFocus : null}`;

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
    fetchTags();
    setTagsModified(false);
  }, [tagsModified]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
  };

  const handleCreateTag = async () => {
    const tagData = {
      name: inputText,
      color: 'red',
      userUID,
    };
    try {
      const newTagID = await u.createNewTag(tagData);
      try {
        const updatedListItemTags = [...listItem.tags, newTagID];
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
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleSelectExistingTag = async (tag) => {
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
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  return (
    <div
      className={styles.container}
      ref={tagSelectorRef}
      onClick={(e) => {
        e.stopPropagation();
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
        />
        {isInFocus ? (
          <div className={styles.dropdown}>
            <p className={styles.selectP}>Select a tag or create one</p>
            {/* map over tags that exist - if no text entered, display all existing tags - if text entered filter out any that don't match input text */}
            {existingTags.map((tag) => (
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
                <div className={styles.existingTagOptionsButton}>💬</div>
              </div>
            ))}
            {/* if input text doesn't EXACTLY match any existing tags, have a 'Create <new tag name>' button */}
            {inputText.length ? (
              <div className={styles.createTagButton} onClick={handleCreateTag}>
                <div className={styles.createTagButtonLabel}>Create</div>
                <div className={styles.createTagButtonName}>{inputText}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TagSelector;
