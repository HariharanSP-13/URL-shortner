import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, BarChart3, QrCode, Shield, Layers, ArrowRight, Check, 
  Globe, MousePointer2, Smartphone, Download
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <Zap className="h-4 w-4" />
               <span>New: Bulk CSV Processing is Live</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               Shorten links. <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">Expand reach.</span>
            </h1>
            
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
               The world's most powerful link management platform. Track every click, generate QR codes, and gain real-time insights with high-fidelity analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Link to="/signup" className="btn btn-primary !py-4 !px-10 text-lg shadow-xl shadow-primary/30 group">
                <span>Start for Free</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn btn-secondary !py-4 !px-10 text-lg">
                View Demo
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                    alt="Dashboard Preview" 
                    className="w-full h-auto object-cover blur-[2px] opacity-10"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="card max-w-lg w-full transform -rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-gray-900">Campaign Analytics</h3>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full">LIVE</span>
                          </div>
                          <div className="space-y-4">
                              <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                              <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                              <div className="grid grid-cols-3 gap-3 pt-4">
                                  <div className="h-16 bg-indigo-50 rounded-xl border border-indigo-100"></div>
                                  <div className="h-16 bg-indigo-50 rounded-xl border border-indigo-100"></div>
                                  <div className="h-16 bg-indigo-50 rounded-xl border border-indigo-100"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl italic">
                      Everything you need to grow your digital footprint
                  </h2>
                  <p className="mt-4 text-lg text-gray-500 font-medium">
                      Forget simple redirects. Get a complete toolkit designed for high-performance marketing.
                  </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <Feature 
                    icon={BarChart3} 
                    title="Real-time Analytics" 
                    desc="Track clicks, geographic locations, and device types in real-time. See who is clicking and when."
                  />
                  <Feature 
                    icon={QrCode} 
                    title="QR Code Generation" 
                    desc="Every link automatically generates a high-quality QR code. Perfect for print and outdoor ads."
                  />
                  <Feature 
                    icon={Layers} 
                    title="Bulk Processing" 
                    desc="Shorten hundreds of links at once with our CSV upload tool. Ideal for large-scale campaigns."
                  />
                  <Feature 
                    icon={Shield} 
                    title="Link Expiration" 
                    desc="Set self-destruct timers for your links. Perfect for temporary promotions or secure shares."
                  />
                  <Feature 
                    icon={Globe} 
                    title="Custom Aliases" 
                    desc="Brand your links with custom keywords to increase click-through rates by up to 34%."
                  />
                  <Feature 
                    icon={MousePointer2} 
                    title="Public Stats" 
                    desc="Optionally share your link performance publicly with our professional stats pages."
                  />
              </div>
          </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <Stat label="Links Shortened" value="2.4M+" />
                  <Stat label="Clicks Tracked" value="150M+" />
                  <Stat label="Active Users" value="85k+" />
                  <Stat label="Scanning QR" value="12M+" />
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-20 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-b border-gray-800 pb-12 mb-12">
               <h2 className="text-3xl font-bold mb-6">Ready to snip your first link?</h2>
               <Link to="/signup" className="btn btn-primary !py-4 !px-12 text-lg">
                  Join 85,000+ Marketers
               </Link>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Zap size={20} className="text-primary" />
                  </div>
                  <span className="text-xl font-black italic tracking-tighter">LinkSnip</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                  © 2026 LinkSnip. Built for the Katamaran Hackathon.
              </p>
          </div>
      </footer>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc }) => (
    <div className="card hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100 group">
        <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
);

const Stat = ({ label, value }) => (
    <div className="text-center">
        <p className="text-4xl font-black text-gray-900 mb-2">{value}</p>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
);

export default Landing;
