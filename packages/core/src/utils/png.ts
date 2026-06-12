import type { RGBAColor } from '../types';

/**
 * Encode RGBA pixels as a minimal PNG data URL.
 *
 * The IDAT stream is compressed with a dependency-free DEFLATE
 * implementation (fixed Huffman codes + hash-chain LZ77). Pixel-art
 * data is extremely repetitive (per-block color runs, repeated rows),
 * so this typically shrinks data URLs by 30-100x versus stored blocks.
 * Falls back to stored blocks in the rare case deflate would be larger.
 *
 * Pure JS; no Canvas, Buffer, or btoa dependency. SSR-safe.
 */
export function encodePNG(
  width: number,
  height: number,
  pixels: RGBAColor[],
): string {
  // Raw scanlines: 1 filter byte (None) + RGBA per pixel
  const rowStride = 1 + width * 4;
  const raw = new Uint8Array(height * rowStride);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: None
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      const p = pixels[rowStart + x];
      if (p) {
        raw[o++] = p.r & 0xff;
        raw[o++] = p.g & 0xff;
        raw[o++] = p.b & 0xff;
        raw[o++] = Math.round(p.a * 255) & 0xff;
      } else {
        o += 4; // already zero-initialized (transparent)
      }
    }
  }

  const idat = zlibCompress(raw);

  // IHDR payload
  const ihdr = new Uint8Array(13);
  writeUint32BE(ihdr, 0, width);
  writeUint32BE(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idat);
  const iendChunk = makeChunk('IEND', new Uint8Array(0));

  const png = new Uint8Array(
    8 + ihdrChunk.length + idatChunk.length + iendChunk.length,
  );
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  png.set(ihdrChunk, 8);
  png.set(idatChunk, 8 + ihdrChunk.length);
  png.set(iendChunk, 8 + ihdrChunk.length + idatChunk.length);

  return `url("data:image/png;base64,${toBase64(png)}")`;
}

// --- PNG chunk writing ---

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  writeUint32BE(out, 0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);

  // CRC32 over type + data
  let crc = 0xffffffff;
  for (let i = 4; i < 8 + data.length; i++) {
    crc = CRC_TABLE[(crc ^ out[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  writeUint32BE(out, 8 + data.length, crc);
  return out;
}

// --- zlib (RFC 1950) wrapper around DEFLATE ---

function zlibCompress(data: Uint8Array): Uint8Array {
  const deflated = deflateFixed(data);
  const stored = storedSize(data.length);
  // Fixed-Huffman deflate can expand truly random data — fall back to
  // stored blocks when it loses (rare for pixel-art content).
  const body =
    deflated.length <= stored ? deflated : deflateStored(data);

  const out = new Uint8Array(2 + body.length + 4);
  // CMF=0x78 (deflate, 32K window), FLG=0x01 → (0x7801 % 31) === 0
  out[0] = 0x78;
  out[1] = 0x01;
  out.set(body, 2);
  writeUint32BE(out, 2 + body.length, adler32(data));
  return out;
}

// --- DEFLATE with fixed Huffman codes + hash-chain LZ77 (RFC 1951) ---

// Length codes 257-285: base lengths and extra bit counts
const LENGTH_BASES = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
  67, 83, 99, 115, 131, 163, 195, 227, 258,
];
const LENGTH_EXTRA = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
  5, 5, 5, 5, 0,
];
// Distance codes 0-29: base distances and extra bit counts
const DIST_BASES = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513,
  769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DIST_EXTRA = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
  11, 11, 12, 12, 13, 13,
];

/** Reverse the lowest n bits of v (Huffman codes are written MSB-first) */
function revBits(v: number, n: number): number {
  let r = 0;
  for (let i = 0; i < n; i++) {
    r = (r << 1) | (v & 1);
    v >>= 1;
  }
  return r;
}

// Precomputed fixed Huffman literal/length codes (pre-reversed) + lengths
const LIT_CODE = new Uint16Array(288);
const LIT_LEN = new Uint8Array(288);
for (let sym = 0; sym < 288; sym++) {
  let code: number;
  let len: number;
  if (sym < 144) {
    code = 0x30 + sym;
    len = 8;
  } else if (sym < 256) {
    code = 0x190 + (sym - 144);
    len = 9;
  } else if (sym < 280) {
    code = sym - 256;
    len = 7;
  } else {
    code = 0xc0 + (sym - 280);
    len = 8;
  }
  LIT_CODE[sym] = revBits(code, len);
  LIT_LEN[sym] = len;
}

class BitWriter {
  private buf: number[] = [];
  private bitBuf = 0;
  private bitCnt = 0;

  /** Write n bits LSB-first */
  writeBits(value: number, n: number): void {
    this.bitBuf |= value << this.bitCnt;
    this.bitCnt += n;
    while (this.bitCnt >= 8) {
      this.buf.push(this.bitBuf & 0xff);
      this.bitBuf >>>= 8;
      this.bitCnt -= 8;
    }
  }

  finish(): Uint8Array {
    if (this.bitCnt > 0) {
      this.buf.push(this.bitBuf & 0xff);
      this.bitBuf = 0;
      this.bitCnt = 0;
    }
    return Uint8Array.from(this.buf);
  }
}

function deflateFixed(data: Uint8Array): Uint8Array {
  const w = new BitWriter();
  w.writeBits(1, 1); // BFINAL = 1 (single block)
  w.writeBits(1, 2); // BTYPE = 01 (fixed Huffman)

  const writeSym = (sym: number) => w.writeBits(LIT_CODE[sym], LIT_LEN[sym]);

  const writeMatch = (length: number, dist: number) => {
    // Find the largest length-code bucket whose base fits
    let lc = LENGTH_BASES.length - 1;
    while (LENGTH_BASES[lc] > length) lc--;
    writeSym(257 + lc);
    if (LENGTH_EXTRA[lc] > 0) {
      w.writeBits(length - LENGTH_BASES[lc], LENGTH_EXTRA[lc]);
    }

    let dc = DIST_BASES.length - 1;
    while (DIST_BASES[dc] > dist) dc--;
    w.writeBits(revBits(dc, 5), 5);
    if (DIST_EXTRA[dc] > 0) {
      w.writeBits(dist - DIST_BASES[dc], DIST_EXTRA[dc]);
    }
  };

  const n = data.length;
  const HASH_BITS = 15;
  const HASH_MASK = (1 << HASH_BITS) - 1;
  const head = new Int32Array(1 << HASH_BITS).fill(-1);
  const prev = new Int32Array(Math.max(1, n));
  const MAX_DIST = 32768;
  const MAX_CHAIN = 64;

  const hashAt = (i: number): number =>
    ((data[i] << 10) ^ (data[i + 1] << 5) ^ data[i + 2]) & HASH_MASK;

  let i = 0;
  while (i < n) {
    let bestLen = 0;
    let bestDist = 0;

    if (i + 3 <= n) {
      const h = hashAt(i);
      const maxLen = Math.min(258, n - i);
      let j = head[h];
      let chain = 0;
      while (j >= 0 && i - j <= MAX_DIST && chain < MAX_CHAIN) {
        let l = 0;
        while (l < maxLen && data[j + l] === data[i + l]) l++;
        if (l > bestLen) {
          bestLen = l;
          bestDist = i - j;
          if (l >= maxLen) break;
        }
        j = prev[j];
        chain++;
      }
      prev[i] = head[h];
      head[h] = i;
    }

    if (bestLen >= 3) {
      writeMatch(bestLen, bestDist);
      const end = i + bestLen;
      for (let k = i + 1; k < end && k + 3 <= n; k++) {
        const h = hashAt(k);
        prev[k] = head[h];
        head[h] = k;
      }
      i = end;
    } else {
      writeSym(data[i]);
      i++;
    }
  }

  writeSym(256); // end of block
  return w.finish();
}

// --- Stored (uncompressed) blocks — fallback for incompressible data ---

function storedSize(len: number): number {
  if (len === 0) return 5;
  return len + 5 * Math.ceil(len / 65535);
}

function deflateStored(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(storedSize(data.length));
  let o = 0;

  if (data.length === 0) {
    out.set([0x01, 0x00, 0x00, 0xff, 0xff], 0);
    return out;
  }

  const MAX_BLOCK = 65535;
  let pos = 0;
  while (pos < data.length) {
    const len = Math.min(MAX_BLOCK, data.length - pos);
    const isFinal = pos + len >= data.length;

    // Block header: BFINAL (1 bit) + BTYPE=00 (2 bits), byte-aligned
    out[o++] = isFinal ? 0x01 : 0x00;
    out[o++] = len & 0xff;
    out[o++] = (len >>> 8) & 0xff;
    const nlen = ~len & 0xffff;
    out[o++] = nlen & 0xff;
    out[o++] = (nlen >>> 8) & 0xff;
    out.set(data.subarray(pos, pos + len), o);
    o += len;
    pos += len;
  }

  return out;
}

// --- Adler32 checksum ---

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  // Process in batches to avoid overflow (safe margin: 5552)
  let i = 0;
  while (i < data.length) {
    const end = Math.min(i + 5552, data.length);
    for (; i < end; i++) {
      a += data[i];
      b += a;
    }
    a %= MOD;
    b %= MOD;
  }
  return ((b << 16) | a) >>> 0;
}

// --- CRC32 table (precomputed once) ---

const CRC_TABLE: number[] = (() => {
  const table: number[] = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

// --- Helpers ---

function writeUint32BE(arr: Uint8Array, offset: number, value: number): void {
  arr[offset] = (value >>> 24) & 0xff;
  arr[offset + 1] = (value >>> 16) & 0xff;
  arr[offset + 2] = (value >>> 8) & 0xff;
  arr[offset + 3] = value & 0xff;
}

const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Pure JS base64 encoder — no btoa/Buffer dependency */
function toBase64(bytes: Uint8Array): string {
  const parts: string[] = [];
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    parts.push(
      B64_CHARS[b0 >> 2],
      B64_CHARS[((b0 & 3) << 4) | (b1 >> 4)],
      i + 1 < len ? B64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=',
      i + 2 < len ? B64_CHARS[b2 & 63] : '=',
    );
  }
  return parts.join('');
}
