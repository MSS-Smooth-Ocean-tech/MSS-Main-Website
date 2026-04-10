import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "/static/js/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Load user profile
onAuthStateChanged(auth, function (user) {
    if (user) {
        if (user.photoURL) {
            const avatar = document.getElementById("navAvatar");
            if (avatar) avatar.src = user.photoURL;
        }
        const nameEl = document.getElementById("navName");
        const emailEl = document.getElementById("navEmail");
        
        if(nameEl) nameEl.textContent = user.displayName || "Admin";
        if(emailEl) emailEl.textContent = user.email || "";
        
        window.loadAdminUsers();
    } else {
        window.location.href = "/login";
    }
});

let globalUsersData = {};

window.loadAdminUsers = async function() {
    try {
        const response = await fetch("/admin/users?t=" + Date.now());
        const data = await response.json();
        globalUsersData = data;

        const providersGrid = document.getElementById("providersGrid");
        if (!providersGrid) return;

        let isGoogleUser = false;
        if (auth.currentUser && auth.currentUser.providerData) {
            isGoogleUser = auth.currentUser.providerData.some(p => p.providerId === 'google.com');
        }

        const usersSection = document.getElementById("users-section");
        
        let providers = ["microsoft.com"];
        if (isGoogleUser) {
            providers = ["google.com", "microsoft.com"];
            providersGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
            providersGrid.style.justifyContent = "normal";
            if (usersSection) {
                usersSection.style.maxWidth = "none";
                usersSection.style.margin = "0";
            }
        } else {
            providersGrid.style.gridTemplateColumns = "1fr";
            providersGrid.style.justifyContent = "normal";
            if (usersSection) {
                usersSection.style.maxWidth = "700px";
                usersSection.style.margin = "0 auto";
            }
        }

        const providerNames = {
            "google.com": "Google",
            "microsoft.com": "Microsoft",
        };

        providersGrid.innerHTML = providers.map((provider) => {
            const users = data[provider] || [];

            return `
                <div class="provider-card fade-in">
                    <div class="provider-header">
                        ${providerNames[provider]}
                    </div>
                    <div class="user-list" id="${provider}-users">
                    ${users.map((user) => `
                        <div class="user-chip">
                            <div class="user-info-chip">
                                <span class="user-email">${user.email}</span>
                                ${user.admin ? '<span class="admin-badge">Admin</span>' : ''}
                            </div>
                            <button class="config-btn" onclick="openConfigModal('${provider}', '${user.email}')" title="Configure User">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                            </button>
                            <button class="remove-btn" onclick="removeUser('${provider}', '${user.email}')">×</button>
                        </div>
                    `).join("")}
                    </div>
                    <div class="add-user-form">
                        <input type="text" class="add-user-input" placeholder="Add ${providerNames[provider]} Email" id="${provider}-input">
                        <button class="add-btn" id="${provider}-add-btn" onclick="addUser('${provider}')">+</button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading admin users:", error);
        const el = document.getElementById("providersGrid");
        if(el) el.innerHTML = "<div>Error loading users</div>";
    }
};

window.addUser = async function(provider) {
    const input = document.getElementById(`${provider}-input`);
    const btn = document.getElementById(`${provider}-add-btn`);
    const email = input.value.trim();

    if (!email) return;

    try {
        btn.disabled = true;
        btn.textContent = "...";

        const response = await fetch("/admin/users/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider, email, admin: false }),
        });

        if (response.ok) {
            input.value = "";
            await window.loadAdminUsers();
        } else {
            const err = await response.json();
            alert("Failed to add user: " + (err.detail || "Unknown error"));
        }
    } catch (error) {
        console.error("Error adding user:", error);
        alert("Error adding user");
    } finally {
        btn.disabled = false;
        btn.textContent = "+";
    }
};

window.removeUser = async function(provider, email) {
    if (!confirm(`Remove ${email}?`)) return;

    try {
        const response = await fetch("/admin/users/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider, email }),
        });

        if (response.ok) {
            window.loadAdminUsers();
        } else {
            alert("Failed to remove user");
        }
    } catch (error) {
        console.error("Error removing user:", error);
        alert("Error removing user");
    }
};

// --- Modal Configuration Logic ---
let currentConfig = {
    provider: null,
    email: null,
    admin: false
};

window.openConfigModal = function(provider, email) {
    const users = globalUsersData[provider] || [];
    const user = users.find(u => u.email === email);
    if (!user) return;

    currentConfig = {
        provider: provider,
        email: email,
        admin: user.admin || false
    };

    const adminToggle = document.getElementById("modalAdminToggle");
    const modalTitle = document.getElementById("configModalTitle");
    const modalEmail = document.getElementById("configModalEmail");

    const providerNames = {
        "google.com": "Google",
        "microsoft.com": "Microsoft"
    };

    modalTitle.textContent = `Configuration - ${providerNames[provider]}`;
    modalEmail.textContent = email;
    adminToggle.checked = currentConfig.admin;

    adminToggle.onchange = function() {
        currentConfig.admin = this.checked;
    };

    document.getElementById("configModal").classList.remove("hidden");
};

window.closeConfigModal = function() {
    document.getElementById("configModal").classList.add("hidden");
};

window.saveUserConfig = async function() {
    const btn = document.querySelector(".save-btn");
    const originalText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
        const payload = {
            provider: currentConfig.provider,
            email: currentConfig.email,
            admin: currentConfig.admin
        };

        const response = await fetch("/admin/users/config/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            await window.loadAdminUsers();
            window.closeConfigModal();
        } else {
            const err = await response.json();
            alert("Failed to update config: " + (err.detail || "Unknown"));
        }
    } catch (error) {
        console.error("Save config error:", error);
        alert("Error saving configuration");
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // window.loadAdminUsers(); is handled in onAuthStateChanged
});
