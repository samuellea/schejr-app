import React from 'react';

function SearchIcon({ width, fill = 'white' }) {
  return (
    <div>
      <svg
        role="graphics-symbol"
        viewBox="0 0 20 20"
        class="newSidebarSearch"
        style={{
          width: width,
          height: width,
          display: 'block',
          fill: fill,
          flexShrink: '0',
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 8.75C4 6.12665 6.12665 4 8.75 4C11.3734 4 13.5 6.12665 13.5 8.75C13.5 11.3734 11.3734 13.5 8.75 13.5C6.12665 13.5 4 11.3734 4 8.75ZM8.75 2.5C5.29822 2.5 2.5 5.29822 2.5 8.75C2.5 12.2018 5.29822 15 8.75 15C10.2056 15 11.545 14.5024 12.6073 13.668L16.7197 17.7803C17.0126 18.0732 17.4874 18.0732 17.7803 17.7803C18.0732 17.4874 18.0732 17.0126 17.7803 16.7197L13.668 12.6073C14.5024 11.545 15 10.2056 15 8.75C15 5.29822 12.2018 2.5 8.75 2.5Z"
        ></path>
      </svg>
    </div>
  );
}

export default SearchIcon;
