// clipboard.js - Modular Script for Focus Mode Auto-Paste

// Initialize the display on load
document.addEventListener('DOMContentLoaded', () => {
    updateClipStats();
});

function updateClipStats() {
    const displayArea = document.getElementById('clipboard-area');
    const statElement = document.getElementById('clip-char-count');
    
    if (displayArea && statElement) {
        // Count ONLY the characters currently in the box
        const currentChars = displayArea.textContent.length;
        
        // Update the display
        statElement.textContent = currentChars.toLocaleString();
        
        // Save the current amount to local storage
        localStorage.setItem('studyBuddyClipCount', currentChars.toString());
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
        
        const displayArea = document.getElementById('clipboard-area');
        const currentText = displayArea.textContent.trim();
        
        // Prepend the new text to whatever is already there.
        // We use textContent instead of value since it's no longer an input field.
        if (currentText === "") {
            displayArea.textContent = text;
        } else {
            displayArea.textContent = text + '\n\n---\n\n' + currentText;
        }
        
        // Recalculate and update the stats directly from the new content
        updateClipStats();

    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert("Unable to paste! Ensure your browser has granted Clipboard permissions, and that you are running this on a secure connection (HTTPS/localhost).");
    }
}

// Escapes the focus mode by artificially clicking the Home tab
function exitClipboardMode() {
    const homeBtn = document.querySelector('[data-tab="home"]');
    if (homeBtn) homeBtn.click();
}
