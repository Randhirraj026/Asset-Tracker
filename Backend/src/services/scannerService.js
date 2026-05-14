const { Prisma } = require('@prisma/client');
const prisma = require('../prisma/client');
const AppError = require('../utils/AppError');
const { calculateDuration } = require('../utils/duration');
const { parseQrPayload, verifyQrPayloadSignature } = require('../utils/qrPayload');
const logger = require('../utils/logger');
const { isUuid, nullableUuid } = require('../utils/uuid');

const requestedStatusByMovement = {
  OUT: 'OUTSIDE',
  IN: 'IN_OFFICE',
  MAINTENANCE: 'MAINTENANCE'
};

const getScanLookup = ({ qrData, assetId, serialNumber }) => {
  const payload = qrData ? parseQrPayload(qrData) : { assetId, serialNumber };
  if (!payload.assetId && !payload.serialNumber) throw new AppError('Invalid QR payload', 422);
  if (qrData && !verifyQrPayloadSignature(payload)) throw new AppError('Invalid QR signature', 422);

  return {
    assetId: payload.assetId,
    serialNumber: payload.serialNumber,
    assetIdentifier: payload.assetId || payload.serialNumber || 'UNKNOWN'
  };
};

const findScanAsset = async (tx, payload) => {
  const lookup = getScanLookup(payload);
  const where = lookup.assetId
    ? (isUuid(lookup.assetId) ? { id: lookup.assetId } : { assetId: lookup.assetId })
    : { serialNumber: lookup.serialNumber };

  const asset = await tx.asset.findUnique({
    where,
    include: { assignedEmployee: true }
  });

  if (!asset) throw new AppError('Asset not found for QR payload', 404);
  if (lookup.serialNumber && lookup.serialNumber !== asset.serialNumber) {
    throw new AppError('QR serial number mismatch', 422);
  }

  return { asset, lookup };
};

const buildFailureDetails = ({ asset, lookup, movementType, remarks }, error) => ({
  assetId: asset?.id || null,
  assetIdentifier: asset?.assetId || lookup?.assetIdentifier || null,
  previousStatus: asset?.status || null,
  requestedStatus: requestedStatusByMovement[movementType] || null,
  movementType,
  validationResult: 'FAILURE',
  remarks: [remarks, error.message, 'No asset data changed due to invalid scan'].filter(Boolean).join(' | ')
});

const recordRejectedMovement = async (details, adminId) => {
  if (!details.movementType) return null;
  return prisma.assetMovementLog.create({
    data: {
      ...details,
      scannedBy: nullableUuid(adminId)
    }
  });
};

const rejectMovement = async (context, error, adminId) => {
  const movementLog = await recordRejectedMovement(buildFailureDetails(context, error), adminId);
  throw new AppError(
    'Movement rejected. Asset information remains unchanged',
    error.statusCode || 422,
    [{ validationResult: 'FAILURE', movementLogId: movementLog?.id, reason: error.message }]
  );
};

const validateMovement = async (tx, asset, movementType) => {
  if (!requestedStatusByMovement[movementType]) {
    throw new AppError('Invalid movement type', 422);
  }

  if (movementType === 'OUT') {
    if (!asset.assignedEmployeeId) throw new AppError('Asset is not assigned to an employee', 422);
    if (asset.status === 'OUTSIDE') throw new AppError('Asset is already outside office', 409);
    if (['MAINTENANCE', 'LOST'].includes(asset.status)) throw new AppError(`Asset cannot exit while ${asset.status}`, 422);
    return null;
  }

  if (movementType === 'IN') {
    // Allow IN movement from OUTSIDE (normal return) or from MAINTENANCE (return from maintenance)
    if (!['OUTSIDE', 'MAINTENANCE'].includes(asset.status)) {
      throw new AppError('Asset is not currently outside office or in maintenance', 409);
    }
    
    // For OUTSIDE status, find the open OUT log
    if (asset.status === 'OUTSIDE') {
      const openLog = await tx.assetLog.findFirst({
        where: { assetId: asset.id, status: 'OUT', entryTime: null },
        orderBy: { exitTime: 'desc' }
      });
      if (!openLog) throw new AppError('No open OUT log found for asset', 404);
      return openLog;
    }
    
    // For MAINTENANCE status, no open log needed
    return null;
  }

  if (movementType === 'MAINTENANCE') {
    // Allow direct maintenance from office/returned assets and from outside assets being sent for service.
    if (!['IN_OFFICE', 'RETURNED', 'OUTSIDE'].includes(asset.status)) {
      throw new AppError(`Asset cannot be moved to maintenance from ${asset.status} status`, 422);
    }
    if (asset.status === 'MAINTENANCE') throw new AppError('Asset is already in maintenance', 409);
    if (asset.status === 'LOST') throw new AppError('Lost asset cannot be moved to maintenance', 422);

    if (asset.status === 'OUTSIDE') {
      const openLog = await tx.assetLog.findFirst({
        where: { assetId: asset.id, status: 'OUT', entryTime: null },
        orderBy: { exitTime: 'desc' }
      });
      if (!openLog) throw new AppError('No open OUT log found for asset', 404);
      return openLog;
    }
  }

  return null;
};

const processMovement = async (payload, adminId, forcedMovementType) => {
  let context = { movementType: forcedMovementType || payload.movementType, remarks: payload.remarks };
  const scannedBy = nullableUuid(adminId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const { asset, lookup } = await findScanAsset(tx, payload);
      const movementType = forcedMovementType || payload.movementType;
      context = { ...context, asset, lookup, movementType };

      const openLog = await validateMovement(tx, asset, movementType);
      const requestedStatus = requestedStatusByMovement[movementType];
      const now = new Date();
      let log = null;

      const movementLog = await tx.assetMovementLog.create({
        data: {
          assetId: asset.id,
          assetIdentifier: asset.assetId,
          previousStatus: asset.status,
          requestedStatus,
          movementType,
          validationResult: 'SUCCESS',
          scannedBy,
          remarks: payload.remarks
        }
      });

      if (movementType === 'OUT') {
        log = await tx.assetLog.create({
          data: {
            assetId: asset.id,
            employeeId: asset.assignedEmployeeId,
            exitTime: now,
            status: 'OUT',
            remarks: payload.remarks,
            scannedBy
          }
        });
      }

      if (movementType === 'IN') {
        // Handle return from OUTSIDE (normal return with open log)
        if (asset.status === 'OUTSIDE' && openLog) {
          const duration = calculateDuration(openLog.exitTime, now);
          log = await tx.assetLog.update({
            where: { id: openLog.id },
            data: {
              entryTime: now,
              totalHours: duration.totalHours,
              totalDays: duration.totalDays,
              status: 'IN',
              remarks: payload.remarks || openLog.remarks,
              scannedBy
            }
          });
        }
        // Handle return from MAINTENANCE (no asset log update needed)
        else if (asset.status === 'MAINTENANCE') {
          log = null; // No asset log to update for maintenance return
        }
      }

      if (movementType === 'MAINTENANCE' && asset.status === 'OUTSIDE' && openLog) {
        const duration = calculateDuration(openLog.exitTime, now);
        log = await tx.assetLog.update({
          where: { id: openLog.id },
          data: {
            entryTime: now,
            totalHours: duration.totalHours,
            totalDays: duration.totalDays,
            status: 'IN',
            remarks: payload.remarks || 'Moved to maintenance while outside',
            scannedBy
          }
        });
      }

      const updatedAsset = await tx.asset.update({
        where: { id: asset.id },
        data: { status: requestedStatus },
        include: { assignedEmployee: true }
      });

      return { log, movementLog, asset: updatedAsset, validationResult: 'SUCCESS' };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      await rejectMovement(context, error, adminId);
    }
    throw error;
  }
};

const exitAsset = (payload, adminId) => processMovement(payload, adminId, 'OUT');
const enterAsset = (payload, adminId) => processMovement(payload, adminId, 'IN');
const maintenanceAsset = (payload, adminId) => processMovement(payload, adminId, 'MAINTENANCE');
const scan = (payload, adminId) => processMovement(payload, adminId);

module.exports = { exitAsset, enterAsset, maintenanceAsset, scan };
