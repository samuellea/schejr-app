import React from 'react';

function ClockIcon({ width, fill }) {
  return (
    <div>
      <svg width={width} height={width} fill={fill} viewBox="0 0 17 16">
        <path
          fill={fill}
          fill-rule="evenodd"
          d="M13.5 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm1 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-6-2.5a.5.5 0 0 0-1 0v3A.5.5 0 0 0 8 9h3a.5.5 0 0 0 0-1H8.5V5.5Z"
          clip-rule="evenodd"
        ></path>
      </svg>
    </div>
  );
}

export default ClockIcon;
