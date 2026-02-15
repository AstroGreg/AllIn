import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { setNetworkLogCallback, type NetworkLog } from '../services/networkLogger';

const MAX_LOGS = 50;

interface NetworkLoggerContextType {
  logs: NetworkLog[];
  visible: boolean;
  toggleVisible: () => void;
  clearLogs: () => void;
}

const NetworkLoggerContext = createContext<NetworkLoggerContextType | undefined>(undefined);

interface NetworkLoggerProviderProps {
  children: ReactNode;
}

export const NetworkLoggerProvider: React.FC<NetworkLoggerProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [visible, setVisible] = useState(false);

  const addLog = useCallback((log: NetworkLog) => {
    setLogs(prev => {
      const next = [log, ...prev];
      return next.length > MAX_LOGS ? next.slice(0, MAX_LOGS) : next;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleVisible = useCallback(() => {
    setVisible(v => !v);
  }, []);

  useEffect(() => {
    setNetworkLogCallback(addLog);
    return () => setNetworkLogCallback(null);
  }, [addLog]);

  const value: NetworkLoggerContextType = {
    logs,
    visible,
    toggleVisible,
    clearLogs,
  };

  return (
    <NetworkLoggerContext.Provider value={value}>
      {children}
    </NetworkLoggerContext.Provider>
  );
};

export const useNetworkLogger = (): NetworkLoggerContextType => {
  const context = useContext(NetworkLoggerContext);
  if (context === undefined) {
    throw new Error('useNetworkLogger must be used within a NetworkLoggerProvider');
  }
  return context;
};

export default NetworkLoggerContext;
