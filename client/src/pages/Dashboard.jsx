import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { urlApi } from '../api/urls';
import { 
  Plus, Copy, BarChart2, Trash2, QrCode, ExternalLink, 
  Search, Link as LinkIcon, Calendar, ArrowRight, Loader2, Sparkles,
  Edit2, Check, AlertCircle, Clock, Upload, Share2
} from 'lucide-react';



import { formatDate, copyToClipboard, truncateUrl, isValidUrl } from '../utils/helpers';
import { QRModal, DeleteModal, EditModal } from '../components/Modals';
import BulkUploadModal from '../components/BulkUploadModal';
import { TableSkeleton } from '../components/UIComponents';
import toast from 'react-hot-toast';


const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({ originalUrl: '', customAlias: '', expiresAt: '' });
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal states
  const [qrModal, setQrModal] = useState({ open: false, url: '', code: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editModal, setEditModal] = useState({ open: false, url: null });
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);


  useEffect(() => {
    document.title = 'Dashboard — LinkSnip';
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const data = await urlApi.getUrls();
      setUrls(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isValidUrl(formData.originalUrl)) {
      setFormError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setSubmitLoading(true);
    try {
      const newUrl = await urlApi.createUrl(formData);
      setUrls([newUrl, ...urls]);
      setFormData({ originalUrl: '', customAlias: '', expiresAt: '' });
      toast.success('Short URL created!');
      setQrModal({ open: true, url: newUrl.shortUrl, code: newUrl.customAlias || newUrl.shortCode });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create URL');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await urlApi.deleteUrl(deleteModal.id);
      setUrls(urls.filter(u => u._id !== deleteModal.id));
      toast.success('Link deleted');
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const updated = await urlApi.updateUrl(editModal.url._id, updatedData);
      setUrls(urls.map(u => u._id === updated._id ? updated : u));
      toast.success('Link updated successfully');
      setEditModal({ open: false, url: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCopy = (id, text) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied!');
  };

  const getExpiryBadge = (date) => {
    if (!date) return null;
    const expiry = new Date(date);
    const now = new Date();
    
    if (now > expiry) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
          <AlertCircle size={10} />
          <span>Expired</span>
        </span>
      );
    }
    
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
          <Clock size={10} />
          <span>Expires in {diffDays}d</span>
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
        <span>Expires {formatDate(date)}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Create Section */}
      <div className="mb-12">
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="text-primary" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Shorten a new link</h2>
        </div>
        
        <div className="card border border-primary/10 bg-gradient-to-br from-white to-indigo-50/30">
          <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-12">
              {formError && (
                <div className="bg-red-50 text-danger text-sm p-3 rounded-lg mb-2 flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <LinkIcon size={18} />
              </div>
              <input
                type="text"
                placeholder="Paste your long URL here..."
                className="input-field pl-10 h-12 text-sm"
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
              />
            </div>
            
            <div className="lg:col-span-3">
              <input
                type="text"
                placeholder="Custom alias (optional)"
                className="input-field h-12 text-sm"
                value={formData.customAlias}
                onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
              />
            </div>

            <div className="lg:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                className="input-field pl-10 h-12 text-sm"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
            
            <div className="lg:col-span-2 text-sm">
              <button
                type="submit"
                disabled={submitLoading}
                className="btn btn-primary w-full h-12 shadow-lg shadow-primary/20"
              >
                {submitLoading ? <Loader2 className="animate-spin" /> : 'Shorten Now'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* URL List */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your shortened links</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track your active campaigns</p>
        </div>
        <button 
          onClick={() => setBulkUploadOpen(true)}
          className="btn btn-secondary space-x-2 shadow-sm border-gray-200"
        >
          <Upload size={18} className="text-primary" />
          <span className="hidden sm:inline">Upload CSV</span>
        </button>
      </div>


      {loading ? (
        <div className="card"><TableSkeleton /></div>
      ) : urls.length === 0 ? (
        <div className="card py-16 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">No links yet</h3>
            <p className="text-gray-500 mb-6">Paste your first URL above to get started with tracking.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block card !p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 italic">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Destination URL</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Short Identity</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center tracking-widest">Stats</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {urls.map((url) => (
                    <tr key={url._id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-gray-900 truncate mb-1" title={url.originalUrl}>
                            {url.originalUrl}
                          </p>
                          {getExpiryBadge(url.expiresAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <a href={url.shortUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center">
                            /{url.customAlias || url.shortCode}
                            <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {url.clicks} clicks
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(url.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            onClick={() => handleCopy(url._id, url.shortUrl)}
                            className={`p-2 transition-all duration-200 rounded-lg ${copiedId === url._id ? 'text-success bg-green-50' : 'text-gray-400 hover:text-primary hover:bg-indigo-50'}`}
                          >
                            {copiedId === url._id ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                          <button onClick={() => setQrModal({ open: true, url: url.shortUrl, code: url.customAlias || url.shortCode })} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"><QrCode size={18} /></button>
                          <Link to={`/analytics/${url._id}`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><BarChart2 size={18} /></Link>
                          <button onClick={() => setEditModal({ open: true, url })} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={18} /></button>
                          <button 
                             onClick={() => {
                               const statsUrl = `${window.location.origin}/stats/${url.customAlias || url.shortCode}`;
                               copyToClipboard(statsUrl);
                               toast.success('Stats link copied!');
                             }} 
                             className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                             title="Share Public Stats"
                           >
                             <Share2 size={18} />
                           </button>
                           <button onClick={() => setDeleteModal({ open: true, id: url._id })} className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>


                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {urls.map((url) => (
              <div key={url._id} className="card border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="max-w-[70%]">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Destination</p>
                    <p className="text-sm font-bold text-gray-900 truncate" title={url.originalUrl}>{url.originalUrl}</p>
                    <div className="mt-2">{getExpiryBadge(url.expiresAt)}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Clicks</p>
                    <span className="text-sm font-bold text-primary">{url.clicks}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 -mx-6 px-6 py-3 border-y border-gray-100 mb-4 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Short Link</span>
                      <a href={url.shortUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary">/{url.customAlias || url.shortCode}</a>
                   </div>
                   <button 
                      onClick={() => handleCopy(url._id, url.shortUrl)}
                      className={`btn btn-primary !p-2 !rounded-lg ${copiedId === url._id ? 'bg-success hover:bg-success' : ''}`}
                   >
                     {copiedId === url._id ? <Check size={16} /> : <Copy size={16} />}
                   </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Added {formatDate(url.createdAt)}</span>
                  <div className="flex space-x-1">
                    <button onClick={() => setQrModal({ open: true, url: url.shortUrl, code: url.customAlias || url.shortCode })} className="p-2 text-gray-500 bg-gray-100 rounded-lg"><QrCode size={18} /></button>
                    <Link to={`/analytics/${url._id}`} className="p-2 text-gray-500 bg-gray-100 rounded-lg inline-block"><BarChart2 size={18} /></Link>
                    <button onClick={() => setEditModal({ open: true, url })} className="p-2 text-gray-500 bg-gray-100 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => setDeleteModal({ open: true, id: url._id })} className="p-2 text-danger bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <QRModal 
        isOpen={qrModal.open} 
        onClose={() => setQrModal({ ...qrModal, open: false })} 
        url={qrModal.url}
        shortCode={qrModal.code}
      />
      <DeleteModal 
        isOpen={deleteModal.open} 
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Link"
        message="Are you sure? This delete is permanent and will remove all click analytics tracking for this URL."
      />
      <EditModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, url: null })}
        onSave={handleUpdate}
        initialData={editModal.url}
      />
      <BulkUploadModal 
        isOpen={bulkUploadOpen} 
        onClose={() => setBulkUploadOpen(false)} 
        onRefresh={fetchUrls} 
      />
    </div>

  );
};

export default Dashboard;
