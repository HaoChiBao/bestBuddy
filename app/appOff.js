//buddy.js must be initialized 
//deletes last created pet from page
function delt(){
    const t1 = performance.now()
    //get pet area and all pets appended to area
    const area = document.querySelector('.best-buddy-area')
    const pets = deskPet.getAllPetsInArea()
    const length = pets.length

    //if there is at least on pet on the area
    if(length != 0){
        const thePet = deskPet.getPetObjFromPetHTML(pets[length-1])
        thePet.removePet() 
    }

    if(deskPet.logDebug){
        //logs number of pets left
        console.log("number of pets:" + length)

        //how long it took to run the function
        const t2 = performance.now()
        console.log("pet alivn't in: "  + (t2 - t1) + 'ms') 
    }
}

delt()