import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Save, Loader2 } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, url, shortCode }) => {
  if (!isOpen) return null;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    // Ensure SVG namespace is present for correct rendering in <img>
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      
      // Draw white background so the QR code is readable on all themes (e.g., dark mode viewer)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 200, 200);
      
      ctx.drawImage(img, 0, 0, 200, 200);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${shortCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">QR Code</h3>
        <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-xl">
          <QRCode id="qr-code-svg" value={url} size={200} level="H" />
        </div>
        <p className="text-sm text-gray-500 text-center mb-6 break-all font-mono bg-gray-50 p-2 rounded-lg">{url}</p>
        <button onClick={downloadQR} className="btn btn-primary w-full space-x-2 py-3">
          <Download size={20} />
          <span>Download PNG</span>
        </button>
      </div>
    </div>
  );
};

export const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title || 'Are you sure?'}</h3>
        <p className="text-gray-500 mb-6">{message || 'This action cannot be undone.'}</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger flex-1">Delete</button>
        </div>
      </div>
    </div>
  );
};

export const EditModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({ originalUrl: '', customAlias: '', expiresAt: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        originalUrl: initialData.originalUrl || '',
        customAlias: initialData.customAlias || '',
        expiresAt: initialData.expiresAt ? initialData.expiresAt.split('T')[0] : ''
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Edit Link</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destination URL</label>
            <input
              type="text"
              className="input-field"
              value={formData.originalUrl}
              onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custom Alias</label>
            <input
              type="text"
              className="input-field"
              value={formData.customAlias}
              onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>
          
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
