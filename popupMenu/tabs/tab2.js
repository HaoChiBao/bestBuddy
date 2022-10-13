function openTabTwo(){
    closeOtherTabs() //close all other popup tabs
    document.getElementById('tab2').style.display = 'inline' //opens up this one
  }
  
  document.getElementById('b1').onclick = openTabTwo