import { SiweMessage } from 'siwe';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';
import bs58 from 'bs58';

const endpoint = 'http://localhost:3000';

export async function signIn(type) {
  let address, signature, message;

  if (type === 'ethereum') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    address = await signer.getAddress();

    const nonceResponse = await fetch(`${endpoint}/auth/nonce?address=${address}&type=ethereum`);
    const { nonce } = await nonceResponse.json();

    const siweMessage = new SiweMessage({
      domain: window.location.host,
      address: address,
      statement: 'Sign in with Ethereum to zk-Lokomotive.',
      uri: window.location.origin,
      version: '1',
      chainId: 1,
      nonce: nonce
    });

    message = siweMessage.prepareMessage();
    signature = await signer.signMessage(message);
  } else if (type === 'solana') {
    const provider = window.solana;
    await provider.connect();
    address = provider.publicKey.toString();

    const nonceResponse = await fetch(`${endpoint}/auth/nonce?address=${address}&type=solana`);
    const { nonce } = await nonceResponse.json();

    const encodedMessage = new TextEncoder().encode(nonce);
    const signatureBytes = await provider.signMessage(encodedMessage, 'utf8');
    signature = bs58.encode(signatureBytes.signature);
  } else {
    throw new Error('Invalid type');
  }

  try {
    const response = await fetch(`${endpoint}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, message, address, signature }),
    });

    if (!response.ok) {
      throw new Error((await response.json()).error);
    }

    const { auth_token } = await response.json();

    localStorage.setItem('auth_token', auth_token);
    localStorage.setItem('auth_type', type);

    return { success: true, auth_token };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: error.message };
  }
}

export async function signOff() {
  const auth_token = localStorage.getItem('auth_token');
  const response = await fetch(`${endpoint}/auth/signoff`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    }
  });

  if (!response.ok) {
    throw new Error((await response.json()).error);
  } else {
    localStorage.removeItem('auth_token');
    return true;
  }
}
