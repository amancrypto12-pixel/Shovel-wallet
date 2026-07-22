import { TonConnectUI, toUserFriendlyAddress } from '@tonconnect/ui';
import { store } from './state.js';

let tonConnectUIInstance = null;

export function initTonConnect() {
  if (tonConnectUIInstance) return tonConnectUIInstance;

  try {
    const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
    
    tonConnectUIInstance = new TonConnectUI({
      manifestUrl: manifestUrl,
    });

    // Listen to wallet status changes from TonConnect SDK
    tonConnectUIInstance.onStatusChange((wallet) => {
      if (wallet) {
        let userFriendlyAddr = wallet.account.address;
        try {
          userFriendlyAddr = toUserFriendlyAddress(wallet.account.address);
        } catch (e) {
          // fallback to raw address if conversion fails
        }
        const appName = wallet.device?.appName || wallet.name || 'TON Wallet';
        store.connectTonWallet(appName, userFriendlyAddr);
      } else {
        store.disconnectTonWallet();
      }
    });
  } catch (err) {
    console.warn('TonConnect initialization notice:', err);
  }

  return tonConnectUIInstance;
}

export async function openRealTonConnectModal() {
  const tc = initTonConnect();
  if (tc) {
    try {
      await tc.openModal();
    } catch (err) {
      console.error('Error opening TonConnect modal:', err);
    }
  }
}

export async function disconnectRealTonWallet() {
  if (tonConnectUIInstance && tonConnectUIInstance.connected) {
    try {
      await tonConnectUIInstance.disconnect();
    } catch (err) {
      console.warn('Disconnect error:', err);
    }
  }
  store.disconnectTonWallet();
}
