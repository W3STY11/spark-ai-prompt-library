// ==UserScript==
// @name         M365 Chat Floating Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Clean movable circular floating button for Microsoft 365 Chat
// @author       You
// @match        https://m365.cloud.microsoft/chat/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Create floating button
    const floatingButton = document.createElement('div');
    floatingButton.id = 'm365-floating-button';

    // Style the button
    floatingButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: move;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        font-weight: bold;
        transition: all 0.3s ease;
        user-select: none;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;

    // Add icon/text to button
    floatingButton.innerHTML = '⚡';

    // Hover effect
    floatingButton.addEventListener('mouseenter', () => {
        floatingButton.style.transform = 'scale(1.1)';
        floatingButton.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    floatingButton.addEventListener('mouseleave', () => {
        floatingButton.style.transform = 'scale(1)';
        floatingButton.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)';
    });

    // Make it draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    floatingButton.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === floatingButton) {
            isDragging = true;
            floatingButton.style.cursor = 'grabbing';
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, floatingButton);
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            floatingButton.style.cursor = 'move';
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Click action (customize this to do whatever you want)
    floatingButton.addEventListener('click', (e) => {
        if (!isDragging) {
            // Add your button action here
            console.log('Floating button clicked!');

            // Example: Open SPARK Prompt Library in new tab
            // window.open('http://localhost:3000', '_blank');

            // Example: Show alert
            alert('SPARK Floating Button Clicked!');
        }
    });

    // Add button to page
    document.body.appendChild(floatingButton);

    console.log('M365 Chat Floating Button loaded successfully!');
})();
