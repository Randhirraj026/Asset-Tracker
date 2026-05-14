const crypto = require('crypto');
const env = require('../config/env');

const signatureFields = ['assetId', 'serialNumber', 'employeeId'];

const canonicalPayload = (payload) => signatureFields
  .map((field) => `${field}:${payload[field] || ''}`)
  .join('|');

const signQrPayload = (payload) => crypto
  .createHmac('sha256', env.qrSigningSecret)
  .update(canonicalPayload(payload))
  .digest('base64url');

const buildQrPayload = (asset) => ({
  assetId: asset.assetId,
  employeeId: asset.assignedEmployee?.empId || null,
  serialNumber: asset.serialNumber,
  v: 1
});

const parseQrPayload = (input) => {
  if (typeof input === 'object' && input !== null) return input;
  try {
    return JSON.parse(input);
  } catch (_error) {
    return { assetId: input };
  }
};

const buildSignedQrPayload = (asset) => {
  const payload = buildQrPayload(asset);
  return { ...payload, sig: signQrPayload(payload) };
};

const verifyQrPayloadSignature = (payload, requireSignature = env.qrRequireSignature) => {
  if (!payload || typeof payload !== 'object') return false;
  if (!payload.sig) return !requireSignature;

  const expected = signQrPayload(payload);
  const received = String(payload.sig);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

module.exports = { buildQrPayload, buildSignedQrPayload, parseQrPayload, verifyQrPayloadSignature };
