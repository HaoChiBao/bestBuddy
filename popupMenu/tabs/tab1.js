function openTabOne(){
    closeOtherTabs() //close all other popup tabs
    document.getElementById('tab1').style.display = 'inline' //opens up tab1
  }
document.getElementById('b0').onclick = openTabOne //get the navigation button