import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawBytes = Buffer.alloc((width * 4 + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.38 : 0.42);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold tone gradient calculation
      const angle = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
      const goldR = Math.floor(197 + 45 * Math.sin(angle * Math.PI * 2));
      const goldG = Math.floor(160 + 35 * Math.sin(angle * Math.PI * 2));
      const goldB = Math.floor(89 + 30 * Math.sin(angle * Math.PI * 2));

      if (dist < radius) {
        // Monogram / Inner core
        if (dist > radius * 0.85 && dist < radius * 0.98) {
          // Ring
          rawBytes[offset++] = goldR;
          rawBytes[offset++] = goldG;
          rawBytes[offset++] = goldB;
          rawBytes[offset++] = 255;
        } else if (dist < radius * 0.65 && (dx > -radius * 0.35 && dx < radius * 0.35 && dy > -radius * 0.35 && dy < radius * 0.35)) {
          // Center G motif
          rawBytes[offset++] = 230;
          rawBytes[offset++] = 200;
          rawBytes[offset++] = 130;
          rawBytes[offset++] = 255;
        } else {
          // Background inside circle
          rawBytes[offset++] = 28;
          rawBytes[offset++] = 28;
          rawBytes[offset++] = 25;
          rawBytes[offset++] = 255;
        }
      } else {
        // Outer background
        rawBytes[offset++] = 20;
        rawBytes[offset++] = 20;
        rawBytes[offset++] = 18;
        rawBytes[offset++] = 255;
      }
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression method
  ihdr.writeUInt8(0, 11); // filter method
  ihdr.writeUInt8(0, 12); // interlace method

  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", deflateSync(rawBytes));
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = resolve("public/icons");
mkdirSync(outDir, { recursive: true });

writeFileSync(resolve(outDir, "icon-192.png"), createPng(192));
writeFileSync(resolve(outDir, "icon-512.png"), createPng(512));
writeFileSync(resolve(outDir, "icon-maskable-512.png"), createPng(512, true));
console.log("PWA PNG icons generated successfully!");
