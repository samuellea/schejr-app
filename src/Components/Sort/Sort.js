import React, { useState, useRef, useEffect } from 'react';
import styles from './Sort.module.css';
import TitleIcon from '../Icons/TitleIcon';
import TagsIcon from '../Icons/TagsIcon';
import DateIcon from '../Icons/DateIcon';
import TickIcon from '../Icons/TickIcon';
import ArrowIcon from '../Icons/ArrowIcon';
import CloseIcon from '../Icons/CloseIcon';

function Sort({
  sortOn,
  setSortOn,
  order,
  setOrder,
  handleToggleOrder,
  existingTags,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []); // Depend on childClickedOutside

  const capitalizedOrderLabel = order.charAt(0).toUpperCase() + order.slice(1);
  const capitalizedSortLabel =
    sortOn === 'startDate'
      ? 'Date'
      : sortOn.charAt(0).toUpperCase() + sortOn.slice(1);
  // const arrowDirection = order !== 'ascending' ? 'rotate(180deg)' : 'rotate(0deg)'

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const sortDropdownCombined = `${styles.sortDropdown} ${
    showDropdown ? styles.dropdownOpen : null
  }`;

  const handleClearSort = () => {
    setSortOn('manualOrder');
    setOrder('ascending');
    setShowDropdown(false);
  };

  const sortWindowCombined = `${styles.sortWindow} ${
    sortOn !== 'manualOrder' ? styles.sortWindowActive : null
  }`;

  const orderWindowCombined = `${styles.sortWindow} ${styles.orderWindowActive}`;

  const handleSortSelect = (sortOn) => {
    setSortOn(sortOn);
    setShowDropdown(false);
  };

  return (
    <div className={styles.container}>
      <div className={sortWindowCombined} onClick={toggleDropdown}>
        {sortOn !== 'manualOrder' ? capitalizedSortLabel : 'Sort'}
      </div>

      {sortOn !== 'manualOrder' ? (
        <div className={orderWindowCombined} onClick={handleToggleOrder}>
          {capitalizedOrderLabel}
          {sortOn !== 'manualOrder' ? (
            <ArrowIcon
              width="14px"
              fill="rgb(109, 182, 255)"
              flip={order !== 'ascending' ? true : false}
            />
          ) : null}
        </div>
      ) : null}
      {sortOn !== 'manualOrder' ? (
        <div className={styles.clearSortButton} onClick={handleClearSort}>
          <CloseIcon fill="#8b9898" width="14px" />
          <span className={styles.clearSortButtonLabel}>Clear Sort</span>
        </div>
      ) : null}

      <div className={sortDropdownCombined} ref={sortDropdownRef}>
        <div
          className={`${styles.sortButtons} ${
            sortOn === 'title' ? styles.selected : null
          }`}
          onClick={() => handleSortSelect('title')}
        >
          <TitleIcon />
          <span className={styles.sortLabel}>Title</span>
          {sortOn === 'title' ? (
            <span className={styles.sortTick}>
              <TickIcon width="14px" />
            </span>
          ) : null}
        </div>
        <div
          className={`${styles.sortButtons} ${
            sortOn === 'tags' ? styles.selected : null
          }`}
          onClick={() => handleSortSelect('tags')}
        >
          <TagsIcon />
          <span className={styles.sortLabel}>Tags</span>
          {sortOn === 'tags' ? (
            <span className={styles.sortTick}>
              <TickIcon width="14px" />
            </span>
          ) : null}
        </div>
        <div
          className={`${styles.sortButtons} ${
            sortOn === 'startDate' ? styles.selected : null
          }`}
          onClick={() => handleSortSelect('startDate')}
        >
          <DateIcon />
          <span className={styles.sortLabel}>Date</span>
          {sortOn === 'startDate' ? (
            <span className={styles.sortTick}>
              <TickIcon width="14px" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Sort;

/*


*/
