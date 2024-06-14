import { v4 as uuidv4 } from 'uuid';

export const rndNumber = (len: number = 9) => {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rndHex(length: number): string {
  const characters = '0123456789abcdef';

  let result = '';
  
  for (let i = 0; i < length; i++) {
    const rndIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(rndIndex);
  }

  return result;
}

export function rndUUID(): string {
  // return `${rndHex(8)}-${rndHex(4)}-4${rndHex(3)}-${rndHex(4)}-${rndHex(12)}`;
  return uuidv4().toString();
}

export function validateUUID(uuid: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

export function shortenUUID(uuid: string, maxSize?: number): string {
  // Define the character set for base62 encoding.
  const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const base = base62.length;

  if (!validateUUID(uuid)) throw new Error('Invalid UUID');

  // Remove hyphens and convert the UUID to a buffer.
  const uuidWithoutHyphens = uuid.replace(/-/g, '');
  const uuidBuffer = hexToBinaryArray(uuidWithoutHyphens); // Buffer.from(uuidWithoutHyphens, 'hex');
  let number = 0n;

  // Convert the UUID buffer to a BigInt number.
  for (let i = 0; i < 16; i++) {
    number = (number << 8n) | BigInt(uuidBuffer[i]);
  }

  let shortUUID = '';
  // Encode the BigInt number into base62 representation.
  while (number > 0n && (!maxSize || shortUUID.length < maxSize)) {
    const remainder = number % BigInt(base);
    shortUUID = base62[Number(remainder)] + shortUUID;
    number = number / BigInt(base);
  }

  return shortUUID;
}

function hexToBinaryArray(hexString: string) {
  const binaryArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    binaryArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return binaryArray;
}
