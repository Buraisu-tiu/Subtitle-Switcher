console.log("✅ YouTube Subtitle Switcher content script loaded.");

function toggleSubtitles() {
    console.log("🔄 Toggling subtitles...");

    let settingsButton = document.querySelector(".ytp-settings-button");
    if (!settingsButton) {
        console.error("❌ ERROR: YouTube settings button not found.");
        return;
    }

    console.log("✅ Found settings button. Clicking...");
    settingsButton.click(); // Open settings menu

    setTimeout(() => {
        let menuItems = document.querySelectorAll(".ytp-menuitem");
        let captionsButton = Array.from(menuItems).find(el => 
            el.innerText.includes("Subtitles") || el.innerText.includes("CC") || el.innerText.includes("Captions")
        );

        if (!captionsButton) {
            console.error("❌ ERROR: Subtitles option not found in settings.");
            settingsButton.click(); // Close settings if not found
            return;
        }

        console.log("✅ Found subtitles menu. Clicking...");
        captionsButton.click(); // Open subtitle options

        setTimeout(() => {
            // Get all subtitle menu items
            let availableSubtitles = document.querySelectorAll(".ytp-menuitem");
            
            // Log all available subtitles
            console.log(`📜 Available subtitles: ${Array.from(availableSubtitles).map(el => el.innerText.trim()).join(", ")}`);
            
            // Find English and Chinese subtitle options
            let englishSub = Array.from(availableSubtitles).find(el => 
                el.innerText.trim().includes("English") && !el.innerText.includes("Auto-translate")
            );
            
            let chineseSub = Array.from(availableSubtitles).find(el => 
                el.innerText.trim().includes("Chinese (Simplified)") && !el.innerText.includes("Auto-translate")
            );

            if (!englishSub && !chineseSub) {
                console.error("❌ ERROR: Neither English nor Chinese subtitles were found.");
                settingsButton.click(); // Close settings
                return;
            }

            // YouTube indicates the selected subtitle in various ways
            // Since there are no checkboxes, look for visual indicators like highlights or tick marks
            let selectedSub = null;
            
            // Try looking for selected class or computed style differences
            for (const item of availableSubtitles) {
                const computedStyle = window.getComputedStyle(item);
                // Check if the item has a different background color or is visually distinct
                const isHighlighted = item.classList.contains("ytp-menuitem-active") || 
                                    item.classList.contains("ytp-menuitem-selected") ||
                                    computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" && 
                                    computedStyle.backgroundColor !== "transparent";
                
                // Check for any SVG icons that might indicate selection
                const hasIcon = item.querySelector("svg") || item.querySelector("path");
                
                if (isHighlighted || hasIcon) {
                    selectedSub = item;
                    console.log(`✅ Detected selected subtitle: ${item.innerText.trim()}`);
                    break;
                }
            }

            // If we can't determine the selected subtitle through UI indicators,
            // we need to use a storage-based approach
            if (!selectedSub) {
                console.log("⚠️ Could not detect selected subtitle through UI, using stored language preference");
                
                // Try to retrieve last selected language from storage
                browser.storage.local.get('lastSubtitleLanguage').then(result => {
                    const lastLanguage = result.lastSubtitleLanguage || 'none';
                    console.log(`📋 Last selected subtitle language: ${lastLanguage}`);
                    
                    // Toggle based on last known state
                    if (lastLanguage === 'English') {
                        if (chineseSub) {
                            console.log("🔄 Switching to Chinese subtitles based on stored preference...");
                            chineseSub.click();
                            browser.storage.local.set({ 'lastSubtitleLanguage': 'Chinese' });
                        }
                    } else if (lastLanguage === 'Chinese') {
                        if (englishSub) {
                            console.log("🔄 Switching to English subtitles based on stored preference...");
                            englishSub.click();
                            browser.storage.local.set({ 'lastSubtitleLanguage': 'English' });
                        }
                    } else {
                        // If no stored preference or first run, default to English
                        if (englishSub) {
                            console.log("🔄 Enabling English subtitles (first run or no preference)...");
                            englishSub.click();
                            browser.storage.local.set({ 'lastSubtitleLanguage': 'English' });
                        } else if (chineseSub) {
                            console.log("🔄 Enabling Chinese subtitles (English not found)...");
                            chineseSub.click();
                            browser.storage.local.set({ 'lastSubtitleLanguage': 'Chinese' });
                        }
                    }
                    
                    // Close the menu after making a selection
                    setTimeout(() => {
                        console.log("✅ Closing settings menu.");
                        settingsButton.click();
                    }, 500);
                }).catch(error => {
                    console.error("❌ ERROR accessing storage:", error);
                    // Default behavior if storage fails
                    if (englishSub) {
                        console.log("🔄 Enabling English subtitles (storage error fallback)...");
                        englishSub.click();
                    }
                    setTimeout(() => settingsButton.click(), 500);
                });
                return; // Exit early since we're handling menu closing in the promise
            }

            console.log(`🔍 Currently selected subtitle: ${selectedSub.innerText.trim()}`);
            
            // Handle the toggle logic based on the detected selection
            if (selectedSub.innerText.includes("Off")) {
                // If subtitles are off, enable English
                if (englishSub) {
                    console.log("🔄 Enabling English subtitles...");
                    englishSub.click();
                    browser.storage.local.set({ 'lastSubtitleLanguage': 'English' });
                } else if (chineseSub) {
                    console.log("🔄 Enabling Chinese subtitles (English not found)...");
                    chineseSub.click();
                    browser.storage.local.set({ 'lastSubtitleLanguage': 'Chinese' });
                }
            }
            // If English is selected, switch to Chinese
            else if (selectedSub.innerText.includes("English")) {
                if (chineseSub) {
                    console.log("🔄 Switching to Chinese subtitles...");
                    chineseSub.click();
                    browser.storage.local.set({ 'lastSubtitleLanguage': 'Chinese' });
                } else {
                    console.warn("⚠️ WARNING: Could not find Chinese subtitles to switch to.");
                }
            }
            // If Chinese is selected, switch to English
            else if (selectedSub.innerText.includes("Chinese")) {
                if (englishSub) {
                    console.log("🔄 Switching to English subtitles...");
                    englishSub.click();
                    browser.storage.local.set({ 'lastSubtitleLanguage': 'English' });
                } else {
                    console.warn("⚠️ WARNING: Could not find English subtitles to switch to.");
                }
            }
            // If another language is selected, switch to English
            else {
                if (englishSub) {
                    console.log("🔄 Switching to English subtitles...");
                    englishSub.click();
                    browser.storage.local.set({ 'lastSubtitleLanguage': 'English' });
                } else if (chineseSub) {
                    console.log("🔄 Switching to Chinese subtitles (English not found)...");
                    chineseSub.click();
                    browser.storage.local.set({ 'lastSubtitleLanguage': 'Chinese' });
                }
            }

            setTimeout(() => {
                console.log("✅ Closing settings menu.");
                settingsButton.click(); // Close settings menu
            }, 500); // Increased timeout for more reliability
        }, 500); // Increased timeout
    }, 500); // Increased timeout
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleSubtitles") {
        console.log("📩 Received toggleSubtitles message.");
        toggleSubtitles();
        sendResponse({ status: "Subtitles switching process started." });
    }
    return true; // Keep the message channel open for the async response
});