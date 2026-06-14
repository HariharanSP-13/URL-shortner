import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  ChevronLeft, MousePointer2, Calendar, Link as LinkIcon, 
  Monitor, Smartphone, Tablet, Globe, Loader2, AlertCircle
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { formatDate } from '../utils/helpers';
import { StatCard, CardSkeleton } from '../components/UIComponents';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { urlId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Analytics — LinkSnip';
    const fetchAnalytics = async () => {
      try {
        const result = await analyticsApi.getAnalytics(urlId);
        setData(result);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [urlId]);

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return <Smartphone size={16} className="text-primary" />;
      case 'tablet': return <Tablet size={16} className="text-amber-500" />;
      default: return <Monitor size={16} className="text-indigo-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="flex items-center space-x-4">
           <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
           <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Analytics Data Not Found</h2>
        <p className="text-gray-500 mb-6">The link you are looking for doesn't exist or you don't have access.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-5">
          <Link to="/dashboard" className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all text-gray-400 hover:text-primary">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Campaign Insights</h1>
            <p className="text-sm text-gray-500 font-medium truncate max-w-xs md:max-w-md">{data.url.originalUrl}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 pl-4 border border-indigo-100 rounded-2xl shadow-sm">
           <span className="text-sm font-bold text-gray-400">/{data.url.customAlias || data.url.shortCode}</span>
           <div className="h-8 w-px bg-gray-100 mx-1"></div>
           <a href={data.url.shortUrl} target="_blank" rel="noreferrer" className="btn btn-primary !py-1.5 !px-3 font-bold text-xs flex items-center space-x-1">
             <span>Visit Link</span>
             <LinkIcon size={12} />
           </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Engagement" value={data.totalClicks} icon={MousePointer2} color="primary" />
        <StatCard title="Latest Activity" value={data.lastVisited ? formatDate(data.lastVisited) : 'Never'} icon={Calendar} color="success" />
        <StatCard title="Account Created" value={formatDate(data.url.createdAt)} icon={Globe} color="warning" />
        <StatCard title="Status" value={data.url.expiresAt && new Date() > new Date(data.url.expiresAt) ? 'Expired' : 'Active'} icon={AlertCircle} color={data.url.expiresAt && new Date() > new Date(data.url.expiresAt) ? 'danger' : 'success'} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card h-full min-h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-bold text-gray-900">Click Performance</h3>
              <span className="px-3 py-1 bg-indigo-50 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">30 Day Trend</span>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-center">
              {data.totalClicks === 0 ? (
                <div className="text-center">
                   <div className="text-4xl mb-4 opacity-20">📊</div>
                   <p className="text-gray-400 italic">No clicks recorded yet to display trend data.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailyClicks}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} 
                      dy={10}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                      labelStyle={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.dailyClicks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === data.dailyClicks.length - 1 ? '#4f46e5' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Column */}
        <div className="space-y-6">
          <div className="card h-full !p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Live Log</span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {data.recentVisits.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                   <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <LinkIcon size={24} className="text-gray-300" />
                   </div>
                   <p className="text-gray-500 font-medium">No visits yet</p>
                   <p className="text-xs text-gray-400 mt-1">Visit your short link to see tracking in action!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.recentVisits.map((visit, i) => (
                    <div key={i} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-900">{getDeviceIcon(visit.device)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{visit.browser} on {visit.device}</p>
                      <div className="flex items-center justify-between mt-3">
                         <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{visit.ip}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(visit.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
