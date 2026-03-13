type ClipboardModule = {
  setString?: (value: string) => void;
};

function loadClipboardModule(): ClipboardModule | null {
  try {
    const clipboard = require('@react-native-clipboard/clipboard');
    return clipboard?.default ?? clipboard;
  } catch {
    return null;
  }
}

export function setClipboardString(value: string): boolean {
  const clipboard = loadClipboardModule();
  if (!clipboard || typeof clipboard.setString !== 'function') {
    return false;
  }

  try {
    clipboard.setString(value);
    return true;
  } catch {
    return false;
  }
}
