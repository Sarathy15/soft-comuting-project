import React, { useEffect, useState, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Activity, 
  AlertCircle, 
  Globe, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  BarChart3,
  ListOrdered
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface TopKItem {
  item: string;
  count: number;
}

interface Alert {
  id: string;
  message: string;
  timestamp: number;
}

interface AnalyticsData {
  shortTopK: TopKItem[];
  longTopK: TopKItem[];
  regionTopK: Record<string, TopKItem[]>;
  regionStats: Record<string, number>;
  alerts: Alert[];
}

// --- Components ---

const LiveIndicator = () => (
  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Live Stream</span>
  </div>
);

const Card = ({ title, icon: Icon, children, className, headerAction }: any) => (
  <div className={cn("bg-[#151619] border border-[#2A2B2F] rounded-xl overflow-hidden flex flex-col", className)}>
    <div className="px-4 py-3 border-bottom border-[#2A2B2F] flex items-center justify-between bg-[#1C1D21]">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-[#8E9299]" />}
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8E9299]">{title}</h3>
      </div>
      {headerAction}
    </div>
    <div className="p-4 flex-1">
      {children}
    </div>
  </div>
);

export default function App() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [connected, setConnected] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'STATS') {
        setData(msg);
      }
    };

    return () => socket.close();
  }, []);

  const regions = data ? Object.keys(data.regionStats) : [];
  
  const currentTopK = selectedRegion === 'All' 
    ? data?.shortTopK || [] 
    : data?.regionTopK[selectedRegion] || [];

  const chartData = currentTopK.map(item => ({
    name: item.item,
    value: item.count
  }));

  const heatmapData = selectedRegion === 'All'
    ? Object.entries(data?.regionStats || {}).map(([name, value]) => ({
        name,
        value
      }))
    : (data?.regionTopK[selectedRegion] || []).map(item => ({
        name: item.item,
        value: item.count
      }));

  const COLORS = ['#F27D26', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#FFFFFF] font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#2A2B2F] bg-[#0A0B0D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center shadow-lg shadow-[#F27D26]/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI PULSE</h1>
              <p className="text-[10px] text-[#8E9299] font-medium uppercase tracking-widest">Real-Time Stream Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[11px] font-medium text-[#8E9299] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-yellow-500" />
                <span>Count-Min Sketch ε=0.001</span>
              </div>
              <div className="w-px h-3 bg-[#2A2B2F]" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-green-500" />
                <span>Privacy Preserved</span>
              </div>
            </div>
            <LiveIndicator />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Top-K Ranking */}
        <div className="lg:col-span-3 space-y-6">
          <Card 
            title={selectedRegion === 'All' ? "Global Top-K (5m)" : `Top-K in ${selectedRegion}`} 
            icon={ListOrdered}
            headerAction={
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-[#1C1D21] border border-[#2A2B2F] text-[10px] text-[#8E9299] rounded px-2 py-1 outline-none focus:border-[#F27D26] transition-colors"
              >
                <option value="All">All Regions</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            }
          >
            <div className="space-y-3">
              {currentTopK.map((item, idx) => (
                <div key={item.item} className="group flex items-center justify-between p-3 rounded-lg bg-[#1C1D21] border border-transparent hover:border-[#F27D26]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                      idx === 0 ? "bg-[#F27D26] text-white" : "bg-[#2A2B2F] text-[#8E9299]"
                    )}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium">{item.item}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-[#8E9299]">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {currentTopK.length === 0 && <div className="text-center py-10 text-[#8E9299] text-xs">No data for this region yet...</div>}
            </div>
          </Card>

          <Card title="Trend Comparison" icon={TrendingUp}>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#1C1D21] border border-[#2A2B2F]">
                <p className="text-[10px] uppercase tracking-widest text-[#8E9299] mb-2">Short Window (5m)</p>
                <p className="text-xl font-bold text-[#F27D26]">{data?.shortTopK[0]?.item || '---'}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1C1D21] border border-[#2A2B2F]">
                <p className="text-[10px] uppercase tracking-widest text-[#8E9299] mb-2">Long Window (1h)</p>
                <p className="text-xl font-bold text-blue-500">{data?.longTopK[0]?.item || '---'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column: Visualizations */}
        <div className="lg:col-span-6 space-y-6">
          <Card title={selectedRegion === 'All' ? "Global Tool Popularity" : `Tool Popularity in ${selectedRegion}`} icon={BarChart3} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8E9299', fontSize: 11 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1C1D21', border: '1px solid #2A2B2F', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title={selectedRegion === 'All' ? "Regional Activity Intensity" : `Tool Distribution in ${selectedRegion}`} icon={Globe} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={heatmapData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {heatmapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1D21', border: '1px solid #2A2B2F', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {heatmapData.slice(0, 6).map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-[#8E9299] uppercase truncate max-w-[60px]">{r.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="System Health" icon={Zap} className="h-[300px]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8E9299]">WebSocket Status</span>
                  <span className={cn("text-xs font-bold", connected ? "text-green-500" : "text-red-500")}>
                    {connected ? "CONNECTED" : "DISCONNECTED"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8E9299]">Ingestion Rate</span>
                  <span className="text-xs font-bold text-blue-500">~12 events/sec</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8E9299]">Memory Usage</span>
                  <span className="text-xs font-bold text-purple-500">4.2 MB (Fixed)</span>
                </div>
                <div className="pt-4 border-t border-[#2A2B2F]">
                  <p className="text-[9px] text-[#8E9299] leading-relaxed uppercase tracking-wider">
                    Using Count-Min Sketch for space-efficient frequency estimation. 
                    Error bound: ε * N with probability 1-δ.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Alerts */}
        <div className="lg:col-span-3 space-y-6">
          <Card title="Real-Time Alerts" icon={AlertCircle}>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {data?.alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-start gap-3">
                    <TrendingUp size={14} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium leading-tight">{alert.message}</p>
                      <p className="text-[9px] text-[#8E9299] mt-1 uppercase tracking-widest">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {data?.alerts.length === 0 && (
                <div className="text-center py-10 text-[#8E9299] text-xs italic">
                  Monitoring for trend shifts...
                </div>
              )}
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-[#F27D26]/5 border border-[#F27D26]/20">
            <h4 className="text-[10px] font-bold text-[#F27D26] uppercase tracking-widest mb-2">Ethical Notice</h4>
            <p className="text-[10px] text-[#8E9299] leading-relaxed italic">
              This application processes public Hacker News data streams. No personal user data (PII) is collected, stored, or processed. All regional and industry attributes are simulated for demonstration purposes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#2A2B2F] py-8 bg-[#0A0B0D]">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[#8E9299] uppercase tracking-widest">
            © 2025 AI PULSE ANALYTICS • ACADEMIC MAJOR PROJECT
          </p>
          <div className="flex items-center gap-6 text-[10px] text-[#8E9299] uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
