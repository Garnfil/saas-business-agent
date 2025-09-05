import crypto from "node:crypto";

// TOKEN_ENC_KEY must be a 32-byte key provided as base64 in env
// e.g., TOKEN_ENC_KEY=JmFY0nJgkO2W3W0o4/1p4o3q1wPj6cT4l5p0a2d3f4g=
function getKey(): Buffer {
  const b64 = process.env.TOKEN_ENC_KEY;
  if (!b64) throw new Error("Missing TOKEN_ENC_KEY env var (base64 32 bytes)");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("TOKEN_ENC_KEY must decode to 32 bytes");
  return key;
}

export function encryptToken(plain: string): { enc: string; iv: string; tag: string } {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    enc: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptToken(params: { enc: string; iv: string; tag: string }): string {
  const key = getKey();
  const iv = Buffer.from(params.iv, "base64");
  const tag = Buffer.from(params.tag, "base64");
  const cipherText = Buffer.from(params.enc, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return plain.toString("utf8");
}
