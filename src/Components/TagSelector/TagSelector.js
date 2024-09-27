import React, { useState, useEffect, useRef } from 'react';
import TagOptions from './TagOptions';
import styles from './TagSelector.module.css';
import * as u from '../../utils';
import * as h from '../../helpers';
import CloseIcon from '../Icons/CloseIcon';
import EllipsisIcon from '../Icons/EllipsisIcon';

function TagSelector({
  userUID,
  listItem,
  updateListItem,
  // fetchTags,
  existingTags,
  setExistingTags,
  listItems,
  setListItems,
  handleEntities,
}) {
  const [isInFocus, setIsInFocus] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagColor, setNewTagColor] = useState(null);
  const [tagOptions, setTagOptions] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childClickedOutside, setChildClickedOutside] = useState(false);

  const tagSelectorRef = useRef(null);
  const inputRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (
        tagSelectorRef.current &&
        !tagSelectorRef.current.contains(event.target)
      ) {
        handleClickOutsideParent();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [childClickedOutside]); // Depend on childClickedOutside

  useEffect(() => {
    const leastUsedColours = h.leastUsedColours(tagColorOptions, existingTags);
    const randomIndex = Math.floor(Math.random() * leastUsedColours.length);
    const newTagColor = leastUsedColours[randomIndex];
    setNewTagColor(newTagColor);
  }, [existingTags]);

  useEffect(() => {
    if (isInFocus) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isInFocus]);

  useEffect(() => {}, [listItems]);

  const handleCreateTag = async (newTagColor) => {
    // setIsInFocus(false);
    const newTagData = {
      name: inputText,
      color: newTagColor, //
      userUID,
    };
    try {
      // create this tag on the db
      const newTagID = await u.createNewTag(userUID, newTagData);
      try {
        // update tags in app state
        const newTagPlusID = { ...newTagData, tagID: newTagID };
        const updatedExistingTags = [...existingTags, newTagPlusID];
        setExistingTags(updatedExistingTags);
        //////// 🚨 AND ALSO UPDATE LISTITEM'S .TAGS IN STATE!
        // then update listItem on db to have this new tag in .tags
        const updatedListItemTags = [...(listItem.tags || []), newTagID];
        const updatedListItem = { ...listItem, tags: updatedListItemTags };
        await handleEntities.updateEventAndDates('tags', updatedListItem);
      } catch (error) {
        console.error('Failed to write tag to list item:', error);
      }
      setInputText('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleUpdateExistingTag = async (tag, field, value) => {
    // only run if field value has actually changed
    if (tagOptions[field] !== value) {
      const { tagID: unneededTagID, ...rest } = tag;
      const updatedTag = { ...rest, [field]: value };
      try {
        // update tags in app state
        const updatedTagPlusID = { ...updatedTag, tagID: unneededTagID };
        const existingTagsMinusThisTag = existingTags.filter(
          (e) => e.tagID !== unneededTagID
        );
        const updatedExistingTags = [
          ...existingTagsMinusThisTag,
          updatedTagPlusID,
        ];
        setExistingTags(updatedExistingTags);
        // then patch this tag on the db
        const tagUpdated = await u.patchTag(userUID, tag.tagID, updatedTag);
      } catch (error) {
        console.error('Failed to update tag:', error);
        if (tagOptions) setTagOptions(null); // close the Options menu if it's open
      }
    }
  };

  const handleDeleteTag = async (tagID) => {
    try {
      await u.deleteTagByID(userUID, tagID);
      try {
        // update 'tags' state to no longer contain the deleted tag
        const existingTagsMinusDeletedTag = existingTags.filter(
          (e) => e.tagID !== tagID
        );
        setExistingTags(existingTagsMinusDeletedTag);
        // then handle removing the deleted tag from any all ListItems and Events that used it
        // on the db + in state
        await handleEntities.deleteTagFromEntities(tagID);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Failed to remove tag from matching list items:', error);
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const handleClickOutsideParent = () => {
    if (!childClickedOutside) {
      // Prevent the parent logic from firing until the child's logic has executed

      setIsInFocus(false);
    } else {
      // handleUpdateExistingTag(tagOptions, 'name', tagRenameText);
      setTagOptions(null); // close the Options menu if it's open
    }
    // Reset the state for future clicks
    setChildClickedOutside(false);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
  };

  const handleSelectExistingTag = async (tag) => {
    if (listItem?.tags?.find((e) => e === tag.tagID)) return;
    // add this tag to this List's tags
    try {
      const updatedListItemTags = listItem.tags?.length
        ? [...listItem.tags, tag.tagID]
        : [tag.tagID];
      // const listItemTagsUpdated = await updateListItem(listItem,'tags',updatedListItemTags);
      const updatedListItem = { ...listItem, tags: updatedListItemTags };
      await handleEntities.updateEventAndDates('tags', updatedListItem);
      setInputText('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleRemoveSelectedTag = async (tagID) => {
    try {
      const updatedListItemTags = [
        ...listItem?.tags.filter((e) => e !== tagID),
      ];
      const updatedListItem = { ...listItem, tags: updatedListItemTags };
      await handleEntities.updateEventAndDates('tags', updatedListItem);
      setInputText('');
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleOptionsClick = (tag) => {
    if (!tagOptions) {
      setTagOptions(tag);
    } else {
      setTagOptions(null);
    }
  };

  const handleInputContainerClick = () => {
    setIsInFocus(true);
  };

  const handleKeyDown = (e) => {
    // Check if the pressed key is Enter (key code 13)
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag(newTagColor);
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
      <div
        className={inputContainerCombined}
        onClick={handleInputContainerClick}
      >
        {listItem?.tags?.length ? (
          listItem?.tags?.map((tagID) => {
            const matchingTag = existingTags?.find(
              (existingTag) => existingTag.tagID === tagID
            );
            return (
              <div
                className={styles.selectedTag}
                style={{ backgroundColor: matchingTag?.color }}
                key={`tag-${tagID}`}
              >
                <p className={styles.selectedTagLabel}>{matchingTag?.name}</p>
                {isInFocus ? (
                  <div
                    role="button"
                    className={styles.selectedTagRemoveButton}
                    onClick={() => handleRemoveSelectedTag(matchingTag?.tagID)}
                  >
                    <CloseIcon fill="white" width="12px" />
                  </div>
                ) : null}
              </div>
            );
          })
        ) : !isInFocus ? (
          <p className={styles.emptyLabel}>Add tags</p>
        ) : null}
        {isInFocus ? (
          <input
            className={inputCombined}
            onClick={(e) => {
              e.stopPropagation();
              setIsInFocus(true);
            }}
            onChange={handleInputChange}
            value={inputText}
            ref={inputRef}
            onKeyDown={handleKeyDown}
          />
        ) : null}
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
                  key={`existingTag-${tag.tagID}`}
                >
                  <div
                    className={styles.existingTagLabelWrapper}
                    onClick={() => handleSelectExistingTag(tag)}
                  >
                    <div
                      className={styles.existingTagLabel}
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </div>
                  </div>
                  <div
                    role="button"
                    className={styles.existingTagOptionsButton}
                    onClick={(e) => {
                      // e.stopPropagation();
                      handleOptionsClick(tag);
                    }}
                  >
                    <EllipsisIcon fill="#d5d5d5" width="12px" />
                    {tagOptions && tag.tagID === tagOptions.tagID ? (
                      <TagOptions
                        tag={tagOptions}
                        tagColorOptions={tagColorOptions}
                        handleUpdateExistingTag={handleUpdateExistingTag}
                        onChildClickOutside={() => setChildClickedOutside(true)}
                        handleDeleteTag={handleDeleteTag}
                        showDeleteModal={showDeleteModal}
                        setShowDeleteModal={setShowDeleteModal}
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
