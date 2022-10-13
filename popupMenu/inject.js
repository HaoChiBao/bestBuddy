let onButton = document.getElementById("onButton")
let offButton = document.getElementById("offButton")
let pauseButton = document.getElementById("doPause")
let debugButton = document.getElementById("doDebug")

let maxFrame = document.getElementById("120frame")
let medFrame = document.getElementById("60frame")
let minFrame = document.getElementById("30frame")

//get buttons on the chrome extesnion popup

//whenever the user enters a name into the popup
const createName = document.getElementById('addName')
createName.addEventListener('input', ()=>{
//dynamically change the title of the mochi preview
document.getElementById('viewMochiName').innerHTML = createName.value
})

const addColour = document.getElementById('addColour')

const makeMochi = document.querySelector('.makeMochi')

makeMochi.addEventListener('mouseup', async ()=>{ //whenever the user crates the mochi reset the local storage
chrome.storage.local.set({mochiName: null}, function() {
})
chrome.storage.local.set({mochiColour: null}, function() {
})
})
onButton.addEventListener('mousedown', async () => {
  let name = createName.value //take the name of the mochi
  let colour = addColour.value ///take the color of the mochi
  chrome.storage.local.set({mochiName: name}, function() { //write into chrome storage/local storage the data from the user
      console.log(name);
  })
  chrome.storage.local.set({mochiColour: colour}, function() {
    console.log(colour);
  })

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true}); //select active tab user is on

    chrome.scripting.executeScript({ //inject and run appOn.js file into active tab
        files: ['./app/appOn.js'],
        target: {tabId: tab.id}
    })
})

offButton.addEventListener('click', async () => { //get active tab user is on
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({ //inject and run appOn.js file into active tab
        files: ['./app/appOff.js'],
        target: {tabId: tab.id}
    })
})

pauseButton.addEventListener('click', async () => {  //select active tab user is on

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({ //inject and run appOn.js file into active tab
        files: ['./app/appPause.js'],
        target: {tabId: tab.id}
    })
})

debugButton.addEventListener('click', async () => {  //select active tab user is on

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
 
    chrome.scripting.executeScript({ //inject and run appOn.js file into active tab
        files: ['./app/appDebug.js'],
        target: {tabId: tab.id}
    })
})

maxFrame.addEventListener('click', async () => { 

  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  chrome.scripting.executeScript({
      files: ['./app/maxFrame.js'],
      target: {tabId: tab.id}
  })
})

medFrame.addEventListener('click', async () => { 

  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  chrome.scripting.executeScript({
      files: ['./app/medFrame.js'],
      target: {tabId: tab.id}
  })
})

minFrame.addEventListener('click', async () => { 

  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  chrome.scripting.executeScript({
      files: ['./app/minFrame.js'],
      target: {tabId: tab.id}
  })
})

  function getAllTabStates(){ //get all tabs of the popup
    return {
      tab1: document.getElementById('tab1'), //home tab
      tab2: document.getElementById('tab2'), //extra tab
      tab3: document.getElementById('tab3'), //account tab
    }
  }
  
  function closeOtherTabs(){ //grab all popup tabs
    const tabs = getAllTabStates()
    const keys = Object.keys(tabs)
    for(let i = 0; i < keys.length; i++){ //make each tab display:none (makes it 'invisible') 
      tabs[keys[i]].style.display = 'none'
    }
  }
