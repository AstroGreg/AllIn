export interface NetworkLog {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  path: string;
  status: number | null;
  duration: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
}

type LogCallback = ((log: NetworkLog) => void) | null;

let _callback: LogCallback = null;

export function setNetworkLogCallback(cb: LogCallback): void {
  _callback = cb;
}

let _idCounter = 0;

export function logNetworkRequest(entry: {
  method: string;
  url: string;
  path: string;
  status: number | null;
  duration: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
}): void {
  if (!_callback) return;

  const log: NetworkLog = {
    id: String(++_idCounter),
    timestamp: Date.now(),
    ...entry,
  };

  _callback(log);
}
