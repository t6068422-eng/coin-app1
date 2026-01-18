
import React, { useState, useEffect } from 'react';

const RulesModal: React.FC<{ onAgree: () => void }> = ({ onAgree }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastAgree = localStorage.getItem('last_rules_agreement');
    const today = new Date().toDateString();
    if (lastAgree !== today) {
      setShow(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('last_rules_agreement', new Date().toDateString());
    setShow(false);
    onAgree();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <h2 className="text-3xl font-bold text-yellow-500 mb-6 flex items-center gap-3">
          <i className="fas fa-scroll"></i> Platform Rules
        </h2>
        <ul className="space-y-4 text-gray-200 mb-8 list-disc pl-5">
          <li>One user (IP) can claim each task only one time.</li>
          <li>Daily bonus can be claimed once per day.</li>
          <li>Coupons have limited uses per IP.</li>
          <li>VPN, Proxy, or Incognito mode is strictly prohibited.</li>
          <li>Admin decisions are final and binding.</li>
          <li>Abuse will result in a permanent IP block.</li>
        </ul>
        <button 
          onClick={handleAgree}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition-all active:scale-95 text-lg shadow-lg shadow-yellow-500/20"
        >
          I AGREE & CONTINUE
        </button>
      </div>
    </div>
  );
};

export default RulesModal;
