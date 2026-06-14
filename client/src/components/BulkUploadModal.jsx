import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { urlApi } from '../api/urls';
import toast from 'react-hot-toast';

const BulkUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const urls = text.split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Check if it's a simple URL string or CSV row
            const parts = line.split(',');
            if (parts.length > 1) {
              return {
                originalUrl: parts[0],
                customAlias: parts[1] || undefined,
                expiresAt: parts[2] || undefined
              };
            }
            return line; // Just a string
          });

        if (urls.length === 0) {
          toast.error('No valid URLs found in CSV');
          setIsUploading(false);
          return;
        }

        const response = await urlApi.bulkCreate(urls);
        
        if (response.totalCreated > 0) {
          toast.success(`Successfully uploaded ${response.totalCreated} URLs`);
          if (response.totalFailed > 0) {
            toast.warning(`${response.totalFailed} URLs failed to process`);
          }
          onRefresh();
          onClose();
        } else {
          toast.error('Bulk upload failed. No URLs were created.');
        }
      } catch (error) {
        console.error('Bulk upload error:', error);
        toast.error(error.response?.data?.message || 'Bulk upload failed');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Upload size={20} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Bulk CSV Upload</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50/50 hover:bg-indigo-50/30 hover:border-primary/40 transition-all cursor-pointer relative group">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                <FileText size={28} className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{fileName || 'Drop your CSV here'}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Accepts .csv files with optional columns</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl flex space-x-3 items-start border border-indigo-100/50">
            <AlertCircle size={18} className="text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-indigo-900 font-bold uppercase tracking-wider">Formatting Tip</p>
              <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                CSV Format: <code className="bg-white/50 px-1 rounded">url,alias,expiry</code><br />
                Example: <code className="bg-white/50 px-1 rounded">https://google.com,my-google,2026-12-31</code>
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="btn btn-primary flex-1 space-x-2"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Start Processing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
