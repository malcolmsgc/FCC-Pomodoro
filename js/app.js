/* MOVE TO MODULE COUNTDOWNTIMER */
//import CountDownTimer from "./components/CountDownTimer";

class CountDownTimer {

    constructor(settings = {rolling: true}) {
        this.timerIntervalID; //var used to clear interval
        this.numDisplaySlots; //used to check how much 0 padding is required
        this.settings = settings;
    }

    _setNodeRefs(selectorsObj = {
                                minsRef: ".count-down .mins span:first-child",
                                secsRef: ".count-down .secs span:first-child"
                            }) {
        const selectors = Object.keys(selectorsObj);
        const nodeArray = selectors.map(
            (key) => Array.from(document.querySelectorAll(selectorsObj[key]))
        );
        [this.minsNodes, this.secsNodes] = nodeArray;
        console.log(nodeArray);
        return nodeArray;
    }


//TO DO - esnure nodes are obtained after num of frames for mins is determined
    startCountDown(secs) {
        clearInterval(this.timerIntervalID);
        // if counter doesn't roll, destructure node refs into default vars
        // and pull in nodes held on class object
        // as arrays of nodes
        // to pass down to display and display helper functions
        if (!this.settings.rolling) {
            this._setNodeRefs(); //adds arrays of node refs to prototype
        }
        this.numDisplaySlots = undefined;
        const   now = Date.now(),
                timeAtEnd = now + (secs * 1000); //convert secs to milliseconds
                this._displayCountDown(secs);
                this.timerIntervalID = setInterval(
                    () => {
                        const secsRemaining = Math.round((timeAtEnd - Date.now()) / 1000);
                        if (secsRemaining < 0) {
                            clearInterval(this.timerIntervalID);
                            return;
                        }
                        this._displayCountDown(secsRemaining);
                    }, 1000); //run every second to update display
    }

    _displayCountDown(seconds, {noNeg , padTo, returnAsNum} = {
        noNeg: true,
        padTo: 2,
        returnAsNum: false}) {
        let mins = Math.floor(seconds / 60),
            secs = seconds % 60,
            padMinsTo = this.numDisplaySlots || padTo; //takes value of max slots needed for minutes
        //if statement runs on first occasion
        //js allows more than two display slots. UI may or may not support more than 2
        if (mins > 60 && !(this.numDisplaySlots)) {
            console.warn("No support for hours. Minutes exceed 1 hour.");
            padMinsTo = (mins.toString().length < padTo) ? padTo : mins.toString().length;
            console.log(padMinsTo);
            this.numDisplaySlots = padMinsTo; // numDisplaySlots used as flag to run if statement
            console.log(this.numDisplaySlots);
        }
        if (noNeg) {
            mins = Math.abs(mins);
            secs = Math.abs(secs);
        }
        secs = this._padNum(secs, padTo);
        mins = this._padNum(mins, padMinsTo);
        console.log({mins, secs});
        this._handleSlots({mins, secs});
        if (returnAsNum) {
            secs = parseFloat(secs);
            mins = parseFloat(mins);
        }
        return {mins, secs};
    }

    _padNum(num, padDepth = 2) {
        if (typeof num === "number") {
            num = num.toString();
        }
        while (num.length < padDepth) {
            num = `0${num}`;
        }
        return num;
    }

    // rolling is boolean to allow setting of rolling counter. 
    // Takes default from settings obj passed into constructor    
    _handleSlots(timeDigitObj = {}) {
        //destructure frames object into vars
        const   minsFrames = this.minsNodes,
                secsFrames = this.secsNodes;
        //split time strings into arrays
        let { mins, secs } = timeDigitObj;
        mins = mins.split('');
        secs = secs.split('');
        console.log({ secsFrames, secs });
        this._populateFrames(secsFrames, secs);
        this._populateFrames(minsFrames, mins);
        return;
    }

    _populateFrames (nodeArray, timeArray) { 
        const rolling = this.settings.rolling;
        //frames should match time digits being passed in
        if (nodeArray.length !== timeArray.length) 
            console.error(new Error ('Number of digits does not match number of counter frames'));
        //loop through nodes for time category and set values for transition frames
        nodeArray.forEach( 
        (node, i) => {
            let currenttime = timeArray[i];
            node.textContent = currenttime;
            if (rolling) {
                node[0].textContent = currenttime;
                let newtime = (parseInt(currenttime) - 1).toString();
                newtime = (newtime < 0) ? "9" : newtime;
                node[1].textContent = newtime;
                console.log(i);
                this._transitionFrames(currenttime, newtime);
            }
            
        }
    );
    }

//recursion to pass trigger down a chain?
    _transitionFrames (top, bottom) {
        //let top, bottom;
        const newFrames = `<span>${top}</span><span>${bottom}</span>`;
        //handle seconds
            //grab nodes
        const onesFrames = Array.from(document.querySelectorAll(".count-down .secs:last-child span"));
        const onesFramesParent = document.querySelector(".count-down .secs:last-child");
        onesFrames.forEach(
            (node, i) => {
                //debugger;
                node.classList.add('rolling');
                console.log(top, bottom);
            }
        );
        setTimeout( () => { onesFramesParent.innerHTML = (newFrames); }, 500 );
        //handle other scenarios
        // if (node[0].textContent === "0") {

        // }
        // else {
        //     node.classList.add(rolling);
        //     setTimeout(() => {node.classList.remove(rolling)}, duration)
        // }
    }

}

/* -------------------------------- */
/* ENDOF COUNTDOWNTIMER CLASS       */
/* -------------------------------- */

const pomodoro = new CountDownTimer({rolling: false});