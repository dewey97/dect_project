/**
 * Analyze evidence-board-frame.png to find the bounding box
 * of the transparent or near-white region inside the wooden frame.
 * 
 * Pure Node.js — no external dependencies.
 * Manually parses PNG IHDR + IDAT chunks using zlib.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const imagePath = path.join(__dirname, "..", "public", "evidence-board-frame.png");
const buf = fs.readFileSync(imagePath);

// --- PNG parser ---
// Verify PNG signature
const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (buf.subarray(0, 8).compare(PNG_SIG) !== 0) {
  throw new Error("Not a valid PNG file");
}

let offset = 8;
let width = 0, height = 0, bitDepth = 0, colorType = 0;
const idatChunks = [];

while (offset < buf.length) {
  const length = buf.readUInt32BE(offset);
  const type = buf.toString("ascii", offset + 4, offset + 8);
  const chunkData = buf.subarray(offset + 8, offset + 8 + length);
  
  if (type === "IHDR") {
    width = chunkData.readUInt32BE(0);
    height = chunkData.readUInt32BE(4);
    bitDepth = chunkData[8];
    colorType = chunkData[9];
  } else if (type === "IDAT") {
    idatChunks.push(chunkData);
  } else if (type === "IEND") {
    break;
  }
  
  offset += 12 + length; // 4 length + 4 type + data + 4 crc
}

console.log(`Image: ${width}x${height}, bitDepth=${bitDepth}, colorType=${colorType}`);

// colorType: 0=grayscale, 2=RGB, 4=grayscale+alpha, 6=RGBA
const hasAlpha = colorType === 4 || colorType === 6;
const channels = colorType === 6 ? 4 : colorType === 4 ? 2 : colorType === 2 ? 3 : 1;

console.log(`Channels: ${channels}, hasAlpha: ${hasAlpha}`);

// Decompress all IDAT chunks
const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

// Unfilter PNG rows
// Each row has a filter byte + (width * channels) bytes
const bytesPerPixel = channels;
const stride = width * bytesPerPixel;
const pixels = Buffer.alloc(width * height * channels);

let srcOffset = 0;
for (let y = 0; y < height; y++) {
  const filterType = decompressed[srcOffset++];
  const rowStart = y * stride;
  const prevRowStart = (y - 1) * stride;
  
  for (let x = 0; x < stride; x++) {
    let raw = decompressed[srcOffset++];
    
    const a = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0; // left
    const b = y > 0 ? pixels[prevRowStart + x] : 0; // above
    const c = (x >= bytesPerPixel && y > 0) ? pixels[prevRowStart + x - bytesPerPixel] : 0; // upper-left
    
    switch (filterType) {
      case 0: break; // None
      case 1: raw = (raw + a) & 0xff; break; // Sub
      case 2: raw = (raw + b) & 0xff; break; // Up
      case 3: raw = (raw + Math.floor((a + b) / 2)) & 0xff; break; // Average
      case 4: { // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        raw = (raw + pr) & 0xff;
        break;
      }
    }
    
    pixels[rowStart + x] = raw;
  }
}

console.log("PNG decoded successfully.\n");

// --- Find transparent region bounding box ---
let minX = width, minY = height, maxX = 0, maxY = 0;
let count = 0;

if (hasAlpha) {
  // Look for alpha < 10
  const alphaOffset = channels - 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const alpha = pixels[idx + alphaOffset];
      if (alpha < 10) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Found ${count} transparent pixels (alpha < 10)`);
}

if (count === 0) {
  // Fallback: near-white
  console.log("Trying near-white pixels (R>248, G>248, B>248)...");
  minX = width; minY = height; maxX = 0; maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = pixels[idx];
      const g = channels >= 3 ? pixels[idx + 1] : r;
      const b = channels >= 3 ? pixels[idx + 2] : r;
      if (r > 248 && g > 248 && b > 248) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Found ${count} near-white pixels`);
}

if (count === 0) {
  console.log("ERROR: Could not find transparent or white region");
  process.exit(1);
}

console.log(`\nBounding box (pixels):`);
console.log(`  Left:   ${minX}`);
console.log(`  Top:    ${minY}`);
console.log(`  Right:  ${maxX}`);
console.log(`  Bottom: ${maxY}`);
console.log(`  Width:  ${maxX - minX + 1}`);
console.log(`  Height: ${maxY - minY + 1}`);

const ratioLeft = minX / width;
const ratioTop = minY / height;
const ratioRight = maxX / width;
const ratioBottom = maxY / height;
const cWidth = ratioRight - ratioLeft;
const cHeight = ratioBottom - ratioTop;

console.log(`\nAs ratios (0-1):`);
console.log(`  Left:   ${ratioLeft.toFixed(6)} (${(ratioLeft * 100).toFixed(2)}%)`);
console.log(`  Top:    ${ratioTop.toFixed(6)} (${(ratioTop * 100).toFixed(2)}%)`);
console.log(`  Right:  ${ratioRight.toFixed(6)} (${(ratioRight * 100).toFixed(2)}%)`);
console.log(`  Bottom: ${ratioBottom.toFixed(6)} (${(ratioBottom * 100).toFixed(2)}%)`);
console.log(`  Width:  ${cWidth.toFixed(6)} (${(cWidth * 100).toFixed(2)}%)`);
console.log(`  Height: ${cHeight.toFixed(6)} (${(cHeight * 100).toFixed(2)}%)`);

console.log(`\n=== FOR CODE USAGE ===`);
console.log(`const FRAME_INNER_LEFT   = ${ratioLeft.toFixed(4)};`);
console.log(`const FRAME_INNER_TOP    = ${ratioTop.toFixed(4)};`);
console.log(`const FRAME_INNER_WIDTH  = ${cWidth.toFixed(4)};`);
console.log(`const FRAME_INNER_HEIGHT = ${cHeight.toFixed(4)};`);
