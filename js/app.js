/* MOVE TO MODULE COUNTDOWNTIMER */
//import CountDownTimer from "./components/CountDownTimer";

class CountDownTimer {

    constructor(settings = {rolling: false}) {
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
        const [minsNodes, secsNodes] = nodeArray;
        this.secsNodes = secsNodes.reverse();
        this.minsNodes = minsNodes.reverse();
        return [...this.secsNodes, ...this.minsNodes];
    }


//TO DO - esnure nodes are obtained after num of frames for mins is determined
    startCountDown(secs) {
        clearInterval(this.timerIntervalID);
        this.firstRoll = true;
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
        secs = this._padNum(secs, padTo)
                    .split('')
                    .reverse();
        mins = this._padNum(mins, padMinsTo)
                    .split('')
                    .reverse();
        const timeDigitArray = [...secs, ...mins]
        console.log(timeDigitArray);
        this._handleSlots(timeDigitArray);
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

    // helper function to collect frames that sit in
    // parent div that is visible counter slot
    _getSlotFrames(nodeArray) {
        return nodeArray.map( 
                    (node) => [].concat(node.childNodes[0], node.childNodes[1])
        );
    }

    // rolling is boolean to allow setting of rolling counter. 
    // Takes default from settings obj passed into constructor    
    _handleSlots(timeDigitArray = ["0","0","0","0"]) {
        let nodeArray, minsFrames, secsFrames;
        //split time strings into arrays
        if (this.settings.rolling) {
            // add parent nodes to array
            const nodeRefs = this._setNodeRefs(
                // arg is object with selectors for querySelectorAll
                {
                minsRef: ".count-down .mins",
                secsRef: ".count-down .secs"
            })
            nodeArray = this._getSlotFrames(nodeRefs);        
        }
        else {
            nodeArray = [...this.secsNodes, ...this.minsNodes]; //TO DO  check non-rolling implem to see if this is nec or correct
        }
        this._populateFrames(nodeArray, timeDigitArray);
        return;
    }

    _populateFrames (nodeArray, timeDigitArray) { 
        //copy secs frame refs into new array
        const secs1Frames = [...nodeArray[0]];
        const rolling = this.settings.rolling;
        const transitionObject = {};
        let newSecsTop, newSecsBottom; //currenttime reused for slots so could cause race condition
        //frames should match time digits being passed in
        if (nodeArray.length !== timeDigitArray.length) 
            console.error(new Error ('Number of digits does not match number of counter frames'));
        //handle seconds ones slot
        if (rolling) {
            const currentSecs = timeDigitArray[0];
            newSecsTop = this.firstRoll ? currentSecs : 
                (currentSecs === "9") ? "0" : (parseInt(currentSecs) + 1).toString();
            newSecsBottom = currentSecs;
            console.log({newSecsTop, newSecsBottom});
            secs1Frames[0].textContent = newSecsTop;
            secs1Frames[1].textContent = newSecsBottom;
            //populate remaining frames
            for (let i = 1,
                currenttime,
                newtimeTop,
                newtimeBottom,
                numDigits = timeDigitArray.length; 
                i < numDigits; i++) {
                    currenttime = timeDigitArray[i];
                    newtimeTop = currenttime;
                    newtimeBottom = (parseInt(currenttime) - 1).toString();
                    console.log({newtimeTop, newtimeBottom})
                    nodeArray[i][0].textContent = newtimeTop;
                    nodeArray[i][1].textContent = newtimeBottom;
                    console.log(timeDigitArray[i], nodeArray[i]);
                    transitionObject[`timeslot${i}`] = {
                        newtimeTop,
                        newtimeBottom,
                        parentNode: nodeArray[i]
                    }
                }
                if (this.firstRoll) {
                    this.firstRoll = false;
                    console.log('first roll done');
                    return;
                }
            //transition ones seconds frames
            if (!this.firstRoll) this._transitionFrames(newSecsTop, newSecsBottom, this.secsNodes[0]);
            // check for 0 value in other frames, transition if nec 
            // and use recursion to cascade 
            // from tens second slot to highest time digit
            this._cascadeTransition(0, timeDigitArray, transitionObject);
            }
        //non-rolling implementation
        else {
                // loop through timeArray and assign content to top frame only
        }
    }

    // uses recursion to cascade frame transition to highest time digit
    // non-strict condition to enable number and string types
    _cascadeTransition(index, timeDigitArray, transitionObject) {
        // non-strict condition to enable number and string types
        if (timeDigitArray[index] == "0") {
            //transition frames on next highest slot
            const {newtimeTop, newtimeBottom, parentNode} = transitionObject[`timeslot${index+1}`]
            this._transitionFrames(newtimeTop, newtimeBottom, parentNode);
            console.log(`rolling slot ${index + 1}`);
            //stop transition at highest slot
            if (index >= timeDigitArray.length - 1) {
                return;
            }
            this._cascadeTransition(index + 1, timeDigitArray);
        }
    }

//recursion to pass trigger down a chain?
    _transitionFrames (top, bottom, slotRef) {
        const frames = [].concat(slotRef.childNodes[0], slotRef.childNodes[1]);
        const newFrames = `<span>${bottom}</span><span></span>`;
        frames.forEach(
            (node) => {
                node.classList.add('rolling');
            }
        );
        setTimeout( () => { slotRef.innerHTML = newFrames; }, 600 );
    }

}

/* -------------------------------- */
/* ENDOF COUNTDOWNTIMER CLASS       */
/* -------------------------------- */

const pomodoro = new CountDownTimer({rolling: true});