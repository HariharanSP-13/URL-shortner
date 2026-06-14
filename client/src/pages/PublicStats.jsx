import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  BarChart2, MousePointer2, Calendar, Link as LinkIcon, 
  Monitor, Smartphone, Tablet, Globe, Loader2, AlertCircle, TrendingUp
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { formatDate } from '../utils/helpers';
import { StatCard, CardSkeleton } from '../components/UIComponents';
import toast from 'react-hot-toast';

const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Public Statistics — LinkSnip';
    const fetchStats = async () => {
      try {
        const result = await analyticsApi.getPublicStats(shortCode);
        setData(result);
      } catch (error) {
        toast.error('Failed to load statistics. Link may be private or invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

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
        <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertCircle size={48} className="text-danger" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistics Not Available</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          We couldn't find public analytics for this link. It might be private or the short code is incorrect.
        </p>
        <Link to="/" className="btn btn-primary">Go to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <TrendingUp size={14} />
                <span>Public Link Insights</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                Performance for <span className="text-primary">/{shortCode}</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto break-all">
                Destination: <span className="text-gray-900">{data.url.originalUrl}</span>
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <StatCard 
                title="Total Engagement" 
                value={data.totalClicks} 
                icon={MousePointer2} 
                color="primary" 
                description="Total redirects handled"
            />
            <StatCard 
                title="Link Created" 
                value={formatDate(data.url.createdAt)} 
                icon={Calendar} 
                color="success" 
                description="When this short code was registered"
            />
            <StatCard 
                title="Target URL" 
                value="Active" 
                icon={LinkIcon} 
                color="indigo" 
                description="Status of the bridge"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2">
                <div className="card h-full min-h-[450px] border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-bold text-gray-900">Weekly Activity</h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last 7 Days</span>
                    </div>
                    
                    <div className="flex-1">
                        {data.totalClicks === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <BarChart2 size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No clicks yet to visualize</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.dailyClicks}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} 
                                        dy={10}
                                        tickFormatter={(val) => {
                                            const d = new Date(val);
                                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        }}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                        labelStyle={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#4f46e5" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Device Insights */}
            <div className="space-y-8">
                <div className="card border border-gray-100 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-8">Device Distribution</h3>
                    <div className="space-y-6">
                        {data.deviceStats.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 font-medium">No device data yet</div>
                        ) : (
                            data.deviceStats.map((stat, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/5 transition-colors">
                                                {getDeviceIcon(stat.device)}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 capitalize">{stat.device}</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{stat.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-primary h-full rounded-full transition-all duration-1000" 
                                            style={{ width: `${(stat.count / data.totalClicks) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-auto pt-10 text-center">
                         <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Want your own stats?</p>
                             <Link to="/signup" className="btn btn-primary w-full shadow-lg shadow-primary/20">Create Free Account</Link>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStats;
