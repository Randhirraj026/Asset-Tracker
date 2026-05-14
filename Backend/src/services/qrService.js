const fs = require('fs/promises');
const path = require('path');
const QRCode = require('qrcode');
const env = require('../config/env');
const assetRepository = require('../repositories/assetRepository');
const AppError = require('../utils/AppError');
const { buildSignedQrPayload, parseQrPayload, verifyQrPayloadSignature } = require('../utils/qrPayload');

const qrDir = path.resolve(process.cwd(), env.uploadDir, 'qr');

const generateQr = async (assetId) => {
  const asset = await assetRepository.findById(assetId);
  if (!asset) throw new AppError('Asset not found', 404);

  await fs.mkdir(qrDir, { recursive: true });
  const payload = buildSignedQrPayload(asset);
  const fileName = `${asset.assetId}-${Date.now()}.png`;
  const diskPath = path.join(qrDir, fileName);
  const publicPath = `/uploads/qr/${fileName}`;

  await QRCode.toFile(diskPath, JSON.stringify(payload), {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 2
  });

  const updated = await assetRepository.update(asset.id, { qrCode: publicPath });
  return { asset: updated, qrPayload: payload, qrCodeUrl: `${env.qrPublicBaseUrl}${publicPath}` };
};

const verifyQr = async (qrData) => {
  const payload = parseQrPayload(qrData);
  if (!payload.assetId && !payload.serialNumber) throw new AppError('Invalid QR payload', 422);
  if (!verifyQrPayloadSignature(payload)) throw new AppError('Invalid QR signature', 422);

  const asset = payload.assetId
    ? await assetRepository.findByAssetId(payload.assetId)
    : await assetRepository.findBySerialNumber(payload.serialNumber);

  if (!asset) throw new AppError('Asset not found for QR payload', 404);
  if (payload.serialNumber && payload.serialNumber !== asset.serialNumber) {
    throw new AppError('QR serial number mismatch', 422);
  }

  return { valid: true, asset, payload };
};

module.exports = { generateQr, verifyQr };
