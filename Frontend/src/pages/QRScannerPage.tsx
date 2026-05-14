import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, Play, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { logService } from '../services/logService';
import { normalizeAsset } from '../services/transformers';
import { Asset, Employee, MovementType } from '../types';

interface ScanRecord {
  payload: string;
  timestamp: string;
  asset?: Asset;
  status: string;
  validationResult: 'SUCCESS';
}

interface ValidationResult {
  result: 'SUCCESS' | 'FAILURE';
  message: string;
  timestamp: string;
}

const nextMovementForAsset = (asset?: Asset): MovementType => {
  if (asset?.status === 'OUTSIDE' || asset?.status === 'MAINTENANCE') return 'IN';
  return 'OUT';
};

export default function QRScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [running, setRunning] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [history, setHistory] = useState<ScanRecord[]>(() => {
    // Load history from localStorage on initial render
    try {
      const saved = localStorage.getItem('qr_scan_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load scan history from localStorage:', error);
      return [];
    }
  });
  const [movementType, setMovementType] = useState<MovementType>('OUT');
  const [manualEmployeeId, setManualEmployeeId] = useState('');
  const [manualAssetId, setManualAssetId] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const latest = history[0];
  const employeeAssets = useMemo(
    () => assets.filter((asset) => asset.employeeId === manualEmployeeId),
    [assets, manualEmployeeId]
  );
  const selectedManualAsset = useMemo(
    () => assets.find((asset) => asset.assetId === manualAssetId),
    [assets, manualAssetId]
  );

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('qr_scan_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save scan history to localStorage:', error);
    }
  }, [history]);

  useEffect(() => {
    Promise.all([assetService.list(), employeeService.list()])
      .then(([assetData, employeeData]) => {
        setAssets(assetData);
        setEmployees(employeeData);
        if (employeeData[0]) setManualEmployeeId(employeeData[0].employeeId);
      })
      .catch((error) => {
        console.error('Unable to load scanner data:', error);
      });

    return () => {
      scannerRef.current?.stop().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    setManualAssetId(employeeAssets[0]?.assetId || '');
  }, [employeeAssets]);

  useEffect(() => {
    if (selectedManualAsset) setMovementType(nextMovementForAsset(selectedManualAsset));
  }, [selectedManualAsset]);

  async function startScanner() {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 260 } }, onScan, undefined);
      setRunning(true);
    } catch {
      toast.error('Camera access failed. Check browser permissions.');
    }
  }

  async function stopScanner() {
    await scannerRef.current?.stop();
    setRunning(false);
  }

  async function processScan(decodedText: string) {
    let parsed: any = {};
    try {
      parsed = JSON.parse(decodedText);
    } catch {
      parsed = {};
    }

    if (!parsed.assetId && !parsed.serialNumber) {
      toast.error('Invalid QR payload.');
      return;
    }

    try {
      const result = await logService.scan({ qrData: decodedText, movementType });
      const asset = result.asset ? normalizeAsset(result.asset) : undefined;
      const record: ScanRecord = {
        payload: decodedText,
        timestamp: new Date().toLocaleString(),
        asset,
        status: result.movementLog?.movementType || result.log?.status || asset?.status || movementType,
        validationResult: 'SUCCESS'
      };
      setValidationResult({
        result: 'SUCCESS',
        message: 'Asset movement recorded successfully',
        timestamp: record.timestamp
      });
      if (asset) {
        setAssets((current) => current.map((item) => (item.id === asset.id || item.assetId === asset.assetId ? asset : item)));
      }
      setHistory((current) => [record, ...current.slice(0, 7)]);
      toast.success('Asset movement recorded successfully');
    } catch (error: any) {
      console.error('Scan processing failed:', error);
      setValidationResult({
        result: 'FAILURE',
        message: 'No asset data changed due to invalid scan',
        timestamp: new Date().toLocaleString()
      });
      const reason = error?.errors?.[0]?.reason || error?.message;
      toast.error(reason || 'Movement rejected. Asset information remains unchanged');
    }
  }

  function onScan(decodedText: string) {
    processScan(decodedText);
  }

  function simulateScan() {
    const demoAsset = assets[0];
    if (!demoAsset) {
      toast.error('No asset available for demo scan.');
      return;
    }
    processScan(JSON.stringify({ assetId: demoAsset.assetId, employeeId: demoAsset.employeeId, serialNumber: demoAsset.serialNumber }));
  }

  async function processManualMovement() {
    if (!selectedManualAsset) {
      toast.error('Select an assigned asset for this employee.');
      return;
    }

    try {
      const result = await logService.scan({
        assetId: selectedManualAsset.assetId,
        employeeId: selectedManualAsset.employeeId,
        serialNumber: selectedManualAsset.serialNumber,
        movementType
      });
      const asset = result.asset ? normalizeAsset(result.asset) : undefined;
      const timestamp = new Date().toLocaleString();
      setValidationResult({ result: 'SUCCESS', message: 'Asset movement recorded successfully', timestamp });
      if (asset) {
        setAssets((current) => current.map((item) => (item.id === asset.id || item.assetId === asset.assetId ? asset : item)));
        setHistory((current) => [{
          payload: selectedManualAsset.assetId,
          timestamp,
          asset,
          status: result.movementLog?.movementType || result.log?.status || asset.status,
          validationResult: 'SUCCESS'
        }, ...current.slice(0, 7)]);
      }
      toast.success('Asset movement recorded successfully');
    } catch (error: any) {
      console.error('Manual movement failed:', error);
      setValidationResult({
        result: 'FAILURE',
        message: 'No asset data changed due to invalid scan',
        timestamp: new Date().toLocaleString()
      });
      const reason = error?.errors?.[0]?.reason || error?.message;
      toast.error(reason || 'Movement rejected. Asset information remains unchanged');
    }
  }

  return (
    <div className="space-y-1">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">QR Scanner</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scan movement QR codes </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="glass-panel rounded-2xl p-4">
            <div id="qr-reader" className="min-h-80 overflow-hidden rounded-2xl bg-slate-950" />
            <div className="mt-4 flex flex-wrap gap-3">
              <select className="control" value={movementType} onChange={(event) => setMovementType(event.target.value as MovementType)} aria-label="Movement type">
                <option value="OUT">OUT Scan</option>
                <option value="IN">IN Scan</option>
                <option value="MAINTENANCE">Maintenance Scan</option>
              </select>
              <button className="btn-primary" onClick={running ? stopScanner : startScanner}>
                <ScanLine size={18} />
                {running ? 'Stop Scanner' : 'Start Scanner'}
              </button>
            </div>
          </section>
          <section className="glass-panel rounded-2xl p-8">
            <h2 className="text-lg font-bold">Manual Asset Movement</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label>
                <span className="mb-1.5 block text-sm font-semibold">Employee</span>
                <select className="control w-full" value={manualEmployeeId} onChange={(event) => setManualEmployeeId(event.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id || employee.employeeId} value={employee.employeeId}>{employee.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-semibold">Asset</span>
                <select className="control w-full" value={manualAssetId} onChange={(event) => setManualAssetId(event.target.value)}>
                  <option value="">Select asset</option>
                  {employeeAssets.map((asset) => (
                    <option key={asset.assetId} value={asset.assetId}>{asset.assetId} - {asset.model}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-semibold">Movement</span>
                <select className="control w-full" value={movementType} onChange={(event) => setMovementType(event.target.value as MovementType)}>
                  <option value="OUT">OUT Scan</option>
                  <option value="IN">IN Scan</option>
                  <option value="MAINTENANCE">Maintenance Scan</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm text-slate-500">
                {selectedManualAsset ? (
                  <span className="inline-flex flex-wrap items-center gap-2">{selectedManualAsset.model} is currently <StatusBadge status={selectedManualAsset.status} /></span>
                ) : (
                  <span>No assigned asset selected.</span>
                )}
              </div>
              <button className="btn-primary shrink-0" onClick={processManualMovement}>
                <Play size={18} />
                {movementType === 'IN' ? 'Move In' : movementType === 'OUT' ? 'Move Out' : 'Send Maintenance'}
              </button>
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold">Validation Result</h2>
            {validationResult ? (
              <div className="mt-4 space-y-2">
                <StatusBadge status={validationResult.result} />
                <p className="text-sm font-semibold">{validationResult.message}</p>
                <p className="text-xs text-slate-500">{validationResult.timestamp}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No validation result yet.</p>
            )}
          </section>
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold">Latest Scan</h2>
            {latest ? (
              <div className="mt-4 space-y-4">
                <CheckCircle2 className="text-emerald-500" size={34} />
                <p className="font-bold">{latest.asset?.assignedEmployee || 'Unknown employee'}</p>
                <p className="text-sm text-slate-500">{latest.asset?.model || latest.payload}</p>
                <p className="text-sm">{latest.timestamp}</p>
                <StatusBadge status={latest.status} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No scans yet.</p>
            )}
          </section>
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-bold">Scan History</h2>
            <div className="space-y-3">
                {history
                  .slice(0, 2) // Take first latest 2  entries
                  .map((scan, index) => (
                    <div
                      key={`${scan.timestamp}-${index}`}
                      className="rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800"
                    >
                      <div className="flex justify-between gap-3">
                        <span>{scan.asset?.assetId || 'Unknown QR'}</span>
                        <StatusBadge status={scan.status} />
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {scan.timestamp}
                      </p>
                    </div>
                  ))}
              </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
