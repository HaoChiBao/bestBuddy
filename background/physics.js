//lets just...make physicssss woooooo
//and put it in a class for the OOP

class Physics {
    static pauseTime = false

    static fps = 120
    //rate of gravity in m pixels per s
    static g = -9.81
    
    //represents average movement speed (a unit of measure representing 10px)
    static m = 10

    static timer = 0

    //coeffecient of drag (percentage of drag affect velocity)
    static coeOfDrag = 0.981
    
    //stores the cursors previous positions
    static prevCursorTime = []
    //determines how many previous cursor positions to save
    static prevCursorMaxTime = Math.ceil(Physics.fps * 0.05)

    //stores users cursor's current position and velocity
    static cursorStat = {
        x: 0,
        y: 0,
        vX: 0,
        vY: 0
    }

    //storage for where the cursor picked up the pet
    static cursorPickUp = [0,0]
    

    constructor(pet){
        //height of the floor (stop condition for pet)
        this.floor = 0
        //light switch for physics
        this.on = true
        //pet will be the object physics belongs too (circular) delcared in appOn
        this.pet = pet
        //used to save a time for the pet to stop or start an action
        this.setTempTime = {
            numOfFrames: 0, //total number of frames
            curFrameNum: 0, //number of frames past
            increments: 0, //how long a frame lasts for relative to the fps
            counter: 0,
        }
    }
    resetTempTime(){ //reset values of setTempTime to 0
        this.setTempTime = {
            numOfFrames: 0,
            curFrameNum: 0, 
            increments: 0, 
            counter: 0,
        }
    }

    setSetTempTime(cur, numOf, incre){ //declare the number of frames for an animation and how fast each frame is
        if(cur<=1){ //checks if the animation just started
            this.setTempTime.numOfFrames = numOf
            //number of frames divided by frames per second is the length of each frame
            this.setTempTime.increments  = incre
        }
    }

    addGravity() { //calculates wheere the pet should at the next frame based after force of gravity
        if (this.on) {
            const currentPos = this.pet.getPetPosition()
            // const pet = this.pet
            if(!this.pet.isOnGround()){
                const vI = this.pet.velocity.vY //take initial velocity
                const vF = Physics.getFinalVelocity(vI, Physics.g, 1) //calculate for final velocity
                const changeH = Physics.getDisplacement(vF, vI, Physics.m, Physics.fps) //get displacement per frame

                this.pet.translatePet(0, changeH) //move the pet accordingly
                this.pet.velocity.vY = vF //final velocity is now current velocity
            }
        }
    }

    //get velocity from cursor and add it the pet velocity
    addCanThrow(){
        if(this.on){
            this.pet.velocity.vX += Physics.cursorStat.vX
            this.pet.velocity.vY += Physics.cursorStat.vY

            //console debug (show throw velocity)
            if(deskPet.logDebug){
                console.log("cursor velocity vector: ")
                console.log(Physics.cursorStat)
                console.log("pet velocity vector: ")
                console.log(this.pet.velocity)
            }
        }
    }

    //slow down the pet overtime (prevents pet from moving at a constant speed)
    addAirResistance(){
        if(this.on){

            //gradually slow down velocity x and y (based on how strong the 'air resistance' is)
            this.pet.velocity.vX *= Physics.coeOfDrag 
            this.pet.velocity.vY *= Physics.coeOfDrag
        }
    }

    //deteremines if an element is in view (in physics cuz like, optics)
    //this function is very very useful
    static isInViewport(element) {
        const loc = element.getBoundingClientRect()
        return (
            loc.top >= 0 &&
            loc.left >= 0 &&
            loc.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            loc.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    //adds eventlisner to pet to match the cursor position on click
    static addCanPickUp(pet) {
        pet.petHTML.onmousedown = dragMouseDown //run function
        
        function dragMouseDown(e) {
            if(e.buttons==1){ //if click is 'left click'
                deskPet.curPetPickedUp = pet //set the current pet picked
                e.preventDefault() 

                Physics.cursorPickUp[0] = e.clientX
                Physics.cursorPickUp[1] = e.clientY

                document.onmouseup = closeDragElement
                document.onmousemove = elementDrag
            }
        }
    
        function elementDrag(e) {
            if(pet.petStat.mDown){
                e.preventDefault()

                //save where the pet is located relative to where the cursor is
                const posX = Physics.cursorPickUp[0] - e.clientX 
                const posY = Physics.cursorPickUp[1] - e.clientY
                Physics.cursorPickUp[0] = e.clientX
                Physics.cursorPickUp[1] = e.clientY

                if(deskPet.curPetPickedUp.canPickUp){
                    //since we want to pick up the pet and simulate the pet being sticky with the ground
                    //only pull up the pet after a certain height
                    if(Physics.cursorStat.y >= deskPet.decodePos(pet.petHTML.style.height) * 0.94 || !pet.isOnGround()){
                        deskPet.curPetPickedUp.translatePet(0, posY) //move pet agianst y
                    }
                    deskPet.curPetPickedUp.translatePet(-posX, 0) //move pet against x
                }
            }
        }
    
        function closeDragElement() {
            // stop moving when mouse button is released
            document.onmouseup = null
            document.onmousemove = null
        }
    }

    //velocity is change in displacement over change in time v = d/t
    static getVelocityVector(startD, endD, startT, endT) {
        
        //find change in x and y dispplacement
        const changeX = endD.x - startD.x 
        const changeY = endD.y - startD.y 
        
        //fins change in x and y velocity
        const vX = (endD.x - startD.x) / (endT - startT)
        const vY = (endD.y - startD.y) / (endT - startT)

        //get the angle of vector realtive to x-axis
        const angle = Physics.getAngleFromVectors(changeX, changeY)

        return { vX, vY, angle }
    }

    //get the angle from the velocity vector
    static getAngleFromVectors(x, y){
        let angle = Math.abs(Math.atan(y / x) * 180 / Math.PI) //find agnle
        //convert angle into 0 - 360 degrees
        if(x < 0){
            if(y < 0){ 
                angle += 180
            } else if (y > 0){
                angle = 180 - angle
            } else {angle = 180}
        } else if (x > 0) {
            if(y < 0){
                angle = 360 - angle
            } else if (y == 0){
                angle = 0
            }
        } else {
            if(y < 0){
                angle = 270
            } else if(y>0){
                angle = 90
            } else { 
                angle = null
            }
        }
        return angle
    }

    //get final velocity formula
    static getFinalVelocity(vI, a, t){
        return vI + a * t
    }
    static getDisplacement(vF, vI, m, s){
        // return (((vF * m / s) * (vF * m / s))-((vI * m / s) * (vI * m / s)))/(2 * g * m / (s * s))
        return ((vF * m / s) + (vI * m / s)) / (2 * s) 
    }

    //returns the cursor velocity
    static getCursorVelocity(){

        //take the current position and postion from Physics.prevCursorMaxTime number of frames ago
        const start = Physics.prevCursorTime[0]
        const end = Physics.prevCursorTime[Physics.prevCursorTime.length-1]

        //get velocity vecotr 
        let cursor = Physics.getVelocityVector(start, end, 1, Physics.prevCursorMaxTime)

        //converrt velocity to m/s
        cursor.vX *= Physics.m 
        cursor.vY *= Physics.m 
        return cursor
    }

    //get the velocity vector from the magintude of velocity and angle
    static getvVectorFromMagAndAng(mag, ang){
        ang*= Math.PI / 180 //convert degrees to radians

        // determine the x and y components of the velocity
        let vY = mag*Math.sin(ang) 
        let vX = mag*Math.cos(ang)

        //if the velocity is really small just round it to 0
        if(Math.abs(vY)<2){vY=0} 
        if(Math.abs(vX)<2){vX=0}
        return {vX: vX, vY: vY}
    }

    //divides 360 degrees into n number of pieces (first piece is centered with left x-axis)
    //returns each pieces 'angle range' (ie. piece 1 = [45, 90] => meaning between 45 and 90)
    static getDividedAngles(numOfPieces){ 
        if (numOfPieces > 0) { //you can only have posiitive pieces (why would I want -1 slices of cake yknow)
            const size = 360 / numOfPieces
            const pieces = [[360 - size / 2, size / 2]]
            for (let i = 1; i < numOfPieces; i++) {
            pieces[i] = [pieces[i - 1][1], pieces[i - 1][1] + size]
            }
            pieces[0] = [[360 - size / 2, 360], [0, size / 2]]
            return pieces
        }
    }

    //return true if an angle is inside a given range (ie. angle = 45, range = [0, 90], return => true)
    static isAngleInsideRange(angle, range){
        //range should be an array if the smaller degree at index one for interior angle
        if(angle >= range[0] && angle <= range[1]){
            return true
        }
        return false
    }

    //push previous cursor time into array
    static pushPrevTime(instaTime){
        //determine the max number of frames/array slots to save
        const maxPrev = Physics.prevCursorMaxTime
        let cursL = Physics.prevCursorTime.length

        //if the number of saved indexs is less than the max number indexs allowed to be saved
        if(cursL < maxPrev){
            Physics.prevCursorTime[cursL] = instaTime
        } else {
            //remove the last position of the array
            Physics.prevCursorTime.shift()
            
            //add current position in array
            cursL  = Physics.prevCursorTime.length
            Physics.prevCursorTime[cursL] = instaTime
        }
    }

    //cursor data that needs to be updated
    static updateCursorStats(){

        //get the current position of the cursor
        Physics.pushPrevTime({ 
            x: Physics.cursorStat.x,
            y: Physics.cursorStat.y 
        })

        //save x and y velocity of cursor
        Physics.cursorStat.vX = Physics.getCursorVelocity().vX
        Physics.cursorStat.vY = Physics.getCursorVelocity().vY
    }

    //reset timer
    static updateTimer(){
        Physics.timer = 0
    }
}

console.log('physics.js declared') //runs if class is instantiated properly