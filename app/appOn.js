function start(){
    const t1 = performance.now() //determines how long it takes to run this command

    chrome.storage.local.get(['mochiName'], function(result) { //grabs name of mochi from local storage and runs function
        const name = String(result.mochiName) 
        if(name != ''){ //if the name isn't empty
            const dim = deskPet.rng(100, 75) //give the pet a random size from 100 - 75 pixels

            const pet = new deskPet(name, dim, dim) //delcare pet object

            pet.createPet() //create pet onto the pet area

            //for debugging
            if(deskPet.logDebug){
                const pets = deskPet.getAllPetsInArea()

                //log the pet created
                console.log('Created pet:') 
                console.log(pet)

                //log number of pets on the page
                console.log('current number of pets on page: ' + pets.length)

                //how long it took to run function
                const t2 = performance.now()
                console.log('loaded pet in: ' + (t2 - t1) + 'ms') 
            }

            // const chair = new Chair('chair', 100, 100)
            // chair.createPet()
        }
    });


}

start()
