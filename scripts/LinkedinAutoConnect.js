const LinkedinAutoConnect = {
  config: {
    scrollDelay: 1500,
    actionDelay: 1500,
    nextPageDelay: 1500,
    // set to -1 for no limit
    maxRequests: -1,
    totalRequestsSent: 0,
    // set to false to skip adding note in invites
    addNote: true,
    // note: "Hey {{name}}, I'm looking forward to connecting with you!",
    note: `Hi {{name}}! 
I'm interested in building a strong community of professionals like yourself who can support and inspire each other. 
I'm a content creator who'd love to bring the latest tech insights to your feed. I hope to connect with you and explore potential collaborations in the future.`,

    // HTML Elements (These can change on Linkedin updates)
    connectionListClass: "zVsFuLIgGhtcgEmbTfjjZQDGLNapiZME",
    nextPageClass: "artdeco-pagination__button--next",
    closeButtonClass: "artdeco-modal__dismiss artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary ember-view",

  },
  init: function (data, config) {
    console.info("INFO: script initialized on the page...");
    console.debug(
      "DEBUG: scrolling to bottom in " + config.scrollDelay + " ms"
    );

    try {
      setTimeout(() => window.LACOBJ.scrollBottom(data, config), config.actionDelay);
    } catch(err) {
      console.log(err);
    }
    
  },
  scrollBottom: function (data, config) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    console.debug("DEBUG: scrolling to top in " + config.scrollDelay + " ms");

    try {
      setTimeout(() => window.LACOBJ.scrollTop(data, config), config.scrollDelay);
    } catch(err) {
      console.log(err);
    }
    
  },
  scrollTop: function (data, config) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.debug(
      "DEBUG: inspecting elements in " + config.scrollDelay + " ms"
    );

    try {
      setTimeout(() => window.LACOBJ.inspect(data, config), config.scrollDelay);
    } catch(err) {
      console.log(err);
    }
    
  },
  inspect: function (data, config) {
    var totalRows = this.totalRows();
    console.debug("DEBUG: total search results found on page are " + totalRows);
    if (totalRows >= 0) {
      this.compile(data, config);
    } else {
      console.warn("WARN: end of search results!");
      this.complete(config);
    }
  },
  compile: function (data, config) {
    var elements = document.querySelectorAll("button");
    data.pageButtons = [...elements].filter(function (element) {
      return ["Connect", "Follow"].includes(element.textContent.trim());
    });
    if (!data.pageButtons || data.pageButtons.length === 0) {
      console.warn("ERROR: no Connect/Follow buttons found on page!");
      console.info("INFO: moving to next page...");

      try {
        setTimeout(() => { window.LACOBJ.nextPage(config); }, config.nextPageDelay);
      } catch(err) {
        console.log(err);
      }
      
    } else {
      data.pageButtonTotal = data.pageButtons.length;
      console.info("INFO: " + data.pageButtonTotal + " Connect/Follow buttons found.");
      data.pageButtonIndex = 0;

      // Get names of connections
      var searchContainer = document.getElementsByClassName("search-results-container")[0];
      var connectionList = searchContainer.querySelectorAll("ul")[0];
      connectionList = connectionList.children;
      if(!connectionList.length) {
        console.log("No potential connections found! Please revisit the connectionNameClass");
        return;
      }
      
      let name_list = []
      for(i = 0; i < connectionList.length; i++) {
        let _inner_text = connectionList[i].innerText.split("\n");
        let _name = _inner_text[0];
        let _status = _inner_text.at(-1);
        
        if(["Connect", "Follow"].includes(_status)) {
            name_list.push(_name);
        }
      }

      console.log(`Potential connections in page: ${name_list}`);
      data.connectNames = name_list;
      console.debug(
        "DEBUG: starting to send invites in " + config.actionDelay + " ms"
      );

      try {
        setTimeout(() => { window.LACOBJ.sendInvites(data, config); }, config.actionDelay);
      } catch(err) {
        console.log(err);
      }

    }
  },
  sendInvites: function (data, config) {
    console.debug("remaining requests " + config.maxRequests);
    if (config.maxRequests == 0) {
      console.info("INFO: max requests reached for the script run!");
      this.complete(config);
    } else {
      console.debug(
        "DEBUG: sending invite to " +
          (data.pageButtonIndex + 1) +
          " out of " +
          data.pageButtonTotal
      );
      var button = data.pageButtons[data.pageButtonIndex];
      button.click();
      if (config.addNote && config.note) {
        console.debug(
          "DEBUG: clicking Add a note in popup, if present, in " +
            config.actionDelay +
            " ms"
        );

        try {
          setTimeout(() => window.LACOBJ.clickAddNote(data, config), config.actionDelay);
        } catch(err) {
          console.log(err);
        }

      } else {
        console.debug(
          "DEBUG: clicking done in popup, if present, in " +
            config.actionDelay +
            " ms"
        );

        try {
          setTimeout(() => window.LACOBJ.clickDone(data, config), config.actionDelay);
        } catch(err) {
          console.log(err);
        }
        
      }
    }
  },
  clickAddNote: function (data, config) {
    var buttons = document.querySelectorAll("button");
    var addNoteButton = Array.prototype.filter.call(buttons, function (el) {
      return el.textContent.trim() === "Add a note";
    });
    // adding note if required
    if (addNoteButton && addNoteButton[0]) {
      console.debug("DEBUG: clicking add a note button to paste note");
      addNoteButton[0].click();
      console.debug("DEBUG: pasting note in " + config.actionDelay);

      try {
        setTimeout(() => window.LACOBJ.pasteNote(data, config), config.actionDelay);
      } catch(err) {
        console.log(err);
      }

    } else {
      console.debug(
        "DEBUG: add note button not found, clicking send on the popup in " +
          config.actionDelay
      );

      try {
        setTimeout(() => window.LACOBJ.clickDone(data, config), config.actionDelay);
      } catch(err) {
        console.log(err);
      }

      
    }
  },
  pasteNote: function (data, config) {
    noteTextBox = document.getElementById("custom-message");
    let connectionName = data.connectNames[data.pageButtonIndex];
    connectionName = connectionName.split(" ")[0];
    noteTextBox.value = config.note.replace(
      "{{name}}",
      connectionName
    );
    noteTextBox.dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    );
    console.debug(
      "DEBUG: clicking send in popup, if present, in " +
        config.actionDelay +
        " ms"
    );

    try {
      setTimeout(() => window.LACOBJ.clickDone(data, config), config.actionDelay);
    } catch(err) {
      console.log(err);
    }

  },
  clickDone: function (data, config) {
    var buttons = document.querySelectorAll("button");
    var doneButton = Array.prototype.filter.call(buttons, function (el) {
      return el.textContent.trim() === "Send";
    });
    // Click the first send button
    if (doneButton && doneButton[0]) {
      console.debug("DEBUG: clicking send button to close popup");
      doneButton[0].click();
    } else {
      console.debug(
        "DEBUG: send button not found, clicking close on the popup in " +
          config.actionDelay
      );
    }

    try {
      setTimeout(() => window.LACOBJ.clickClose(data, config), config.actionDelay);
    } catch(err) {
      console.log(err);
    }
    
  },
  clickClose: function (data, config) {
    var closeButton = document.getElementsByClassName(config.closeButtonClass);
    if (closeButton && closeButton[0]) {
      closeButton[0].click();
    }
    console.info(
      "INFO: invite sent to " +
        (data.pageButtonIndex + 1) +
        " out of " +
        data.pageButtonTotal
    );
    config.maxRequests--;
    config.totalRequestsSent++;


    try {
      chrome.storage.sync.set({totalRequestsSent: config.totalRequestsSent});
    } catch(err) {
      console.log(err);
    }
    

    if (data.pageButtonIndex === data.pageButtonTotal - 1) {
      console.debug(
        "DEBUG: all connections for the page done, going to next page in " +
          config.actionDelay +
          " ms"
      );

      try {
        setTimeout(() => window.LACOBJ.nextPage(config), config.actionDelay);
      } catch(err) {
        console.log(err);
      }

    } else {
      data.pageButtonIndex++;
      console.debug(
        "DEBUG: sending next invite in " + config.actionDelay + " ms"
      );

      try {
        setTimeout(() => window.LACOBJ.sendInvites(data, config), config.actionDelay);
      } catch(err) {
        console.log(err);
      }

    }
  },
  nextPage: function (config) {
    var pagerButton = document.getElementsByClassName(config.nextPageClass);
    if (
      !pagerButton ||
      pagerButton.length === 0 ||
      pagerButton[0].hasAttribute("disabled")
    ) {
      console.info("INFO: no next page button found!");
      return this.complete(config);
    }
    console.info("INFO: Going to next page...");
    pagerButton[0].click();

    try {
      setTimeout(() => window.LACOBJ.init({}, config), config.nextPageDelay);
    } catch(err) {
      console.log(err);
    }

  },
  complete: function (config) {
    console.info(
      "INFO: script completed after sending " +
        config.totalRequestsSent +
        " connection requests"
    );
  },
  totalRows: function () {
    var search_results = document.getElementsByClassName("search-result");
    if (search_results && search_results.length != 0) {
      return search_results.length;
    } else {
      return 0;
    }
  },
};


function deepCloneLAC(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const clonedObj = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      // Clone the function reference
      clonedObj[key] = obj[key]; 
    } else {
      clonedObj[key] = deepCloneLAC(obj[key]);
    }
  }

  return clonedObj;
}

window.addEventListener("lac-add-connections", (event) => {
  console.log("LAC: Add connections script running...");
  
  if(window.LACOBJ) {
    console.log("Worker already running. Please wait for it to finish!");
    return;
  }
  window.LACOBJ = deepCloneLAC(LinkedinAutoConnect);
  const { sendInviteNote, inviteNote, maxRequestLimit } = event?.detail || {};

  window.LACOBJ.config.addNote = sendInviteNote;
  window.LACOBJ.config.note = inviteNote;
  window.LACOBJ.config.maxRequests = maxRequestLimit;

  // console.log(window.LACOBJ.config);
  window.LACOBJ.init({}, window.LACOBJ.config);
});

window.addEventListener("lac-pause-connections", (event) => { 
  if(window.LACOBJ) {
    window.LACOBJ = null;
  } else {
    console.log("No worker running!");
  }
});

