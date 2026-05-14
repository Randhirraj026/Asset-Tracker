import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export default function QRCard({ value, title }: { value: string; title: string }) {
  function download() {
    const canvas = document.getElementById('asset-qr-code') as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR downloaded');
  }

  function printQr() {
    const canvas = document.getElementById('asset-qr-code') as HTMLCanvasElement | null;
    if (!canvas) return;

    const printWindow = window.open('', '_blank', 'width=420,height=520');
    if (!printWindow) {
      toast.error('Allow popups to print QR');
      return;
    }

    const imageUrl = canvas.toDataURL('image/png');
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            @page { margin: 0; }
            html, body {
              margin: 0;
              min-height: 100%;
              display: grid;
              place-items: center;
              background: #fff;
            }
            img {
              width: 260px;
              height: 260px;
              image-rendering: pixelated;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="QR code" />
          <script>
            window.onload = function () {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="glass-panel rounded-2xl p-6 text-center">
      <div className="mx-auto grid h-64 w-64 place-items-center rounded-2xl bg-white p-5">
        <QRCodeCanvas id="asset-qr-code" value={value} size={210} includeMargin />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{value}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button className="btn-primary" onClick={download}><Download size={17} />PNG</button>
        <button className="btn-secondary" onClick={printQr}><Printer size={17} />Print</button>
      </div>
    </div>
  );
}
