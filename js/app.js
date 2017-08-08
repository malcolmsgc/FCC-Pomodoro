/* MOVE TO MODULE COUNTDOWNTIMER */
//import CountDownTimer from "./components/CountDownTimer";

class CountDownTimer {

    constructor(settings = {rolling: true}) {
        this.timerIntervalID; //var used to clear interval
        this.numDisplaySlots; //used to check how much 0 padding is required
        this.settings = settings;
    }

    _setNodeRefs(selectorsObj = { 
                                timerRef: ".count-down" ,
                                minsRef: ".count-down .mins",
                                secsRef: ".count-down .secs"
                            }) {
        const selectors = Object.keys(selectorsObj);
        selectors.forEach(
            (key) => this[key] = Array.from(document.querySelectorAll(selectorsObj[key]))
        );
        return selectors;
    }


//to do - esnure nodes are obtained after num of frames for mins is determined
    startCountDown(secs) {
        clearInterval(this.timerIntervalID);
        // destructure node refs into default vars
        // and pull in nodes held on class object
        // as arrays of nodes
        // to pass down to display and display helper functions
        const nodeRefs = this._setNodeRefs();
        const   [timerRef, minsRef, secsRef] = nodeRefs,
                minsNodes = this[minsRef],
                secsNodes = this[secsRef],
                getSlotFrames = (nodeArray) => nodeArray.map( 
                                    (node) => [node.childNodes[0], node.childNodes[1]]
                                ),
                minsFrames = getSlotFrames(minsNodes),                
                secsFrames = getSlotFrames(secsNodes),                
                allFrames = {minsFrames, secsFrames};
        this.numDisplaySlots = undefined;
        const   now = Date.now(),
                timeAtEnd = now + (secs * 1000); //convert secs to milliseconds
        this._displayCountDown(secs, {nodeRefs: allFrames});
        this.timerIntervalID = setInterval(
            () => {
                const secsRemaining = Math.round((timeAtEnd - Date.now()) / 1000);
                if (secsRemaining < 0) {
                    clearInterval(this.timerIntervalID);
                    return;
                }
                this._displayCountDown(secsRemaining, {nodeRefs: allFrames});
                }
        , 1000) //run every second to update display
    }

    _displayCountDown(seconds, {nodeRefs, noNeg , padTo, returnAsNum} = {
        nodeRefs: [],
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
        console.log({mins, secs, nodeRefs});
        this._handleSlots({mins, secs}, nodeRefs);
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
    _handleSlots(timeDigitObj = {}, framesObj = {}, rolling = this.settings.rolling) {
        //destructure frames object into vars
        const { minsFrames, secsFrames } = framesObj;
        console.log({ minsFrames, secsFrames });
        //split time strings into arrays
        let { mins, secs } = timeDigitObj;
        mins = mins.split('');
        secs = secs.split('');
        if (rolling) {
            //TO DO finish function which will take in a trigger value
            // and transition frames on trigger value (6 for 2nd column of secs, 9 otherwise)
            this._populateFrames(secsFrames, secs, true);
            this._populateFrames(minsFrames, mins, true);
        }
        else {
            this._populateFrames(secsFrames, secs, false);
            this._populateFrames(minsFrames, mins, false);
        }
       //console.log({secs, secsNodes});
    }

    //TO DO refactor passing of noderefs - a bit superfluous if it needs to be recalculated every second
    //AND it is bombing clock on roll
    // rolling is boolean to allow setting of rolling counter. May need to be shut off if it kills perf.
    _populateFrames (nodeArray, timeArray, rolling) { 
                    //frames should match time digits being passed in
                    if (nodeArray.length !== timeArray.length) 
                        console.error(new Error ('Number of digits does not match number of counter frames'));
                    //loop through nodes for time category and set values for transition frames
                    nodeArray.forEach( 
                    (node, i, arr) => {
                        let newtime;
                        let currenttime = timeArray[i];
                        node[0].textContent = currenttime;
                        if (rolling) {
                            newtime = (parseInt(currenttime) - 1).toString();
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
                debugger;
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

const pomodoro = new CountDownTimer({rolling: true});