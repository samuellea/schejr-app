import React from 'react';

function CloseIcon({ width, fill }) {
  return (
    <div>
      <svg
        role="graphics-symbol"
        viewBox="0 0 14 14"
        class="collectionDeleteRule"
        style={{
          width: width,
          height: width,
          display: 'block',
          fill: fill,
          flexShrink: '0',
        }}
      >
        <path d="M12 3.27273L10.7273 2L7 5.72727L3.27273 2L2 3.27273L5.72727 7L2 10.7273L3.27273 12L7 8.27273L10.7273 12L12 10.7273L8.27273 7L12 3.27273Z"></path>
      </svg>
    </div>
  );
}

export default CloseIcon;
