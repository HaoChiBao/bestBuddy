//only made to create one mochi buddy make sure to change for multiple (pets get lonely sometimes yknow)
//"always have one source of truth" ~ mm
//it is currently 3am and I haven't eaten yet
//im gonna custom make a mochi stuffed animal
//this project better be worth it
//istg
//shouldve gotten a group
//i should be more ambitious about this
//a few days left until this project is due lets make it seem like I was given a year to work on this

//note buddy.js runs before physics.js

const t1 = performance.now() //used to determine to load speed of all files (end of performance.now() is on entity.js)

class deskPet{
    //used as a switch to turn on and off console logs of app performance
    static logDebug = false

    //used to keep track of number of pets
    static petID = 0 

    //list of all pets
    static allPets = {
        //saved each key is a the element id
        //each value of key is object of thep et being stored
        //ie. mochi-1: object
    }

    //pet area represesnts the div that the pet will be appeneded to
    static petArea = null //initiallized when the program calls createPetArea()

    static areaStat = { 
        mOver: false, //stores if the uses cursor is over the petarea 
        mDown: false //stores if the uses cursor has clicked the petarea
    }

    //holds the set interval loop
    static loop = null

    //the last pet clicked or held (saved as an object)
    static curPetPickedUp = null

    static highestZ = 2147483647 //max value for variable

    static canSee = {
        visible: {
            cursor: true, //special case since the cursor is technically not an element

            button: true,
            video: true,
        },
        blindTo: {

        }
        //the user will be able to add their own elements to look for too
    }

    constructor(name, height, width){
        console.log(this)
        this.name = name
        this.height = height
        this.width = width

        this.chair = null

        this.ID = deskPet.petID
        //circular call back to itself (when a deskpet is made petObject is the same pet)
        this.petObject = this

        this.htmlID = deskPet.getClassFromObject(this.petObject) + this.ID 
        //physics will be the physics object/engine the pet belongs to (circular) delcared in appOn
        this.physics = new Physics(this.petObject)

        this.petStat = { //stores if the cursor is over or clicked the pet
            mOver: false,
            mDown: false
        }

        //rep if the user can pick up the pet
        this.canPickUp = true
        
        //stores the velocity of the pet (in x and y components)
        this.velocity = {
            vX: 0,
            vY: 0
        }

        //represents the on off switch for the pet to perform random actions (mochiAI)
        this.randomActions = true
        //represents the eyes of the pet
        //all given elements (pet will only be able to 'see' one type of element at a time)
        this.isVisible = {
            //save elements as keys
            //ie div: true
        }
        
        this.accessories = { //stores the type of accessories the pet can wear
            hat: {
                on: true,
                type: null
            },
            //change other to something else (idk like a watch or something)
            other: {
                on: false,
                type: null
            }
        }

        //assigns pet a random mass when created
        //mass is just for user experience
        this.mass = this.height * 2.5 / 100
        
        //maximum speed the pet can jump (can be in any direction)
        this.maxJmpSpd = 400 / this.mass

        //used as temp storage for jump conditions
        this.jumpStat = {
            spd:0,
            ang:0
        } 

        //saves the html element of the pet
        this.petHTML = this.stylePet()

        //canvas context of pet
        this.petCTX = this.petHTML.getContext('2d')

        //if for any reason the mochi pet is outside of the view screen 
        //if rePos is true then move mochi pet back onto the screen
        this.rePos = true

        //saves when the mochi was made
        this.madeAt = Date.now()

        //mochi is a sticky substance yknow, it makes sense that if thrown against a wall itll be sticky
        this.sticky = true

        //saves the current animation stats
        this.curAnimation = {
            name: null, //name of current animation occuring
            prev: null, //name of the previous animation
            chngInPrev: [], //array of changes in prev animations (ie. [jump, fly, fall])
            ani: false //whether or the animation has finished/reached the end or is ongoing
        }

        //emotion of the pet
        this.emot = {
            //happy mochi
            happy: true,
            //curiousity squished the mochi
            curious: false,

            //rep energy of the pet and can determine the strength of thep pets actions (ie.jumping) and their willingness to perform tasks
            //energy is based on a percentage 0%-100%
            energy: 100,

            //rep stomach of pet to see how hungry it is
            //based on a percentage 0% -100%/full 
            saturation: 100,

            //if the pet is curious he'll want to perfrom an action to it
            //ie. (point at it, move to it, try to eat it)
            intrested: {
                //rep if the pet needs to complete an action (t or f = y or n)
                actionToComplete: false,

                //rep the object/thing the pet is intrested in and where it is located
                object: {
                    name: null,
                    element: null,
                    x: 0,
                    y: 0
                }
            }
        }
        deskPet.allPets[this.htmlID]=this.petObject //save the pet to static variable
        deskPet.petID++ //increase the number of pets made so far
        console.log("new pet declared") //if this runs then a pet has succesfully been made
    }

    //loops the program for Physics.fps # of frames
    //represent the program running
    static setLoop(){
        deskPet.loop = setInterval(() => {
            const t1 = performance.now()
            Physics.timer++ //increment timer

            //wont run anything if time is paused
            if(!Physics.pauseTime){

                //update cursor position and velocity 
                Physics.updateCursorStats()

                //grab all pets appended to the area
                const petsInArea = deskPet.getAllPetsInArea()
                const length = petsInArea.length

                //runs commands to all pets in the area
                for(let ams = 0; ams < length; ams ++){
                    const pet = deskPet.getPetObjFromPetHTML(petsInArea[ams]) //current get all pet objects in on the screen

                    //simulate a pets thoughts / action determinants
                    pet.mochiAI() //what makes a pet? randomness with a visible pattern? 

                    if(!pet.isPickedUp()){ //if the pet is allowed to move (ie. cannot if picked up by cursor)
                        pet.move() //moves the pet based on velocity
                        pet.physics.addGravity() //adds gravity to pet
                    } 
                    pet.physics.addAirResistance() //adds air resistance so motion is never naturally constant
                    
                    pet.animate() // animate the pet (write over image data with next frame)
                }
                //debug logging per second
                if(Physics.timer==Physics.fps){
                    if(deskPet.logDebug){ // for debugging
                        const t2 = performance.now()
                        console.log("1s loop ran in: " + (t2 - t1) + "ms") 
                        console.log(deskPet.curPetPickedUp.curAnimation)
                    }
                }
                //reset timer after every second
                if(Physics.timer>=Physics.fps){Physics.updateTimer()}
            }
        }, 1000 / Physics.fps) //run this many frames per second (currently set to 120fps)
    }

    //adds pet to screen
    createPet(){ 
        //checks if theres an area to append to if not create area
        if(document.querySelector('.best-buddy-area') == null){
            deskPet.createPetArea()
        }
        //if there are no pets on the screen that means the set interval isnt running
        const entities = deskPet.getAllPetsInArea()
        if(entities.length<=0){
            deskPet.setLoop() //re-instantiate set interval
        }
        Physics.addCanPickUp(this.petObject) //lets the pet be picked up

        // find area to place pet
        const area = document.querySelector(".best-buddy-area")
        area.appendChild(this.petHTML)

        //delcare that we are starting an animation
        this.curAnimation.ani = true
        //animation type is enter
        this.curAnimation.name = 'enter'

        console.log('Element Created, id:' + this.petHTML.id) //if this runs then pet was properly appened to page

    }

    //removes pet from the screen
    removePet(){
        //stop current ongoing animation
        this.physics.resetTempTime()
        //animation type is exit
        this.curAnimation.name = 'exit'
    }

    //adds basic characteristics to pet
    stylePet(){
        const obj = document.createElement('canvas')
        obj.id = this.htmlID //element id

        obj.style.position = 'absolute' //wont move inline of any elements
        obj.style.border = 0
        obj.style.bottom = 0 //spawns at bottom
        obj.style.left = deskPet.rng(window.innerWidth-100, 0) + 'px' //spawn randomly and the window

        //determine the canvas height and width
        obj.style.height = this.height + 'px' 
        obj.style.width = this.width+ 'px'

        //determine the canvas context height and width
        obj.width = this.width
        obj.height = this.height

        //when the user hovers over the pet it will display its given name
        obj.title = this.name
        
        obj.style.zIndex = '0' //z-index starts and zero
        obj.style.pointerEvents = 'auto' //also user to click
        obj.style.userSelect = 'none' //prevents user from highlight the pet

        //randomly face the pet left or right
        if(deskPet.rng(2,1)==1){obj.style.transform = 'scaleX(1)'}
        else {obj.style.transform = 'scaleX(-1)'}

        obj.addEventListener('mousedown', (e) => { //wwhen the user mouse is clicked down
            e.preventDefault() //prevent default like draging the pet image of the page
            this.handlePickUp(e) 
        })
        obj.addEventListener('mouseup', (e) => { //wwhen the user mouse is clicked down
            e.preventDefault()
            this.handlePickUp(e)
        })
        return obj
    }

    //draw given img html if second parameter is for if user wants to clear the canvas aswell
    drawImage(image, clear){ 
        const obj = this.petHTML //pet canvas
        const ctx = this.petCTX  //pet canvas context

        //wait for the computer to load the image
        image.onload = function(){ //this took way to long for this amount of code
            if(clear == true){ctx.clearRect(0, 0, obj.width, obj.height)} //clear canvas if inputted

            ctx.drawImage( //draw new image onto canvas/pet
                image, 
                0, 0,
                image.width, image.height,
                0, 0,
                obj.width, obj.height
            )
        }
    }

     //what happens when the user clicks on the pet
    handlePickUp(e){
        if(deskPet.logDebug){ //for debugging purposes
            console.log(e)
        }
        if(this.canPickUp){ //if the pet is allowed to be picked up

            if(e.type == 'mousedown'){ //for mouse down event

                let alpha = this.petCTX.getImageData(e.offsetX, e.offsetY, 1, 1).data[3] //get the alpha value of the pet canvas at the location the user clicked
                if(alpha !== 0){ //check if alpha value isn't transparent (meaning use actually clicked the physical pet, not the air around it)

                    if(e.buttons==1){ //checks if the click was a 'left' clcik
                        this.petStat.mDown = true //save the pet as clicked

                        this.fwdAnimation() //fast forwaed the animation being played
                        
                        if(this.chair!=null){ //if the pet made a chair then delete the chair 
                            deskPet.petArea.removeChild(this.chair.petHTML)

                            //reset the floor height 
                            this.physics.floor = 0
                            
                            //remove chair from pet storage
                            this.chair = null
                        }

                        //stop pet from moving when 
                        this.velocity.vX = 0 
                        this.velocity.vY = 0
    
                        //if the previous pet click is the current pet being clicked skip this
                        if(deskPet.curPetPickedUp!=this.petObject){

                            //if the current pet isn't the first one clicked run this
                            if(deskPet.curPetPickedUp!=null){
    
                                //changes the current pet border color back to original
                                deskPet.curPetPickedUp.petHTML.style.border = 0
                            }
                            //sets last clicked pet as current pet clicked
                            deskPet.curPetPickedUp = this.petObject
                            
                            //we dont want to store values more than a variable can store
                            if(deskPet.highestZ == 2147483647){
                                //reset all z-indexes to 0
                                const keys = Object.keys(deskPet.allPets)
                                for(let i = 0; i<keys.length; i++){
                                    deskPet.allPets[keys[i]].petHTML.style.zIndex = 0
                                }
                                deskPet.highestZ = 0
                            }
        
                            //moves the current pet clicked to the front 
                            //raises the highest z-index by 1
                            deskPet.highestZ++
                            deskPet.curPetPickedUp.petHTML.style.zIndex = deskPet.highestZ 
                            
                        }

                        console.log(this.htmlID + ' pickedUp: ' + this.petStat.mDown) 
                        deskPet.petArea.style.pointerEvents = 'auto' //returns the petarea to clickable to track cursor movements
                    }
                }
            } else if (e.type == 'mouseup'){ //if the users mouse is clciked up from the pet
                if(this.isPickedUp()){ //if the user picked up the pet before

                    this.physics.addCanThrow() //throw the pet based on cursor velocity
                    
                    this.petStat.mDown = false //delcare cursor as not clicked on the pet
                    
                    this.fwdAnimation() //fast forward the currernt animation being played
                }
                console.log('pickedUp: ' + this.petStat.mDown) //log that the pet is no longger clicked
            }
        }
    }

    //moves pet one frame based on the velocity
    move(){
        if(Math.abs(this.velocity.vX) <= 5 && Math.abs(this.velocity.vY) <= 5 ){ //if the pet is moving too slow just set velocties to 0
            this.resetPetVelocity()
        }
        else {
            this.translatePet( //move pet x and y amount

            //formula to get displacement based on velocity
                this.velocity.vX * Physics.m / Physics.fps, 
                this.velocity.vY * Physics.m / Physics.fps 

            )
        }
    }

    //stops pet from moving
    resetPetVelocity(){
        this.velocity.vX = 0
        this.velocity.vY = 0
    }

    translatePet(x, y){
        //checks if translation will be below the set floor
        if(deskPet.decodePos(this.petHTML.style.bottom) + y > this.physics.floor){
            this.petHTML.style.bottom = deskPet.decodePos(this.petHTML.style.bottom) + y + 'px'
        } else {
            //set position to floor
            this.petHTML.style.bottom = this.physics.floor + 'px'
            
            //if the mochi pet hits a surface it will lose all velocity cuz its sticky yknow
            if(this.sticky){
                this.resetPetVelocity()
            }
        }

        //checks if the pet has hit the left boundary
        if(deskPet.decodePos(this.petHTML.style.left) + x < 0){
            this.petHTML.style.left = 0 + 'px'
            
            if(this.sticky){ //stop pet if sticky
                this.resetPetVelocity()
            }

        //checks if the pet has hit the right boundary
        } else if (deskPet.decodePos(this.petHTML.style.left) + x > window.innerWidth - deskPet.decodePos(this.petHTML.style.width)){
            this.petHTML.style.left = window.innerWidth - deskPet.decodePos(this.petHTML.style.width) + 'px'
            
            if(this.sticky){
                this.resetPetVelocity()
            }
        } else {
            this.petHTML.style.left = deskPet.decodePos(this.petHTML.style.left) + x + 'px'
        }
    }

    //we want to simulate the feeling of a pet
    mochiAI(){
        //if the user allows the mochi to perform its own actions
        if(this.randomActions){
            if(!this.isPickedUp()){
                if(Physics.timer == 1){ //runs every second

                    const vision = this.letPetSee() //gets a random object that the pet can see

                    if(vision == 'video'){ //if the pet sees a video player

                        let vPlayer = document.querySelector('video') //looks for video element
                        if(vPlayer==null){ //no video element? look for iframe element
                            vPlayer = document.querySelector('iframe')
                        }
                        if(vPlayer != null){ //if the program finds the elements

                            if(Physics.isInViewport(vPlayer)){ //check if the element is in the view port
                                
                                //check if the pet is on the ground isn't pickedup/being held by the user
                                if(this.isOnGround()){ 

                                    if(!this.emot.intrested.actionToComplete){ //check if the pet has an action to complete

                                        this.emot.intrested.actionToComplete = true //delcare that the pet has an action to complete
                                        this.emot.intrested.object.name = 'video' //delcare action name
                                        this.emot.intrested.object.element = vPlayer //delcare element of intrest

                                        //animate pet spitting out chair
                                        this.curAnimation.name = 'mouth'
                                        this.physics.resetTempTime()

                                        this.spitOutChair() //create chair for pet to sit on
                                        
                                    }
                                }
                            }
                        }
        
                    }
                    if(this.isOnGround()){ //check if pet is on the ground
                        if(deskPet.rng(25, 1)==1){ // 4% chance for pet to jumnp straight up
                            this.jump(this.maxJmpSpd, 90)
                        }
                    }
                }

            }
        }
    }

    //makes a new chair object for the pet to 'spit' out
    spitOutChair(){
        const chair = new Chair(this.name + "'s chair", this.height, this.width) //delcare chair object
        this.chair = chair //save chair into pet

        chair.velocity.vY = 200 //spawn the chair as being flung into the air

        chair.petHTML.style.left = this.petHTML.style.left //make chair located at where the pet is
        chair.petHTML.style.bottom = '1px'
        chair.petHTML.style.zIndex = 2147483647 //force the chair infront of everything
        
        //make the user unable to pick up the chair
        chair.canPickUp = false 
        chair.petHTML.style.pointerEvents = 'none' 

        //append chair to page
        chair.createPet()
    }

    //returns a random object that the pet can see
    letPetSee(target){ 
        const keys = Object.keys(deskPet.canSee.visible) //gets all objects names that the pet is allowed to see
        const rng = deskPet.rng(keys.length-1, 0)
        return keys[rng] //return random object to see
    }

    //adrenaline shot of y&x-axis velocity into little mochi pet (param: jump speed and angle)
    jump(spd, ang){
        if(this.isOnGround()){ //makes sure the pet is on the ground because you can't jump off of air
            if(this.curAnimation.prev == 'idle' || this.curAnimation.prev == 'mouth' || this.curAnimation.prev == 'jump'){ //if the previous animation is one of these
                
                this.curAnimation.name = 'jump' //delcare we are starting jump animation
                this.physics.resetTempTime() //clear frame statistics
                this.curAnimation.ani = true //delcare we are starting a new animation
            }
            //temporary store jump stats (will execute jump after animation is finished playing)
            this.jumpStat.spd = spd 
            this.jumpStat.ang = ang
        }

    }

    // jumpTo(pos){

    // }

    //reset the pets intrests
    resetEmotInterest(){
        this.emot.intrested = {
            actionToComplete: false,
            object: {
                name: null,
                element: null,
                x:0,
                y:0
            }
        }
    }

    //speed up animation
    fwdAnimation(){
        //we don't want always just skip to another animation
        //so we just speed it up really fast
        this.physics.setTempTime.counter = 0 
        this.physics.setTempTime.increments = 1 //make animation frames only last for one frame of set interval
    }

    //save the previopus 5 changes in animation
    saveChangeInAni(){
        //check if at least one animation has occured
        if(this.curAnimation.prev!==null){
            //if the previous animation frame and current animation frame are not the same
            //that means that there was a change in animation
            if(this.curAnimation.prev != this.curAnimation.name ){
                if(this.curAnimation.chngInPrev.length >= 5){ //save up to the 5 past animations
                    this.curAnimation.chngInPrev.shift()
                }

                //save the animation name into list of previous animations
                this.curAnimation.chngInPrev[this.curAnimation.chngInPrev.length] = this.curAnimation.name
            }
        } 
    }

    //what the pet will do after an animation finishes
    atAnimateEnd(){
         // check if the exit animation finished
         if(this.curAnimation.prev == 'exit'){
            deskPet.petArea.removeChild(this.petHTML) //deletes pet html from pet area
            if(deskPet.getAllPetsInArea().length == 0){ //if there are no more pets on the page then stop set interval loop
                clearTimeout(deskPet.loop)
            }
        }
        if(this.curAnimation.prev == 'mouth'){ //if the pet spit out a chair
            this.jump(200, 90) //jump striaght up onto the chair
        }

        //if the pet round up to jump
        if(this.curAnimation.prev == 'jump'){
            if(this.isOnGround() && !this.isPickedUp()){
                const v = Physics.getvVectorFromMagAndAng(this.jumpStat.spd, this.jumpStat.ang) //get x and y velocity based on magintude of jump and angle
                
                //adds velocity to pet
                this.velocity.vX += v.vX 
                this.velocity.vY += v.vY
                
                //after the pet jumps it has to be in the air
                this.physics.resetTempTime() 
                this.curAnimation.name = 'fly' //delcare animation after jumping is in the air
                this.curAnimation.ani = true
                
                //check if the jump occured because the pet was intrested in something
                if(this.emot.intrested.actionToComplete){

                    if(this.emot.intrested.object.name == 'video'){ //if the intreset was a video player
                        //this means that the pet jumped because it was jumping on a chair

                        if(this.physics.floor != this.height/2){ //check if this action has already occured once (if not then continue)

                            
                            this.petHTML.bottom = this.height/2 + 1 //move pet to the top of chair
                            this.physics.floor = this.height/2 //set floor/ (y-axis stop  condition) to the height of the chair
                            
                            //since the pet has reached its goal of jummping on the chair
                            //reset the pets intrest
                            this.resetEmotInterest() 
                            this.emot.intrested.actionToComplete = true
                        }
                    }
                }
            }
            this.jumpStat = {spd:0,ang:0} //reset jump stat
        }
    }

    //runs the animation need to be played by the pet every frame of the set interval fps
    animate(){
        const movingIn = this.getMovementDirect() //get the direction that the pet is moving in
        
        //in the future there might be multiple types of the same animation 
        let type = 0  //this represents which type of the same animation to use
        
        const image = new Image() //delcare blank image to draw on pethtml

        const cur = this.physics.setTempTime.curFrameNum + 1 //add 1 to current number of frames because image files start counting at 1

        const state = this.grabPetState() //find what state the pet is in (ie. 'in the air')

        this.curAnimation.prev = this.curAnimation.name //save animation name before declaring new animation name
        
        if(!this.curAnimation.ani){ //check when an animation if finished
           this.atAnimateEnd() //determine what to do when the animation ends
        }

        //redelare a new animation
        if(!this.curAnimation.ani){ 
            this.curAnimation.ani = true //declare the start of a new animation
            this.curAnimation.name = state// save current animation name
        }
        this.saveChangeInAni() //checks if pet state changed

        if(this.curAnimation.ani){this.physics.setTempTime.counter++} //increase the counter if an animation is playing
        
        //flip the pet to move in the proper x-direction
        if(movingIn.left != null){
            if (movingIn.left){
                this.mirrorPet('left')
            } else {
                this.mirrorPet('right')
            }    
        } 

        /* 
        the following takes the animation name and tells the program how many frames 
        animation is an how long it should run per fps
        1st param (cur): is the current frame number the animation is on
        2nd param: is the number of frames
        3rd param: how long a frame lasts based on the fps 
        */
        switch(this.curAnimation.name){
            case 'enter': //pet entering/appending to the page
                this.physics.setSetTempTime(cur, 11, Math.ceil(Physics.fps/12))
                break
            case 'exit': //pet leaving/removed from page
                this.physics.setSetTempTime(cur, 11, Math.ceil(Physics.fps/12))
                break
            case 'idle': //pet is not moving at all
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/12))
                break
            case 'pull0%': //pet is being pulled at 0% of its height, etc
                this.physics.setSetTempTime(cur, 1, 1)
                break
            case 'pull20%':
                this.physics.setSetTempTime(cur, 1, 1)
                break
            case 'pull40%':
                this.physics.setSetTempTime(cur, 1, 1)
                break
            case 'pull60%':
                this.physics.setSetTempTime(cur, 1, 1)
                break
            case 'pull80%':
                this.physics.setSetTempTime(cur, 1, 1)
                break
            case 'pull100%':
                this.physics.setSetTempTime(cur, 1, 1)
                break
            case 'snap': //pet has been pulled off the ground by cursor
                this.physics.setSetTempTime(cur, 10, Math.ceil(Physics.fps/20))
                break
            case 'pick': //pet is in the air, carried by cursor
                this.physics.setSetTempTime(cur, 7, Math.ceil(Physics.fps/11))
                break
            case 'fallX': //pet is moving down and on the x-axis
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/24))
                break
            case 'flyX': //pet is moving up and is on the x-axis
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/24))
                break
            case 'floatX': //pet is in the air and ONLY moving on the x-axis
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/24))
                break
            case 'fall': //pet is ONLY moving down on the y-axis
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/24))
                break
            case 'fly': //pet is ONLY moving up on the y-axis
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/24))
                break
            case 'x':
                 
                break
            case 'smoosh': //pet has hits the ground from falling on being thrown
                this.physics.setSetTempTime(cur, 6, Math.ceil(Physics.fps/12))
                break
            case 'mouth': //pet opens mouth and either swallows or spits something out
                this.physics.setSetTempTime(cur, 8, Math.ceil(Physics.fps/40))
                break
            case 'jump': //pet jumps
                this.physics.setSetTempTime(cur, 5, Math.ceil(Physics.fps/12))
                break
            default:  //if the pet state is not declared then there will be no new animation frame
                this.curAnimation.name = null
                //throw an error in order to remind us of the missing animation
                console.error('missing animation case')
                break
        }
        if(this.curAnimation.name != null){ //if the pet is in an unkown state DONT run this

            /*grabs the image from 'ani' folder based on:
            * which type of animation we want
            * what animation we want
            * which frame of the animation to play
            */
            image.src = chrome.runtime.getURL(`images/ani/type (${type})/${this.curAnimation.name}/step (${cur}).png`)
            this.drawImage(image, true) //draw the image onto the pethtml
        
        }
        
        //special cases
        if(state =='smoosh'){ //if the pet was hit the ground
            if(this.curAnimation.prev == 'fall' || this.curAnimation.prev == 'fallX' || this.curAnimation.prev == 'floatX'){

                //stop currentanimation
                this.physics.resetTempTime()
                this.curAnimation.ani = true //declare new animation
                this.curAnimation.name = 'smoosh' //play animation of pet hitting/ssquishing on the ground
            }
        }
        
        this.checkAniCounter()
        
    }

    //check if the setTempTime.counter has reached its conditions
    checkAniCounter(){
        //if the counter has reached the set number of increments on an animation
        if(this.physics.setTempTime.counter >= this.physics.setTempTime.increments){

            this.physics.setTempTime.curFrameNum++ //increment the current frame we're on
            this.physics.setTempTime.counter = 0 //reset the counter

            //if we've reached the total number of frames the animation
            if(this.physics.setTempTime.curFrameNum >= this.physics.setTempTime.numOfFrames){

                this.physics.resetTempTime() //reset the animation timer
                this.curAnimation.ani = false //delcare that the animation has reached the end 
            }
        }
    }

    //get the state that the pet is currently in
    grabPetState(){
        //checks if the pet has been fully picked up
        if(this.isPickedUp()){

            //if the pet is on the ground
            if(this.isOnGround()){
                const pickUpLoc = deskPet.decodePos(this.petHTML.style.height) * 0.94 //this is the height of the pethtml (not including the transparent pixels)

                //folLowing represents the height levels of the cursor relative to the pet
                //based on where the mouse is, the pet will have a different height (to simulate being pulled up by cursor)
                if(Physics.cursorStat.y < pickUpLoc){ 
                    this.fwdAnimation()
                    if(Physics.cursorStat.y < pickUpLoc * 0.8 + this.physics.floor){
                        if(Physics.cursorStat.y < pickUpLoc * 0.6 + this.physics.floor){ 
                            if(Physics.cursorStat.y < pickUpLoc * 0.57 + this.physics.floor){ 
                                if(Physics.cursorStat.y < pickUpLoc * 0.5 + this.physics.floor){ 
                                    if(Physics.cursorStat.y < pickUpLoc * 0.4 + this.physics.floor){
                                        return 'pull0%'
                                    }
                                    return 'pull20%'
                                }
                                return 'pull40%'
                            }
                            return 'pull60%'
                        }
                        return 'pull80%' //else
                    }
                    return 'pull100%' //else
                }
                console.error('you need to return somethin bro')
            }
            //if the pet was just picked up from the ground, snap up animation 
            if(this.curAnimation.prev.substring(0,4)=='pull'){
                return 'snap'
            }
            return 'pick' //the user has picked up the pet
        }
        //check if the pet is in motion
        if(this.isInMotion()){
            //find the direction and angle of movement
            const movingIn = this.getMovementDirect()
            
            if(!this.isOnGround()){ //is the pet in the air
                const angles = Physics.getDividedAngles(8) //find range of angles for 8 pieces
                // if(movingIn.down){ //the pet is moving DOWN and on the x-axis
                if(Physics.isAngleInsideRange(movingIn.angle, angles[5]) || 
                   Physics.isAngleInsideRange(movingIn.angle, angles[7])){
                    return 'fallX'
                // } else if(!movingIn.down){ //the pet is moving UP and on the x-axis
                } else if(Physics.isAngleInsideRange(movingIn.angle, angles[3]) || 
                          Physics.isAngleInsideRange(movingIn.angle, angles[1])){
                    return 'flyX' 
                } else if(Physics.isAngleInsideRange(movingIn.angle, angles[0][0]) || 
                           Physics.isAngleInsideRange(movingIn.angle, angles[0][1]) || 
                           Physics.isAngleInsideRange(movingIn.angle, angles[4])){
                    return 'floatX' //the pet is ONLY moving on the x-axis
                }
                
                //pet is not moving on the x
                // if(movingIn.down){ //the pet is ONLY moving DOWN 
                if(Physics.isAngleInsideRange(movingIn.angle, angles[6])){
                    return 'fall'
                // } else if (!movingIn.down){ // the pet is ONLY moving UP
                } else if(Physics.isAngleInsideRange(movingIn.angle, angles[2])) {
                    return 'fly'
                } 
                // return 'float' //pet is STATIC in the air
            }
            //the pet is moving on the ground on the x-axis
            //this will never be returns if the pet.sticky == true
            return 'x'

        }
        //the pet isn't moving

        if(this.isOnGround()){
            if(this.curAnimation.prev == 'fall' || this.curAnimation.prev == 'fallX' || 
               this.curAnimation.prev == 'floatX' || this.curAnimation.prev == 'fly'){
                return 'smoosh' //if the pet has hit the ground from one of these states
            }
            // if(this.curAnimation.prev == 'fallX'){
            //     //return sideways smoosh
            // }
            return 'idle' //if the pet isn't moving on the ground 
        }
        // return 'float'
        
    }

    //returns the pets direction of movements and angle
    //ie. ( returns: {left: false, up:true, angle:30})
    getMovementDirect(){
        const movingIn = {
            left: null,
            down: null,
            angle:0
        }
        //find if the pet is move left or right
        if(this.velocity.vX < 0){
            movingIn.left = true
        } else if (this.velocity.vX > 0){
            movingIn.left = false
        }
        if(this.velocity.vY < 0){
            movingIn.down = true
        } else if (this.velocity.vY > 0){
            movingIn.down = false
        }
        movingIn.angle = Physics.getAngleFromVectors(this.velocity.vX, this.velocity.vY) //find the angle between the vectors
        return movingIn
    }

    //return where the pet is on teh screen
    getPetPosition(){
        return {
            x:deskPet.decodePos(this.petHTML.style.left), 
            y:deskPet.decodePos(this.petHTML.style.bottom)
        }
    }

    //returns true if the pet is on the floor
    isOnGround(){
        if(deskPet.decodePos(this.petHTML.style.bottom) > this.physics.floor){
            return false
        } else {
            return true
        }
    }
    
    //make the pet face left or right (based on the input)
    mirrorPet(direction){
        if(direction == 'left'){
            this.petHTML.style.transform = 'scaleX(1)'
        } else {
            this.petHTML.style.transform = 'scaleX(-1)'
        }
    }

    //returns t or f whether or no the pet is moving
    isInMotion(){
        if(this.velocity.vX == 0 && this.velocity.vY == 0){
            return false
        }
        return true
    }

    // returns whether or not the pet is picked up
    isPickedUp(){
        if(this.petStat.mDown){
            return true
        } 
        return false
    }

    //returns the direction the pet is facing (relative to facing left)
    isFacingLeft(){
        if(this.petHTML.style.transform == 'scaleX(1)'){ return true }
        else {return false}
    }

    //if the pet is visible on the screen return true
    petIsInView(){
        return Physics.isInViewport(this.pet.petHTML)
    }

    //moves a given element that the pet is allowed to see and moves makes it invisible or visible to ALL pet
    static moveCanSee(target){
        const visible = deskPet.canSee.visible[target]
        const blindTo = deskPet.canSee.blindTo[target]
        //checks if the element exists
        if(visible!=undefined || blindTo!=undefined){
            if(visible!=undefined){
                //delete from is visisble
                delete deskPet.canSee.visible[target]
                //add to blindTo
                deskPet.canSee.blindTo[target] = true
            } else {
                delete deskPet.canSee.blindTo[target]
                deskPet.canSee.visible[target] = true
            }
        } else {
            console.error("INPUTED CANSEE TARGET: ['" + target + "'] DOESN'T EXIST");
        }
    }

    //return the object that contains the pet
    static getPetObjFromPetHTML(elmnt){
        let id = elmnt.id //get id form inputed element
        if(deskPet.allPets[elmnt.id]){ //if an object with the elment id exists the return the object
            return deskPet.allPets[elmnt.id]
        } 
        return null
    }

    //get all pets currently appended to the area
    static getAllPetsInArea(){
        return document.querySelector('.best-buddy-area').children
    }

    //get every element on the website
    static getAllElementsOnPage(){
        return document.body.getElementsByTagName('*')
    }

    //removes the last two charactes off a value (ie. element.style.bottom = 100px => 100)
    static decodePos(pos){
        pos = String(pos)
        pos = pos.substring(0,pos.length-2)
        pos = Number(pos)
        return pos
    }

    //random nummber generator from max - min
    static rng(max, min) {
        return Math.floor((Math.random() * (max - min + 1)) + min)
    }

    //get the name of the class from a given object
    static getClassFromObject(object){
        return String(object.constructor.name)
    }

    //create the area for pets to be append to
    //this should only ever run once
    static createPetArea(){
        let area = document.createElement('div') //declare area 
        document.body.appendChild(area) //append to web page

        area.className = 'best-buddy-area' //see CSS file for properties

        area.addEventListener('mouseover', (e)=>{ //check if cursor is over the area
            deskPet.areaStat.mOver = true
            })
        area.addEventListener('mouseleave', (e)=>{ //if the cursor leaves the window drop the pet and add velocity to the pet as the cursor leaves
            deskPet.areaStat.mOver = false
            if(deskPet.curPetPickedUp!=null){
                if(deskPet.curPetPickedUp.isPickedUp()){ //check that the pet is actually picked up before adding velocity
                    deskPet.curPetPickedUp.physics.addCanThrow()
                    deskPet.curPetPickedUp.fwdAnimation()
                }
                deskPet.curPetPickedUp.petStat.mDown = false //drop the pet
            }
        })
        area.addEventListener('mousedown', (e)=>{ //cursor is pressed down the area
            deskPet.areaStat.mDown = true
        })
        area.addEventListener('mouseup', (e)=>{
            if(deskPet.curPetPickedUp.isPickedUp()){
                deskPet.curPetPickedUp.fwdAnimation()
            }
            deskPet.areaStat.mDown = false
            if(deskPet.curPetPickedUp!=null){ //checks if there is a pet picked up
                deskPet.curPetPickedUp.petStat.mDown = false
            }
            area.style.pointerEvents = 'none' //on default the area should have no pointer events in order to no block access to web pages
        })
        area.addEventListener('mousemove', (e) => { //save the position of the cursor
            Physics.cursorStat.x = e.x
            Physics.cursorStat.y = window.innerHeight -  e.y
        })
        
        deskPet.petArea = area //save element in static variable (because there should only be ONE area)
        console.log("area created")
    }
}

console.log('buddy.js declared') //runs if class was instantiated properly

