/* MOVE TO MODULE COUNTDOWNTIMER */
//import CountDownTimer from "./components/CountDownTimer";

class CountDownTimer {

    constructor() {
        this.timerIntervalID; //var used to clear interval
        this.numDisplaySlots; //used to check how much padding is required
        
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
        console.log({mins, secs});
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

    _handleSlots(timeDigitObj = {}, framesObj = {}) {
        //split time strings into arrays
        let { mins, secs } = timeDigitObj;
        mins = mins.split('');
        secs = secs.split('');
        //get nodes
        let { minsFrames, secsFrames } = framesObj;
        console.log({ minsFrames, secsFrames });
        // const callback = (nodeArray, timeArray) => { nodeArray.forEach( 
        //     (node, i) => {
        //         let currenttime = timeArray[i];
        //         let newtime = (parseInt(currenttime) - 1).toString();
        //         newtime = (newtime < 0) ? "9" : newtime;
        //         let timeSlotCurrent = node.childNodes[0];
        //         let timeSlotNew = node.childNodes[1];
        //         timeSlotCurrent.textContent = currenttime;
        //         timeSlotNew.textContent = newtime;
        //     }
        // )};

        // callback(secsNodes, secs);
        // callback(minsNodes, mins);
       //console.log({secs, secsNodes});


    }
}

/* -------------------------------- */
/* ENDOF COUNTDOWNTIMER CLASS       */
/* -------------------------------- */

const pomodoro = new CountDownTimer();