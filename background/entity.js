//inhertitance and abstraction used here
//deskpet at the end of the day is just a canavas that animates
//a chair is a deskpet that doesn't move
class Chair extends deskPet{
    constructor(name, height, width){
        super(name, height, width)
    }
    mochiAI(){
        //take away the ai from the chair
        //because why would we need sentient chairs
    }
    //polymorphism is used here to because the chair has a unique animations
    animate(){ 
        const movingIn = this.getMovementDirect()
        // const state = this.grabPetState()
        //flip the pet to move in the proper x-direction
        if(movingIn.left != null){
            if (movingIn.left){
                this.mirrorPet('left')
            } else {
                this.mirrorPet('right')
            }    
        } 
        
        //in the future there might be multiple types of the same animation 
        //(this represents which type of the same animation to use)
        let type = 0 
        
        // const image = this.petHTML.querySelector('.best-buddy-image')
        const image = new Image()
        const cur = this.physics.setTempTime.curFrameNum + 1 //add 1 to current number of frames because image files start counting at 1
        const state = this.grabPetState()

        this.curAnimation.prev = this.curAnimation.name //save animation name before declaring new animation
        if(!this.curAnimation.ani){
            this.curAnimation.ani = true //declare the start of a new animation
            this.curAnimation.name = state// save current animation name
        }
        if(this.curAnimation.ani){this.physics.setTempTime.counter++}

        // console.log(this.physics.setTempTime)
        // console.log(this.curAnimation)
        switch(this.curAnimation.name){
            case 'enter':
                this.physics.setSetTempTime(cur, 15, 10)
                break
            case 'air':
                this.physics.setSetTempTime(cur, 1, 1)
                break
        }
            //uncomment this when all the animaations are done
        if(this.curAnimation.name != null){
            //set the animation name to enter because we reuse the first frame of the enter aniamtion
            if( this.curAnimation.name == 'air'){
                this.curAnimation.name = 'enter'
            }
            //draw image based on
            //type of animation
            //the name of animation
            //the frame of the animation
            image.src = chrome.runtime.getURL(`images/ani/type (${type})/chair/${this.curAnimation.name}/step (${cur}).png`)

            //draw imageo onto the screen
            this.drawImage(image, true)
        }
        
        this.checkAniCounter() //check if the animation counter has reached a certain point
        
    }

    //get the state of the chair
    //this is unique to the chair
    grabPetState(){
        if(!this.isOnGround()){
            return 'air'
        }
        if(this.curAnimation.prev == 'air'){
            return 'enter'
        }
        return null
    }
}

console.log('entity.js delcared') //runs if class is instantiated properly

const t2 = performance.now()

console.log('instantiated in ' + (t2 - t1) + 'ms') //see how long it took to load code

