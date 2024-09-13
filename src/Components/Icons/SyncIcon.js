import React from 'react';

function SyncIcon({ width = '16px', fill }) {
  return (
    <div>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="15px"
        height="15px"
        viewBox="0 0 300.000000 290.000000"
        preserveAspectRatio="xMidYMid meet"
        style={{ paddingRight: '4px', paddingTop: '3px' }}
      >
        <g
          transform="translate(0.000000,290.000000) scale(0.100000,-0.100000)"
          fill={fill}
          stroke="none"
        >
          <path
            d="M1760 2323 l0 -528 205 205 c238 237 202 227 341 97 137 -129 232
-290 286 -485 32 -115 32 -363 0 -481 -113 -416 -448 -706 -869 -754 l-103
-11 0 -159 0 -160 88 7 c329 27 610 156 841 385 239 238 373 540 388 877 19
419 -147 794 -477 1076 l-55 47 205 206 205 205 -528 0 -527 0 0 -527z"
          />
          <path
            d="M1256 2829 c-487 -71 -904 -421 -1061 -892 -90 -270 -90 -579 0 -843
73 -210 216 -423 380 -564 33 -29 67 -58 75 -66 13 -12 -12 -40 -190 -219
l-205 -205 523 0 522 0 0 522 0 523 -198 -198 c-108 -108 -202 -197 -209 -197
-18 0 -153 113 -198 166 -66 78 -116 154 -157 242 -177 380 -95 834 204 1130
96 95 152 134 273 193 115 55 230 87 347 97 l83 7 3 158 3 157 -68 -1 c-38 -1
-94 -5 -127 -10z"
          />
        </g>
      </svg>
    </div>
  );
}

export default SyncIcon;