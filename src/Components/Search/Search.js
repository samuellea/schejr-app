import React from 'react';
import styles from './Search.module.css';

const Search = ({ searchString, setSearchString }) => {
  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchString(text);
  };
  return (
    <div className={styles.searchContainer}>
      <input
        className={styles.searchInput}
        type="text"
        id="listSearch"
        placeholder="Search"
        value={searchString}
        onChange={handleSearchChange}
        // onKeyDown={(event) => handleKeyDown(event)}
      />
    </div>
  );
};

export default Search;
