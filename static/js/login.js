import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "/static/js/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const errorParam = urlParams.get('error');
if (errorParam) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.innerText = "Session Error: " + errorParam;
        errorDiv.classList.remove('hidden');
    }
}

async function handleAuthResult(user) {
    try {
        const idToken = await user.getIdToken();
        
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: idToken }),
        });

        if (response.ok) {
            window.location.href = '/admin';
        } else {
            const errorText = await response.text();
            if (response.status === 403 || response.status === 401) {
                 window.location.href = '/login?error=Unauthorized';
            } else {
                const el = document.getElementById('error-message');
                if (el) {
                    el.innerText = "Login failed: " + errorText;
                    el.classList.remove('hidden');
                }
            }
        }
    } catch (error) {
        console.error("Error in handleAuthResult:", error);
        const el = document.getElementById('error-message');
        if (el) {
            el.innerText = error.message;
            el.classList.remove('hidden');
        }
    }
}

async function handleLogin(provider) {
    try {
        const result = await signInWithPopup(auth, provider);
        await handleAuthResult(result.user);
    } catch (error) {
        console.error(error);
        const el = document.getElementById('error-message');
        if (el) {
            el.innerText = error.message;
            el.classList.remove('hidden');
        }
    }
}

const googleBtn = document.getElementById('google-login');
if (googleBtn) {
    googleBtn.addEventListener('click', () => handleLogin(new GoogleAuthProvider()));
}

const microsoftBtn = document.getElementById('microsoft-login');
if (microsoftBtn) {
    microsoftBtn.addEventListener('click', () => {
        const provider = new OAuthProvider('microsoft.com');
        
        const tenantId = microsoftBtn.getAttribute('data-tenant-id');
        if (tenantId) {
            provider.setCustomParameters({
                tenant: tenantId
            });
        }
        
        handleLogin(provider);
    });
}
