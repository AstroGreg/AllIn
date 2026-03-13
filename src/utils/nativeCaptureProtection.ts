type CaptureProtectionOptions = {
  screenshot: boolean;
  record: boolean;
  appSwitcher: boolean;
};

type CaptureProtectionModule = {
  prevent?: (options: CaptureProtectionOptions) => Promise<unknown>;
  allow?: () => Promise<unknown>;
};

function loadCaptureProtectionModule(): CaptureProtectionModule | null {
  try {
    const captureProtection = require('react-native-capture-protection');
    return captureProtection?.CaptureProtection ?? captureProtection?.default ?? captureProtection;
  } catch {
    return null;
  }
}

export function preventMediaCapture(options: CaptureProtectionOptions): Promise<unknown> {
  const captureProtection = loadCaptureProtectionModule();
  if (!captureProtection || typeof captureProtection.prevent !== 'function') {
    return Promise.resolve();
  }

  try {
    return Promise.resolve(captureProtection.prevent(options));
  } catch {
    return Promise.resolve();
  }
}

export function allowMediaCapture(): Promise<unknown> {
  const captureProtection = loadCaptureProtectionModule();
  if (!captureProtection || typeof captureProtection.allow !== 'function') {
    return Promise.resolve();
  }

  try {
    return Promise.resolve(captureProtection.allow());
  } catch {
    return Promise.resolve();
  }
}
