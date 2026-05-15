/**
 * Authorize.Net IFrame Communicator
 * 
 * This file is part of the communicator.html page.
 * It facilitates secure cross-domain communication between the 
 * Authorize.Net hosted payment form (iframe) and this website.
 * 
 * Logic is moved here to an external file to comply with strict 
 * Content Security Policy (CSP) and avoid inline script errors.
 */

(function () {
    'use strict';

    /**
     * Forwards messages to the parent window levels.
     * @param {string} str - The message string (usually query-string format)
     */
    function forwardMessage(str) {
        if (!str || str.length === 0) return;

        // Authorize.Net's hosted form is often nested inside multiple iframes.
        // We broadcast to all possible parent levels to ensure the main application 
        // receives the signal.
        const targets = [window.parent, window.top];
        
        // Add window.opener in case the form was opened in a popup
        if (window.opener) {
            targets.push(window.opener);
        }

        targets.forEach(function (target) {
            if (target && typeof target.postMessage === 'function') {
                try {
                    // Send message with wildcard target origin.
                    // Security is handled by the RECEIVER (AuthorizeNetIframe.jsx) 
                    // validating the sender origin.
                    target.postMessage(str, '*');
                } catch (err) {
                    // Ignore errors for cross-origin targets we don't have access to
                }
            }
        });
    }

    /**
     * Listener for postMessage events from the hosted form.
     */
    function onMessageReceived(event) {
        if (event && event.data) {
            forwardMessage(event.data);
        }
    }

    // Register event listeners
    if (window.addEventListener) {
        window.addEventListener('message', onMessageReceived, false);
    } else if (window.attachEvent) {
        window.attachEvent('onmessage', onMessageReceived);
    }

    // Check for message in URL hash (legacy method used by some Authorize.Net versions)
    if (window.location.hash && window.location.hash.length > 1) {
        // Strip the # character and forward
        forwardMessage(window.location.hash.substring(1));
    }
}());
