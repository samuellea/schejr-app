import React from 'react';

function PlusIcon({
  fill,
  width = 'rgba(255, 255, 255, 0.282)',
  margin = '0px 6px 0px 0px',
}) {
  return (
    <div>
      <svg
        role="graphics-symbol"
        viewBox="0 0 16 16"
        className="plus"
        style={{
          width: width,
          height: width,
          display: 'block',
          fill: fill,
          flexShrink: '0',
          margin: margin,
        }}
      >
        <path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"></path>
      </svg>
    </div>
  );
}

export default PlusIcon;
