
import React, { useState } from 'react';
import { getStore, saveStore, setAdminStatus } from '../store';
import { Task, Coupon, Game, UserProfile, WithdrawalRequest, AppSettings, AdPlacement } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'tasks' | 'coupons' | 'withdrawals' | 'ads' | 'settings'>('dashboard');
  const [store, setStore] = useState(getStore());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 't6068422@gmail.com' && password === 'Aass1122@') {
      setIsLoggedIn(true);
      setAdminStatus(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSave = () => {
    saveStore(store);
    alert("System database synchronized!");
  };

  const deleteIp = (ip: string) => {
    const updatedUsers = store.users.filter(u => u.ip !== ip);
    setStore({ ...store, users: updatedUsers });
  };

  const toggleBlock = (ip: string) => {
    const updatedUsers = store.users.map(u => u.ip === ip ? { ...u, isBlocked: !u.isBlocked } : u);
    setStore({ ...store, users: updatedUsers });
  };

  const addAdPlacement = () => {
    const newAd: AdPlacement = {
      id: Math.random().toString(36).substring(7),
      code: '<!-- Paste Ad Script Here -->',
      location: 'main',
      enabled: true
    };
    setStore({ ...store, settings: { ...store.settings, adPlacements: [...store.settings.adPlacements, newAd] } });
  };

  const generateMixedCoupon = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const specials = '!@#$%^&*()';
    const all = chars + nums + specials;
    
    let res = '';
    // Force at least one of each for the mixture requirement
    res += chars[Math.floor(Math.random() * chars.length)];
    res += nums[Math.floor(Math.random() * nums.length)];
    res += specials[Math.floor(Math.random() * specials.length)];
    
    for(let i = 0; i < 5; i++) {
        res += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the result
    return res.split('').sort(() => Math.random() - 0.5).join('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-panel p-10 rounded-3xl w-full max-w-md border-white/5 shadow-2xl">
          <h2 className="text-3xl font-black mb-6 text-center tracking-tighter uppercase text-blue-500">Secure Node Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Staff Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Access Key" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button className="w-full bg-blue-600 py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-all">AUTHENTICATE</button>
            <button type="button" onClick={onClose} className="w-full text-gray-500 font-bold text-sm tracking-widest uppercase mt-4">Exit Portal</button>
          </form>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Mon', coins: 4000, withdrawn: 2400 },
    { name: 'Tue', coins: 3000, withdrawn: 1398 },
    { name: 'Wed', coins: 2000, withdrawn: 9800 },
    { name: 'Thu', coins: 2780, withdrawn: 3908 },
    { name: 'Fri', coins: 1890, withdrawn: 4800 },
    { name: 'Sat', coins: 2390, withdrawn: 3800 },
    { name: 'Sun', coins: 3490, withdrawn: 4300 },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 space-y-2 hidden lg:block bg-black/50">
        <div className="mb-10 px-4">
          <h2 className="text-2xl font-black tracking-tighter text-blue-500">COINRUSH</h2>
          <p className="text-[10px] text-gray-600 font-black tracking-[0.2em] uppercase">Control Matrix</p>
        </div>
        <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon="chart-pie" label="Analytics" />
        <NavItem active={activeView === 'users'} onClick={() => setActiveView('users')} icon="users" label="IP Management" />
        <NavItem active={activeView === 'tasks'} onClick={() => setActiveView('tasks')} icon="stream" label="Task Desk" />
        <NavItem active={activeView === 'coupons'} onClick={() => setActiveView('coupons')} icon="ticket" label="Coupon Vault" />
        <NavItem active={activeView === 'withdrawals'} onClick={() => setActiveView('withdrawals')} icon="wallet" label="Payouts" />
        <NavItem active={activeView === 'ads'} onClick={() => setActiveView('ads')} icon="tv" label="Ads Display" />
        <NavItem active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon="sliders" label="System Config" />
        
        <div className="pt-10 space-y-3">
          <button onClick={handleSave} className="w-full bg-green-600 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-900/20">
            <i className="fas fa-save"></i> SYNC SYSTEM
          </button>
          <button onClick={onClose} className="w-full text-gray-500 py-3 rounded-xl hover:bg-white/5 transition font-bold text-xs">DISCONNECT</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Active IP Nodes" value={store.users.length.toString()} icon="network-wired" color="text-blue-500" />
              <StatCard label="Token Circ." value={store.users.reduce((acc, u) => acc + u.coins, 0).toLocaleString()} icon="coins" color="text-yellow-500" />
              <StatCard label="Payout Queue" value={store.withdrawals.filter(w => w.status === 'pending').length.toString()} icon="hourglass-half" color="text-orange-500" />
              <StatCard label="Tasks Pushed" value={store.tasks.reduce((acc, t) => acc + t.completedBy.length, 0).toString()} icon="check-circle" color="text-green-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-[2rem] border-white/5">
                <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-gray-500">Token Issuance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                    <XAxis dataKey="name" stroke="#444" />
                    <YAxis stroke="#444" />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px' }} />
                    <Bar dataKey="coins" fill="#eab308" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-panel p-8 rounded-[2rem] border-white/5">
                <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-gray-500">Withdrawal Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                    <XAxis dataKey="name" stroke="#444" />
                    <YAxis stroke="#444" />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="withdrawn" stroke="#ef4444" strokeWidth={4} dot={{ fill: '#ef4444', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 shadow-2xl overflow-x-auto">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Active Network Nodes</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="pb-4">IP Signature</th>
                  <th className="pb-4">Coin Balance</th>
                  <th className="pb-4">Task Count</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {store.users.map(user => (
                  <tr key={user.ip} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-mono text-sm text-blue-400">{user.ip}</td>
                    <td className="py-4 font-black text-yellow-500">{user.coins.toLocaleString()}</td>
                    <td className="py-4 font-bold text-gray-400">{user.tasksCompleted.length}</td>
                    <td className="py-4">
                      {user.isBlocked ? (
                        <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black border border-red-500/20">BLOCKED</span>
                      ) : (
                        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black border border-green-500/20">VERIFIED</span>
                      )}
                    </td>
                    <td className="py-4 flex gap-4 text-gray-600">
                      <button onClick={() => toggleBlock(user.ip)} className="hover:text-white transition-colors"><i className={`fas fa-${user.isBlocked ? 'unlock' : 'lock'}`}></i></button>
                      <button onClick={() => deleteIp(user.ip)} className="hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Task Management</h3>
              <button 
                onClick={() => {
                  const newTask: Task = {
                    id: Math.random().toString(36).substring(7),
                    name: 'New Mission',
                    description: 'Short mission description...',
                    category: 'YouTube',
                    reward: 100,
                    link: 'https://',
                    completedBy: []
                  };
                  setStore({ ...store, tasks: [...store.tasks, newTask] });
                }}
                className="bg-blue-600 px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/30 hover:scale-105 transition-all"
              >
                + PUSH NEW TASK
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {store.tasks.map(task => (
                <div key={task.id} className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-6 relative group overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      <input 
                        value={task.name} 
                        onChange={(e) => {
                          const updated = store.tasks.map(t => t.id === task.id ? { ...t, name: e.target.value } : t);
                          setStore({ ...store, tasks: updated });
                        }}
                        className="bg-transparent text-xl font-black border-none outline-none focus:ring-0 w-full p-0 text-white" 
                      />
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase">Short Description</label>
                        <textarea 
                          value={task.description} 
                          onChange={(e) => {
                            const updated = store.tasks.map(t => t.id === task.id ? { ...t, description: e.target.value } : t);
                            setStore({ ...store, tasks: updated });
                          }}
                          className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm outline-none h-20 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase">Category</label>
                          <select 
                            value={task.category} 
                            onChange={(e) => setStore({ ...store, tasks: store.tasks.map(t => t.id === task.id ? { ...t, category: e.target.value } : t) })}
                            className="w-full bg-white/5 p-2 rounded-xl border border-white/10 text-sm outline-none"
                          >
                            <option value="YouTube">YouTube</option>
                            <option value="Telegram">Telegram</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Website visit">Website visit</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase">Reward (Coins)</label>
                          <input type="number" value={task.reward} onChange={(e) => setStore({ ...store, tasks: store.tasks.map(t => t.id === task.id ? { ...t, reward: parseInt(e.target.value) } : t) })} className="w-full bg-white/5 p-2 rounded-xl border border-white/10 text-sm outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase">Link URL</label>
                        <input value={task.link} onChange={(e) => setStore({ ...store, tasks: store.tasks.map(t => t.id === task.id ? { ...t, link: e.target.value } : t) })} className="w-full bg-white/5 p-2 rounded-xl border border-white/10 text-xs font-mono outline-none" />
                      </div>
                    </div>
                    <button onClick={() => setStore({ ...store, tasks: store.tasks.filter(t => t.id !== task.id) })} className="text-red-500/30 hover:text-red-500 transition-colors p-2"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'coupons' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Coupon Vault</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const newCoupon: Coupon = {
                      id: Math.random().toString(36).substring(7),
                      code: generateMixedCoupon(),
                      reward: 500,
                      limit: 100,
                      usedCount: 0,
                      expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                      usedBy: []
                    };
                    setStore({ ...store, coupons: [...store.coupons, newCoupon] });
                  }}
                  className="bg-yellow-600 px-6 py-3 rounded-2xl font-black shadow-lg shadow-yellow-900/30 hover:scale-105 transition-all"
                >
                  + ADD COUPON
                </button>
                <button onClick={() => setStore({ ...store, coupons: [] })} className="bg-red-600/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all">CLEAR ALL</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {store.coupons.map(coupon => (
                <div key={coupon.id} className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <input 
                      value={coupon.code} 
                      onChange={(e) => setStore({ ...store, coupons: store.coupons.map(c => c.id === coupon.id ? { ...c, code: e.target.value } : c) })}
                      className="bg-transparent text-xl font-black tracking-widest text-yellow-500 outline-none w-2/3"
                    />
                    <button onClick={() => setStore({ ...store, coupons: store.coupons.filter(c => c.id !== coupon.id) })} className="text-gray-600 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase">Reward</label>
                      <input type="number" value={coupon.reward} onChange={(e) => setStore({ ...store, coupons: store.coupons.map(c => c.id === coupon.id ? { ...c, reward: parseInt(e.target.value) } : c) })} className="w-full bg-white/5 p-2 rounded-lg border border-white/10 text-xs outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase">Limit</label>
                      <input type="number" value={coupon.limit} onChange={(e) => setStore({ ...store, coupons: store.coupons.map(c => c.id === coupon.id ? { ...c, limit: parseInt(e.target.value) } : c) })} className="w-full bg-white/5 p-2 rounded-lg border border-white/10 text-xs outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 pt-2 border-t border-white/5">
                    <span>Usage: {coupon.usedCount} / {coupon.limit}</span>
                    <span>Expiry: {coupon.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'withdrawals' && (
          <div className="glass-panel p-10 rounded-[3rem] border-white/5 shadow-2xl overflow-x-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Payout Queue</h3>
              <div className="flex gap-4 items-center bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">System Engine:</span>
                <button 
                  onClick={() => setStore({ ...store, settings: { ...store.settings, withdrawEnabled: !store.settings.withdrawEnabled } })}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${store.settings.withdrawEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                >
                  {store.settings.withdrawEnabled ? 'ACTIVE' : 'OFFLINE'}
                </button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="pb-4">IP Identity</th>
                  <th className="pb-4">Trust Wallet (BEP-20)</th>
                  <th className="pb-4">Token Amt</th>
                  <th className="pb-4">State</th>
                  <th className="pb-4">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {store.withdrawals.map(req => (
                  <tr key={req.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-5 font-mono text-sm">{req.ip}</td>
                    <td className="py-5 font-mono text-[10px] text-blue-400 max-w-[150px] truncate">{req.address}</td>
                    <td className="py-5 font-black text-lg">{req.amount.toLocaleString()}</td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black ${req.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-5 flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => {
                            const updated = store.withdrawals.map(w => w.id === req.id ? { ...w, status: 'approved' as const } : w);
                            const updatedUsers = store.users.map(u => u.ip === req.ip ? { ...u, coins: u.coins - req.amount } : u);
                            setStore({ ...store, withdrawals: updated, users: updatedUsers });
                          }} className="bg-green-600 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-green-700 transition-all active:scale-90"><i className="fas fa-check"></i></button>
                          <button onClick={() => {
                            const updated = store.withdrawals.map(w => w.id === req.id ? { ...w, status: 'rejected' as const } : w);
                            setStore({ ...store, withdrawals: updated });
                          }} className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-700 transition-all active:scale-90"><i className="fas fa-times"></i></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'ads' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Ads Management</h3>
              <button onClick={addAdPlacement} className="bg-blue-600 px-8 py-3 rounded-2xl font-black shadow-lg">
                + ADD PLACEMENT
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {store.settings.adPlacements.map(ad => (
                <div key={ad.id} className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <select 
                          value={ad.location} 
                          onChange={(e) => setStore({ ...store, settings: { ...store.settings, adPlacements: store.settings.adPlacements.map(a => a.id === ad.id ? { ...a, location: e.target.value as any } : a) } })}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none"
                        >
                          <option value="main">Main Page</option>
                          <option value="tasks">Tasks Section</option>
                          <option value="games">Games Section</option>
                          <option value="coupons">Coupons Section</option>
                          <option value="bonus">Bonus Section</option>
                          <option value="all">All Sections</option>
                        </select>
                        <button 
                          onClick={() => setStore({ ...store, settings: { ...store.settings, adPlacements: store.settings.adPlacements.map(a => a.id === ad.id ? { ...a, enabled: !a.enabled } : a) } })}
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black border transition-all ${ad.enabled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                        >
                          {ad.enabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                      <button onClick={() => setStore({ ...store, settings: { ...store.settings, adPlacements: store.settings.adPlacements.filter(a => a.id !== ad.id) } })} className="text-red-500/50 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                    </div>
                    <textarea 
                      value={ad.code} 
                      onChange={(e) => setStore({ ...store, settings: { ...store.settings, adPlacements: store.settings.adPlacements.map(a => a.id === ad.id ? { ...a, code: e.target.value } : a) } })}
                      placeholder="Paste Ad Script/HTML Code here..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-[10px] outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="max-w-3xl glass-panel p-12 rounded-[3.5rem] border-white/5 shadow-2xl space-y-10 bg-gradient-to-br from-white/[0.02] to-transparent">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-blue-500">Global Parameters</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Daily Login Node Payout</label>
                <input type="number" value={store.settings.dailyBonus} onChange={(e) => setStore({ ...store, settings: { ...store.settings, dailyBonus: parseInt(e.target.value) } })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Referral Network Bounty</label>
                <input type="number" value={store.settings.referralBonus} onChange={(e) => setStore({ ...store, settings: { ...store.settings, referralBonus: parseInt(e.target.value) } })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Minimum Withdrawal Threshold</label>
                <input type="number" value={store.settings.minWithdraw} onChange={(e) => setStore({ ...store, settings: { ...store.settings, minWithdraw: parseInt(e.target.value) } })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-xl outline-none" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fas fa-${icon} w-6 text-lg`}></i>
    {label}
  </button>
);

const StatCard: React.FC<{ label: string, value: string, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className="glass-panel p-8 rounded-[2rem] border-white/5 flex items-center gap-6 shadow-xl bg-gradient-to-br from-white/[0.02] to-transparent">
    <div className={`w-16 h-16 rounded-[1.2rem] bg-white/5 flex items-center justify-center text-3xl ${color} shadow-inner`}>
      <i className={`fas fa-${icon}`}></i>
    </div>
    <div>
      <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black leading-none">{value}</p>
    </div>
  </div>
);

export default AdminPanel;
