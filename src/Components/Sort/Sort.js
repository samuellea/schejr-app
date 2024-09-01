import React, { useState, useRef, useEffect } from 'react';
import styles from './Sort.module.css';
import TitleIcon from '../Icons/TitleIcon';
import TagsIcon from '../Icons/TagsIcon';
import DateIcon from '../Icons/DateIcon';
import TickIcon from '../Icons/TickIcon';

function Sort({ sortOn, setSortOn, order, handleToggleOrder }) {
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

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const sortDropdownCombined = `${styles.sortDropdown} ${
    showDropdown ? styles.dropdownOpen : null
  }`;

  const handleClearSort = () => {
    setSortOn('manualOrder');
    setShowDropdown(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sortWindow} onClick={toggleDropdown}>
        Sort
      </div>
      <div className={sortDropdownCombined} ref={sortDropdownRef}>
        <div className={styles.ascDescWindow} onClick={handleToggleOrder}>
          {capitalizedOrderLabel}
          <svg
            role="graphics-symbol"
            viewBox="0 0 30 30"
            className={styles.chevronDown}
          >
            <polygon points="15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7 "></polygon>
          </svg>
        </div>
        <div
          className={`${styles.sortButtons} ${
            sortOn === 'title' ? styles.selected : null
          }`}
          onClick={() => setSortOn('title')}
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
          onClick={() => setSortOn('tags')}
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
          onClick={() => setSortOn('startDate')}
        >
          <DateIcon />
          <span className={styles.sortLabel}>Date</span>
          {sortOn === 'startDate' ? (
            <span className={styles.sortTick}>
              <TickIcon width="14px" />
            </span>
          ) : null}
        </div>
        <div className={styles.clearSortButton} onClick={handleClearSort}>
          <p className={styles.clearSortButtonLabel}>Clear Sort</p>
        </div>
      </div>
    </div>
  );
}

export default Sort;

/*


*/
