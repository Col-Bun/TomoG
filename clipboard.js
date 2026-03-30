// clipboard.js - Modular Script for Focus Mode Auto-Paste

// Load total character count from LocalStorage
let totalPastedChars = parseInt(localStorage.getItem('studyBuddyClipCount') || '0');

// Initialize the display on load
document.addEventListener('DOMContentLoaded', () => {
    updateClipStats();
});

function updateClipStats() {
    const statElement = document.getElementById('clip-char-count');
    if(statElement) {
        statElement.textContent = totalPastedChars.toLocaleString();
    }
}

async function autoPaste() {
    try {
        // Request text from the system clipboard
        const text = await navigator.clipboard.readText();
        
        if (!text) {
            alert("Clipboard is empty or contains no text!");
            return;
        }
        
        const textArea = document.getElementById('clipboard-area');
        
        // Prepend the new text to whatever is already there, separated by a line
        if(textArea.value.trim() === "") {
            textArea.value = text;
        } else {
            textArea.value = text + '\n\n---\n\n' + textArea.value;
        }
        
        // Update math and storage
        totalPastedChars += text.length;
        localStorage.setItem('studyBuddyClipCount', totalPastedChars);
        updateClipStats();

    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert("Unable to paste! Ensure your browser has granted Clipboard permissions, and that you are running this on a secure connection (HTTPS/localhost or GitHub Pages).");
    }
}

// Escapes the focus mode by artificially clicking the Home tab
function exitClipboardMode() {
    const homeBtn = document.querySelector('[data-tab="home"]');
    if(homeBtn) homeBtn.click();
}
