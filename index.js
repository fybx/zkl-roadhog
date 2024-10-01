import { signIn as _signIn } from './roadhog.js';

const endpoint = "http://localhost:3000";

async function signIn(type) {
  try {
    const result = await _signIn(type);
    if (result.success) {
      console.log('Successfully signed in with', type);
      const b = document.createElement('button');
      b.innerText = 'Click to access protected';
      b.setAttribute('onclick', 'fetchProtected()');
      document.body.appendChild(b);
    } else {
      console.error('Sign-in failed:', result.error);
    }
  } catch (error) {
    console.error('Sign-in error:', error);
  }
}

async function signOff() {

}

window.signIn = signIn;
window.signOff = signOff;

function init() {
  console.log('start');
  if (!window.ethereum) console.log('ethereum not detected');
  if (!window.solana) console.log('solana not detected');
}

window.addEventListener('load', init);
