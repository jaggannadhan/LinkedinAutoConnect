const addConnectionsBtn = document.getElementById("add-connections");
const pauseConnectionsBtn = document.getElementById("pause-connections");
const totalRequestsSentElm = document.getElementById("total-connection-requests");
const noteInputTextElm = document.getElementById("note-input");

console.log("Popup running...");
chrome.storage.sync.get('buttonState', function(data) {   
    // this is called after the retrieve.
    console.log("Fetching initial state...")
    let buttonState = data['buttonState'];
    console.log("buttonState: ", buttonState);

    if(buttonState && buttonState == "pause") {
        addConnectionsBtn.style.display = "none";
        pauseConnectionsBtn.style.display = "block";
    } else {
        addConnectionsBtn.style.display = "block";
        pauseConnectionsBtn.style.display = "none";
    }
});

chrome.storage.sync.get('totalRequestsSent', function(data) {   
    // this is called after the retrieve.
    console.log("Fetching total requests sent...")
    let totalRequestsSent = data['totalRequestsSent'];
    console.log("totalRequestsSent: ", totalRequestsSent);

    totalRequestsSentElm.innerText = totalRequestsSent || 0;
});

chrome.storage.sync.get('inviteNote', function(data) {   
    // this is called after the retrieve.
    console.log("Fetching invite note...")
    let inviteNote = data['inviteNote'];
    console.log("inviteNote: ", inviteNote);

    noteInputTextElm.value = inviteNote || "";
});


addConnectionsBtn.addEventListener("click", () => {
    try {
        console.log("Add connections clicked!");

        const noteCheckbox = document.getElementById("note-checkbox");
        const noteInput = document.getElementById("note-input");
        const maxRequestLimitElm = document.getElementById("max-connection-requests");


        if(noteInput.value) {
            updateUserInvite({inviteNote: noteInput.value});
        }

        if(maxRequestLimitElm.value < 1 || maxRequestLimitElm.value > 100) {
            maxRequestLimitElm.value = 50;
        }

        let sendInviteNote = noteCheckbox.checked;
        let inviteNote = sendInviteNote ? "Hi {{name}}! " + noteInput.value : null;
        let maxRequestLimit = maxRequestLimitElm.value;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log("Current tab: ", tabs[0]);
            let url = tabs?.[0]?.url || "";

            if(!url.includes("https://www.linkedin.com/search/results/people/")) {
                showNotification("Works only on Linkedin Search People page!");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (sendInviteNote, inviteNote, maxRequestLimit) => {
                    // console.log("args in exe script: ", inviteNote);

                    window.dispatchEvent(new CustomEvent("lac-add-connections", {
                        detail: {
                            inviteNote: inviteNote,
                            sendInviteNote: sendInviteNote,
                            maxRequestLimit: maxRequestLimit
                        }
                    }));
                },
                args: [sendInviteNote, inviteNote, maxRequestLimit]
            });

            updateConnectionsState({buttonState: "pause"});
            addConnectionsBtn.style.display = "none";
            pauseConnectionsBtn.style.display = "block";
        });

        
    } catch(err) {
        console.error("LAC Error: ", err);
        addConnectionsBtn.style.display = "block";
        pauseConnectionsBtn.style.display = "none";
    }
});


pauseConnectionsBtn.addEventListener("click", () => {
    try {
        console.log("Pause connections clicked!");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log("Current tab: ", tabs[0]);
            let url = tabs?.[0]?.url || "";

            if(!url.includes("https://www.linkedin.com/search/results/people/")) {
                showNotification("Works only on Linkedin Search People page!");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    window.dispatchEvent(new CustomEvent("lac-pause-connections"));
                },
            });

            updateConnectionsState({buttonState: "start"});
            addConnectionsBtn.style.display = "block";
            pauseConnectionsBtn.style.display = "none";

        });
        
    } catch(err) {
        console.error("LAC Error: ", err);

        addConnectionsBtn.style.display = "none";
        pauseConnectionsBtn.style.display = "block";
    }
});

function showNotification(message) {
    let bannerElm = document.getElementById("banner");
    bannerElm.innerText = message;
    bannerElm.style.display = "flex";

    setTimeout(() => {
        let bannerElm = document.getElementById("banner");
        bannerElm.style.display = "none";
    }, 1500);
}

function updateConnectionsState({buttonState = "pause"}) {
    chrome.storage.sync.set({buttonState}, () => {
        let message = buttonState == "pause" ? "Running Connections..." : "Connections Paused!"
        showNotification(message);
    });
}

function updateUserInvite({inviteNote = ""}) {
    chrome.storage.sync.set({inviteNote});
}

function getConnectionState() {
    let buttonState = null;
    chrome.storage.sync.get('buttonState', function(data) {   
        // this is called after the retrieve.
        buttonState = data['buttonState'];
    });
    console.log("buttonState: ", buttonState);
    return buttonState;
}

window.addEventListener("inc-connections", (event) => { 
    const { totalRequestsSent } = event?.detail || {};
    
    chrome.storage.sync.set({totalRequestsSent}, () => {
        totalRequestsSentElm.innerText = totalRequestsSent || 0;
    });
});
