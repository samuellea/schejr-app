import React from 'react';

function EllipsisIcon({ width, fill }) {
  return (
    <div>
      <svg
        role="graphics-symbol"
        viewBox="0 0 13 3"
        className="dots"
        style={{
          width: width,
          height: width,
          display: 'block',
          fill: fill,
          flexShrink: '0',
        }}
      >
        <g>
          <path d="M3,1.5A1.5,1.5,0,1,1,1.5,0,1.5,1.5,0,0,1,3,1.5Z"></path>
          <path d="M8,1.5A1.5,1.5,0,1,1,6.5,0,1.5,1.5,0,0,1,8,1.5Z"></path>
          <path d="M13,1.5A1.5,1.5,0,1,1,11.5,0,1.5,1.5,0,0,1,13,1.5Z"></path>
        </g>
      </svg>
    </div>
  );
}

export default EllipsisIcon;
