// jisho.js - Modular Script for Draggable Dictionary Popup

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('jisho-popup');
    const header = document.getElementById('jisho-header');
    
    // 1. TOGGLE ON TAB KEY
    document.addEventListener('keydown', (e) => {
        // Check if the key pressed is Tab
        if (e.key === 'Tab') {
            // If the user is currently typing in an input or textarea, let Tab behave normally
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            
            // Prevent the default Tab behavior (which usually cycles through links)
            e.preventDefault();
            
            // Toggle the display
            if (popup.style.display === 'flex') {
                popup.style.display = 'none';
            } else {
                popup.style.display = 'flex';
            }
        }
    });

    // 2. DRAG LOGIC
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header || e.target.parentNode === header) {
            isDragging = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, popup);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
});
