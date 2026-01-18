
import React, { useEffect, useState } from 'react';

const IncognitoGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isIncognito, setIsIncognito] = useState<boolean | null>(null);

  useEffect(() => {
    const detectIncognito = async () => {
      let isPrivate = false;
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const { quota } = await navigator.storage.estimate();
          if (quota && quota < 120000000) isPrivate = true;
        } else {
          // Fallback for older browsers
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('test');
            request.onerror = () => resolve(true);
            request.onsuccess = () => resolve(false);
          });
          isPrivate = !!db;
        }
      } catch (e) {
        isPrivate = true;
      }
      setIsIncognito(isPrivate);
    };

    detectIncognito();
  }, []);

  if (isIncognito === true) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <div className="max-w-md space-y-4">
          <i className="fas fa-user-secret text-6xl text-red-500 mb-4"></i>
          <h1 className="text-3xl font-bold">Incognito Mode Detected</h1>
          <p className="text-gray-400">Please disable incognito mode to use this app. We use basic identifiers to track rewards and prevent abuse.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default IncognitoGuard;
