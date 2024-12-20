import React from 'react';

function CogIcon({ width, fill, margin = '0px' }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: margin,
      }}
    >
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={width}
        viewBox="0 0 300.000000 284.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,284.000000) scale(0.100000,-0.100000)"
          fill={fill}
          stroke="none"
        >
          <path
            d="M150 2721 c-15 -4 -32 -21 -42 -41 -17 -33 -18 -101 -18 -986 0 -673
3 -960 11 -983 10 -29 34 -43 293 -170 711 -351 982 -481 1011 -487 83 -15
172 45 194 130 6 26 11 131 11 255 l0 211 203 1 c345 1 391 10 445 89 22 32
22 38 22 354 0 267 -2 325 -15 343 -32 45 -102 36 -130 -16 -12 -25 -15 -77
-15 -316 l0 -285 -255 0 -254 0 -3 553 -3 552 -24 52 c-30 67 -85 117 -175
158 -39 18 -246 119 -460 224 -214 105 -392 191 -397 191 -5 0 -9 5 -9 10 0 7
270 10 790 10 l790 0 0 -290 c0 -319 3 -339 58 -358 34 -12 85 6 96 33 3 9 6
159 6 333 0 310 -1 318 -23 356 -13 23 -38 48 -62 60 -40 21 -47 21 -1030 23
-545 1 -1001 -2 -1015 -6z m331 -315 c118 -57 327 -159 464 -226 138 -67 300
-146 361 -176 81 -39 114 -60 122 -79 9 -19 12 -243 12 -871 l0 -844 -32 14
c-18 8 -181 87 -363 176 -181 89 -425 209 -542 265 -156 76 -216 110 -230 131
-17 27 -18 70 -20 871 -1 464 2 843 6 843 5 0 105 -47 222 -104z"
          />
          <path
            d="M2534 2090 c-12 -5 -29 -19 -38 -32 -32 -45 -22 -65 84 -173 55 -55
100 -104 100 -108 0 -4 -155 -7 -344 -7 -332 0 -344 -1 -370 -21 -37 -29 -37
-89 0 -118 26 -20 38 -21 370 -21 189 0 344 -2 344 -3 0 -2 -45 -49 -100 -104
-85 -85 -100 -105 -100 -132 0 -43 38 -81 81 -81 29 0 54 21 212 178 98 97
183 187 188 200 15 38 -8 73 -119 180 -59 57 -138 135 -177 172 -74 72 -97 84
-131 70z"
          />
        </g>
      </svg>
    </div>
  );
}

export default CogIcon;
