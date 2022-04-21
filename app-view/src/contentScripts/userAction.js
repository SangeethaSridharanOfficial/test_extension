/*global chrome*/

const getName = (tabId) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "getRecordingName", id: tabId}, function (name) {
      if (!name) {
        return resolve('');
      } else {
        return resolve(name);
      }
    });
  })
}

export function getRecordingName(){
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        let name = await getName(tabs[0].id);
        return resolve(name);
      });
    } catch (err) {
      console.error('Error in getRecordingName ', err);
      return reject(err);
    }
  })
}

export async function start(name) {
  let isSuccess = true;

  let startTime = new Date().getTime();
  await chrome.tabs.getSelected(null, function (tab) {
    const { url } = tab;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({
        type: "startRecording", data: {
          id: tabs[0].id,
          name, startTime, url,
          startRec: true
        }
      });
    });
  })
  
  return isSuccess;
}

const getRecordings = () => {
  return new Promise((resolve, reject) => {
    try{
      const endTime = new Date().getTime();
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.runtime.sendMessage({
          type: "stopRecording", 
          data: {
            id: tabs[0].id,
            name: '', endTime,
            startRec: false
          }
        }, (resp) => {
          resolve(resp);
        });
      });
    }catch(err){
      reject(err);
    }
  })
}

export async function stopAndSave() {
  return await getRecordings();
}
