browser.commands.onCommand.addListener((command) => {
    console.log("Hotkey Pressed:", command);
    if (command === "toggle-subtitles") {
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs.length > 0) {
                console.log("Sending message to content script");
                browser.tabs.sendMessage(tabs[0].id, { action: "toggleSubtitles" }).then((response) => {
                    console.log("Response from content script:", response);
                }).catch((error) => {
                    console.error("Error sending message:", error);
                });
            }
        });
    }
});
