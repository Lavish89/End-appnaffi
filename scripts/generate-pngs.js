import fs from 'fs';
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b, a = 255) {
  // Construct PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const crc = computeCRC(Buffer.concat([chunkType, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, chunkType, data, crcBuf]);
  }

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Draw border & logo center gradient
      const isBorder = x < 8 || x >= width - 8 || y < 8 || y >= height - 8;
      const isInnerLogo = Math.abs(x - width / 2) < width * 0.25 && Math.abs(y - height / 2) < height * 0.25;

      if (isInnerLogo) {
        rawData[pxOffset] = 251;     // Amber R
        rawData[pxOffset + 1] = 191; // Amber G
        rawData[pxOffset + 2] = 36;  // Amber B
        rawData[pxOffset + 3] = 255;
      } else if (isBorder) {
        rawData[pxOffset] = 245;     // Gold R
        rawData[pxOffset + 1] = 158;
        rawData[pxOffset + 2] = 11;
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = 15;      // Slate-900 dark background
        rawData[pxOffset + 1] = 23;
        rawData[pxOffset + 2] = 42;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function computeCRC(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createSolidPNG(192, 192, 15, 23, 42));
fs.writeFileSync('public/pwa-512x512.png', createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync('public/pwa-maskable-512x512.png', createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync('public/apple-touch-icon.png', createSolidPNG(180, 180, 15, 23, 42));

console.log('PNG PWA icons created successfully in /public!');
