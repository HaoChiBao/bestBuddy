function openTabThree(){
    closeOtherTabs() // closes all other tabs
    document.getElementById('tab3').style.display = 'inline' //opens this tab
  }
  
document.getElementById('b2').onclick = openTabThree //run when the button is clicked