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
  const [tagOptions, setTagOptions] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [childClickedOutside, setChildClickedOutside] = useState(false);

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

  const handleUpdateExistingTag = async (tag, field, value) => {
    // only run if field value has actually changed
    if (tagOptions[field] !== value) {
      const { tagID: unneededTagID, ...rest } = tag;
      const updatedTag = { ...rest, [field]: value };

      try {
        const tagUpdated = await u.patchTag(tag.tagID, updatedTag);
        setTagsModified(true);
        setListItemsModified(true);
        // if (tagOptions) setTagOptions(null); // close the Options menu if it's open
      } catch (error) {
        console.error('Failed to update tag:', error);
        if (tagOptions) setTagOptions(null); // close the Options menu if it's open
      }
    }
  };

  const handleDeleteTag = async (tagID) => {
    try {
      const tagDeleted = await u.deleteTagByID(tagID);
      try {
        const listItemsThatContainedTagID =
          await u.findAndRemoveTagIDFromMatchingListItems(tagID);
        setTagsModified(true);
        setListItemsModified(true);
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
    console.log('tags modified! fetching tags...');
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
    //  => e.name));
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
    if (!tagOptions) {
      setTagOptions(tag);
    } else {
      setTagOptions(null);
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
        {listItem?.tags?.length ? (
          listItem?.tags?.map((tagID) => {
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
          })
        ) : !isInFocus ? (
          <p className={styles.emptyLabel}>Empty</p>
        ) : null}
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
                <div className={styles.existingTagButton}>
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
                    💬
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
