
import React, { useState, useEffect, useMemo } from 'react';
import { getStore, saveStore, getAdminStatus, setAdminStatus } from './store';
import { UserProfile, Task, Coupon, Game, WithdrawalRequest, AppSettings, AdPlacement } from './types';
import IncognitoGuard from './components/IncognitoGuard';
import RulesModal from './components/RulesModal';
import { GemMatcher, SpeedClicker } from './components/Games';
import AdminPanel from './components/AdminPanel';

const AdDisplay: React.FC<{ location: string, placements: AdPlacement[] }> = ({ location, placements }) => {
  const activeAds = placements.filter(ad => ad.enabled && (ad.location === location || ad.location === 'all'));
  if (activeAds.length === 0) return null;

  return (
    <div className="space-y-4 my-6">
      {activeAds.map(ad => (
        <div key={ad.id} className="glass-panel p-4 rounded-2xl border border-white/10 overflow-hidden">
          <div dangerouslySetInnerHTML={{ __html: ad.code }} />
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(getAdminStatus());
  const [userIp, setUserIp] = useState('127.0.0.1'); // Simulated IP
  const [store, setStore] = useState(getStore());
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState<'earn' | 'games' | 'wallet'>('earn');
  const [taskTimer, setTaskTimer] = useState<{ id: string, time: number } | null>(null);

  // Initialize or fetch current user profile by IP
  const currentUser = useMemo(() => {
    let user = store.users.find(u => u.ip === userIp);
    if (!user) {
      user = {
        ip: userIp,
        coins: 0,
        lastDailyBonus: null,
        tasksCompleted: [],
        couponsUsed: [],
        isBlocked: false,
        isFirstVisit: true,
        referralCode: Math.random().toString(36).substring(7).toUpperCase(),
        referredBy: null
      };
    }
    return user;
  }, [store.users, userIp]);

  useEffect(() => {
    const userInStore = store.users.find(u => u.ip === userIp);
    if (!userInStore || userInStore.isFirstVisit) {
      setShowWelcome(true);
      const dismissTimer = setTimeout(() => setShowWelcome(false), 6000);
      
      const newUserProfile: UserProfile = userInStore 
        ? { ...userInStore, isFirstVisit: false }
        : { ...currentUser, isFirstVisit: false };
        
      const updatedUsers = store.users.some(u => u.ip === userIp)
        ? store.users.map(u => u.ip === userIp ? newUserProfile : u)
        : [...store.users, newUserProfile];

      saveStore({ users: updatedUsers });
      setStore(prev => ({ ...prev, users: updatedUsers }));
      
      return () => clearTimeout(dismissTimer);
    }
  }, [userIp]);

  const handleTaskClick = (task: Task) => {
    if (currentUser.tasksCompleted.includes(task.id)) return;
    window.open(task.link, '_blank');
    setTaskTimer({ id: task.id, time: 20 });
  };

  useEffect(() => {
    let interval: number;
    if (taskTimer && taskTimer.time > 0) {
      interval = window.setInterval(() => {
        setTaskTimer(prev => prev ? { ...prev, time: prev.time - 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [taskTimer]);

  const claimTask = (taskId: string) => {
    const task = store.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedUsers = store.users.map(u => {
      if (u.ip === userIp) {
        return {
          ...u,
          coins: u.coins + task.reward,
          tasksCompleted: [...u.tasksCompleted, taskId]
        };
      }
      return u;
    });

    const updatedTasks = store.tasks.map(t => {
      if (t.id === taskId) return { ...t, completedBy: [...t.completedBy, userIp] };
      return t;
    });

    saveStore({ users: updatedUsers, tasks: updatedTasks });
    setStore(prev => ({ ...prev, users: updatedUsers, tasks: updatedTasks }));
    setTaskTimer(null);
    alert(`Successfully claimed ${task.reward} coins!`);
  };

  const handleDailyBonus = () => {
    const today = new Date().toDateString();
    if (currentUser.lastDailyBonus === today) {
      alert("Bonus already claimed for today!");
      return;
    }

    const updatedUsers = store.users.map(u => {
      if (u.ip === userIp) {
        return {
          ...u,
          coins: u.coins + store.settings.dailyBonus,
          lastDailyBonus: today
        };
      }
      return u;
    });

    saveStore({ users: updatedUsers });
    setStore(prev => ({ ...prev, users: updatedUsers }));
    alert(`Daily bonus of ${store.settings.dailyBonus} coins claimed!`);
  };

  const redeemCoupon = (code: string) => {
    if (!code) return;
    const coupon = store.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    
    if (!coupon) return alert("Incorrect coupon code");
    if (new Date(coupon.expiryDate) < new Date()) return alert("Coupon expired");
    if (coupon.usedCount >= coupon.limit) return alert("Coupon usage limit reached");
    if (currentUser.couponsUsed.includes(coupon.id)) return alert("You have already used this coupon");

    const updatedCoupons = store.coupons.map(c => {
      if (c.id === coupon.id) return { ...c, usedCount: c.usedCount + 1, usedBy: [...c.usedBy, userIp] };
      return c;
    });

    const updatedUsers = store.users.map(u => {
      if (u.ip === userIp) {
        return { ...u, coins: u.coins + coupon.reward, couponsUsed: [...u.couponsUsed, coupon.id] };
      }
      return u;
    });

    saveStore({ coupons: updatedCoupons, users: updatedUsers });
    setStore(prev => ({ ...prev, coupons: updatedCoupons, users: updatedUsers }));
    alert(`Coupon redeemed for ${coupon.reward} coins!`);
  };

  const handleWithdrawal = (address: string, amount: number) => {
    if (amount < store.settings.minWithdraw) return alert(`Minimum withdrawal is ${store.settings.minWithdraw} coins`);
    if (currentUser.coins < amount) return alert("Insufficient balance");

    const newRequest: WithdrawalRequest = {
      id: Math.random().toString(36).substring(7),
      ip: userIp,
      address,
      amount,
      status: 'pending',
      date: new Date().toISOString()
    };

    const updatedWithdrawals = [...store.withdrawals, newRequest];
    saveStore({ withdrawals: updatedWithdrawals });
    setStore(prev => ({ ...prev, withdrawals: updatedWithdrawals }));
    alert("Withdrawal request submitted! Pending approval.");
  };

  const addCoins = (amount: number) => {
    const updatedUsers = store.users.map(u => 
      u.ip === userIp ? { ...u, coins: u.coins + amount } : u
    );
    saveStore({ users: updatedUsers });
    setStore(prev => ({ ...prev, users: updatedUsers }));
  };

  if (isAdminMode) {
    return <AdminPanel onClose={() => { setIsAdminMode(false); setAdminStatus(false); }} />;
  }

  if (currentUser.isBlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-950/20 text-white text-center p-6">
        <div className="glass-panel p-8 rounded-3xl border-2 border-red-500 max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.3)]">
          <i className="fas fa-ban text-6xl text-red-500 mb-4"></i>
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Access Denied</h1>
          <p className="text-gray-400 font-medium">Your IP has been permanently blacklisted for abuse.</p>
        </div>
      </div>
    );
  }

  return (
    <IncognitoGuard>
      <RulesModal onAgree={() => {}} />
      
      {showWelcome && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl welcome-banner font-black border border-white/20 flex items-center gap-3">
          <span className="text-2xl animate-spin-slow">✨</span>
          WELCOME! TASK UP & EARN NOW!
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-10 pb-32">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 tracking-tighter drop-shadow-2xl">
              COINRUSH
            </h1>
            <p className="text-[10px] text-gray-500 font-mono mt-2 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              LIVE IP: {userIp}
            </p>
          </div>
          <div className="glass-panel px-10 py-5 rounded-[2.5rem] flex items-center gap-5 border-yellow-500/40 bg-yellow-500/5 min-w-[240px] shadow-2xl">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-600 rounded-[1.2rem] flex items-center justify-center coin-3d shadow-[0_10px_20px_rgba(234,179,8,0.3)] border-b-4 border-orange-800">
              <i className="fas fa-coins text-black text-2xl"></i>
            </div>
            <div>
              <p className="text-[11px] text-yellow-500 uppercase font-black tracking-[0.25em] mb-0.5">Coins</p>
              <p className="text-4xl font-black text-white leading-none">{currentUser.coins}</p>
            </div>
          </div>
        </header>

        <AdDisplay location="main" placements={store.settings.adPlacements} />

        <section className="mb-12">
          <button 
            onClick={handleDailyBonus}
            className={`w-full p-10 rounded-[2.5rem] border-2 border-dashed transition-all group flex flex-col md:flex-row items-center justify-between gap-6 ${
              currentUser.lastDailyBonus === new Date().toDateString() 
              ? 'border-gray-800 bg-gray-900/40 cursor-not-allowed opacity-60' 
              : 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10 active:scale-[0.98] shadow-2xl shadow-green-500/10'
            }`}
          >
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-700 rounded-3xl flex items-center justify-center text-5xl group-hover:rotate-12 transition shadow-2xl">
                🎁
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-black text-white leading-tight">Daily Loot</h3>
                <p className="text-green-400 font-bold text-lg">+{store.settings.dailyBonus} coins available</p>
              </div>
            </div>
            <div className={`font-black text-xl px-12 py-4 rounded-2xl tracking-tighter transition-all ${
              currentUser.lastDailyBonus === new Date().toDateString() 
              ? 'bg-gray-800 text-gray-500' 
              : 'bg-green-500 text-black shadow-xl shadow-green-500/40'
            }`}>
              {currentUser.lastDailyBonus === new Date().toDateString() ? "CLAIMED" : "UNBOX"}
            </div>
          </button>
        </section>

        <nav className="flex gap-3 mb-12 bg-black/40 p-2.5 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-3xl">
          <button 
            onClick={() => setActiveTab('earn')}
            className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'earn' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <i className="fas fa-bolt mr-2"></i> Tasks
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'games' ? 'bg-purple-600 text-white shadow-2xl shadow-purple-500/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <i className="fas fa-gamepad mr-2"></i> Play
          </button>
          {store.settings.withdrawEnabled && (
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'wallet' ? 'bg-orange-600 text-white shadow-2xl shadow-orange-500/40' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <i className="fas fa-wallet mr-2"></i> Cash
            </button>
          )}
        </nav>

        <main className="min-h-[600px]">
          {activeTab === 'earn' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <AdDisplay location="tasks" placements={store.settings.adPlacements} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.tasks.map(task => (
                  <div key={task.id} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/40 transition-all group flex flex-col justify-between hover:bg-blue-500/5 shadow-xl">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-black px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 tracking-widest">
                          {task.category}
                        </span>
                        <div className="flex items-center gap-2 text-yellow-500 font-black text-lg">
                          <i className="fas fa-plus-circle"></i>
                          {task.reward}
                        </div>
                      </div>
                      <h3 className="font-black text-xl text-white group-hover:text-blue-400 transition-colors leading-tight">{task.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
                    </div>
                    <div className="flex justify-end mt-auto">
                      {currentUser.tasksCompleted.includes(task.id) ? (
                        <div className="bg-green-500/10 text-green-500 p-5 rounded-3xl border border-green-500/20 shadow-inner">
                          <i className="fas fa-check-double text-2xl"></i>
                        </div>
                      ) : (
                        <div>
                          {taskTimer?.id === task.id ? (
                            <button 
                              disabled={taskTimer.time > 0}
                              onClick={() => claimTask(task.id)}
                              className={`px-10 py-4 rounded-2xl font-black transition-all shadow-2xl ${taskTimer.time > 0 ? 'bg-gray-800 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                              {taskTimer.time > 0 ? `${taskTimer.time}s` : 'CLAIM'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleTaskClick(task)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-blue-500/30"
                            >
                              RUN TASK
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <AdDisplay location="coupons" placements={store.settings.adPlacements} />

              <div className="glass-panel p-12 rounded-[3rem] mt-16 bg-white/5 border-white/10 shadow-2xl">
                <h3 className="text-3xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">
                  <i className="fas fa-ticket text-yellow-500 rotate-12"></i> VOUCHER CODE
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    id="coupon_input"
                    placeholder="ENTER CODE" 
                    className="flex-1 bg-black/60 border border-white/10 rounded-3xl px-8 py-5 outline-none focus:border-yellow-500 transition-all font-mono tracking-[0.3em] text-center sm:text-left text-xl font-bold"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('coupon_input') as HTMLInputElement;
                      redeemCoupon(input.value);
                      input.value = '';
                    }}
                    className="bg-white text-black font-black px-12 py-5 rounded-3xl hover:bg-yellow-400 transition-all active:scale-95 shadow-2xl shadow-white/10 text-lg"
                  >
                    REDEEM
                  </button>
                </div>
              </div>

              <div className="glass-panel p-12 rounded-[3rem] mt-10 bg-purple-500/5 border-purple-500/20 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">INVITE FRIENDS</h3>
                    <p className="text-gray-400 text-lg">Earn <span className="text-purple-400 font-black">+{store.settings.referralBonus} Coins</span> per IP.</p>
                  </div>
                  <div className="w-full md:w-auto">
                    <div className="bg-black/60 border border-purple-500/30 p-6 rounded-3xl flex items-center gap-6 shadow-inner">
                      <code className="text-purple-400 font-bold text-lg select-all font-mono">.../?ref={currentUser.referralCode}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${currentUser.referralCode}`);
                          alert("Link copied!");
                        }}
                        className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center hover:bg-purple-700 transition shadow-2xl"
                      >
                        <i className="fas fa-copy text-xl"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
              <AdDisplay location="games" placements={store.settings.adPlacements} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {store.games.filter(g => g.enabled).map(game => (
                  <div key={game.id} className="h-[450px] shadow-2xl">
                    {game.type === 'match' ? (
                      <GemMatcher baseReward={game.baseReward} onReward={addCoins} />
                    ) : (
                      <SpeedClicker baseReward={game.baseReward} onReward={addCoins} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="max-w-md mx-auto animate-in slide-in-from-right-12 duration-700">
              <div className="glass-panel p-12 rounded-[4rem] border-orange-500/40 bg-orange-500/5 shadow-2xl">
                <div className="w-24 h-24 bg-orange-600/20 rounded-[2rem] flex items-center justify-center text-5xl mb-10 mx-auto text-orange-500 border border-orange-500/30">
                  <i className="fas fa-piggy-bank"></i>
                </div>
                <h3 className="text-4xl font-black mb-10 text-center tracking-tight uppercase">PAYOUT</h3>
                <div className="space-y-8">
                  <div>
                    <label className="text-[11px] uppercase font-black text-gray-500 mb-3 block tracking-[0.25em]">TRUST WALLET (BEP-20)</label>
                    <input 
                      type="text" 
                      id="wallet_addr"
                      placeholder="0x..."
                      className="w-full bg-black/70 border border-white/10 rounded-3xl px-8 py-5 outline-none focus:border-orange-500 transition-all font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase font-black text-gray-500 mb-3 block tracking-[0.25em]">AMOUNT</label>
                    <input 
                      type="number" 
                      id="withdraw_amt"
                      placeholder="0"
                      className="w-full bg-black/70 border border-white/10 rounded-3xl px-8 py-5 outline-none focus:border-orange-500 transition-all font-black text-3xl"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const addr = (document.getElementById('wallet_addr') as HTMLInputElement).value;
                      const amt = parseInt((document.getElementById('withdraw_amt') as HTMLInputElement).value);
                      handleWithdrawal(addr, amt);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-400 py-6 rounded-[2.5rem] font-black text-2xl text-white mt-6 shadow-2xl transition-all active:scale-95 border-b-4 border-orange-800"
                  >
                    SEND REQUEST
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-[40vh] pointer-events-none z-[-1] overflow-hidden opacity-40 select-none">
        <div className="absolute -bottom-40 -left-40 w-[60vw] h-[60vw] bg-yellow-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute left-1/2 bottom-10 -translate-x-1/2 flex gap-16 md:gap-48 items-end">
          <i className="fas fa-coins text-[12rem] text-yellow-500/5 coin-3d" style={{ animationDelay: '0s' }}></i>
          <i className="fas fa-gem text-[15rem] text-blue-500/5 coin-3d" style={{ animationDelay: '1.5s' }}></i>
          <i className="fas fa-wallet text-[18rem] text-orange-500/5 coin-3d" style={{ animationDelay: '0.8s' }}></i>
        </div>
      </div>

      <footer className="text-center py-24 opacity-30">
        <p className="font-black text-xs tracking-[0.4em] uppercase">COINRUSH ECOSYSTEM • GLOBAL IP NETWORK</p>
        <button 
          onClick={() => setIsAdminMode(true)}
          className="mt-8 text-[11px] font-black uppercase tracking-[0.5em] hover:text-white transition-all border-b-2 border-transparent hover:border-white/40 pb-2"
        >
          ADMIN ACCESS
        </button>
      </footer>
    </IncognitoGuard>
  );
};

export default App;
