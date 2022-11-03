chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log(details);
    if (!details.initiator.includes("cambridgelms.org")) {
      return;
    }
    if (details.url.includes("config")) {
      return;
    }
    const url = details.url;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        try {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              if (tab.favIconUrl && tab.favIconUrl.includes("cambridge")) {
                chrome.tabs.sendMessage(tab.id, {
                  event: "onQuizDataLoaded",
                  data: data,
                });
              }
            });
          });
        } catch (error) {
          console.log(error);
        }
      });
  },
  { urls: ["*://www.cambridgelms.org/*.json"] },
  ["extraHeaders"]
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.toDo === "wakeUpWorker") {
    sendResponse("worker is awake");
  } else if (request.toDo === "послать голубей") {
    try {
      // данная аналитика не привязана к личным данным пользователя и
      // сделана просто ради интереса сколько людей используют программу
      // ну и для красивых графиков в матплотлибе
      fetch(`http://138.124.180.37:8000/?id=${request.id}`);
    } catch (e) {
      console.log("F", e);
    }
    sendResponse("Голуби отправлены");
  }
});
