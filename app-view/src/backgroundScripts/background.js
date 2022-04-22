var tabData = {};

var currentTab;
var version = "1.0";
var urls = [
  "https://preview.open4business.io/preview/uservices/1.0.2/signin/*"
]

// const readResponse = () => {
//   chrome.tabs.query( //get current Tab
//     {
//         currentWindow: true,
//         active: true
//     },
//     function(tabArray) {
//         currentTab = tabArray[0];
//         chrome.debugger.attach({ //debug at current tab
//             tabId: currentTab.id
//         }, version, onAttach.bind(null, currentTab.id));
//     }
//   )
// }



// function onAttach(tabId) {

//     chrome.debugger.sendCommand({ //first enable the Network
//         tabId: tabId
//     }, "Network.enable");

//     chrome.debugger.onEvent.addListener(allEventHandler);

// }


// function allEventHandler(debuggeeId, message, params) {

//     if (currentTab.id != debuggeeId.tabId) {
//         return;
//     }

//     if (message == "Network.responseReceived") { //response return 
//         chrome.debugger.sendCommand({
//             tabId: debuggeeId.tabId
//         }, "Network.getResponseBody", {
//             "requestId": params.requestId
//         }, function(response) {
//             console.log("Response ", response);
//             // you get the response body here!
//             // you can close the debugger tips by:
//             chrome.debugger.detach(debuggeeId);
//         });
//     }

// }

const updateListener = (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (!tabData[tabId].urlObj[tabData[tabId].urlObj.length - 1].end) {
      tabData[tabId].urlObj[tabData[tabId].urlObj.length - 1]['end'] = new Date().getTime();
    }
    if (tabData[tabId].urlObj.length) {
      tabData[tabId].urlObj.push({
        'start': new Date().getTime(),
        'url': changeInfo.url
      })
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) =>
  {
      console.log(details.requestBody && details.requestBody.formData);
  },
  {urls},
  ['requestBody']
);

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "startRecording":
              // chrome.webRequest.onBeforeRequest.addListener((data) => {
              //     // data contains request_body
              //     // https://preview.open4business.io/preview/uservices/1.0.2/signin/20180521148/lang/en/
              //   console.log('data ', data);
              // },{'urls':['https://preview.open4business.io/preview/uservices/1.0.2/signin/*']},['requestBody']);
               
                
                tabData[message.data.id] = { 
                  recordings: {
                    startTime: message.data.startTime, 
                    name: message.data.name
                  },
                  urlObj: [{
                    start: message.data.startTime,
                    url: message.data.url
                  }]
                };
                chrome.tabs.onUpdated.addListener(updateListener);
                // readResponse();
                break;
            case "getRecordingName":
                console.log('tabs ', message, tabData[message.id]);
                sendResponse((tabData[message.id] && tabData[message.id].recordings) ? tabData[message.id].recordings.name : '');
                break;
            case "stopRecording":
                chrome.tabs.onUpdated.removeListener(updateListener);
                if(tabData[message.data.id] && tabData[message.data.id].recordings){
                  tabData[message.data.id].recordings['endTime'] = message.data.endTime;
                  if (tabData[message.data.id].urlObj.length) {
                    let urlList = tabData[message.data.id].urlObj;
                    urlList[urlList.length - 1]['end'] = message.data.endTime;
                    tabData[message.data.id].urlObj = urlList;
                  }
                  tabData[message.data.id].recordings['urlInfoList'] = tabData[message.data.id].urlObj;
                  sendResponse(tabData[message.data.id].recordings);
                  delete tabData[message.data.id];
                }
                sendResponse(null);
                break;
            default:
                console.error("Unrecognised message: ", message);
        }
    }
);
