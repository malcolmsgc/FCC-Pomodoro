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
        let minsFrames, secsFrames;
        if (this.settings.rolling) {
                // helper function to collect frames that sit in
                // parent div that is visible counter slot
                const getSlotFrames = (nodeArray) => nodeArray.map( 
                (node) => [node.childNodes[0], node.childNodes[1]]
            )
            // add parent nodes to array
            const nodeRefs = this._setNodeRefs(
                // arg is object with selectors for querySelectorAll
                {
                minsRef: ".count-down .mins",
                secsRef: ".count-down .secs"
            })
            console.log(nodeRefs);
            const   [minsParentNodes, secsParentNodes] = nodeRefs;
            minsFrames = getSlotFrames(minsParentNodes).reverse(),                
            secsFrames = getSlotFrames(secsParentNodes).reverse(); 
        }
        else {
            minsFrames = this.minsNodes.reverse(),
            secsFrames = this.secsNodes.reverse();
        }
        //split time strings into arrays
        let { mins, secs } = timeDigitObj;
        mins = mins.split('').reverse();
        secs = secs.split('').reverse();
        console.log({ secsFrames, secs });
        this._populateFrames(secsFrames, secs);
        this._populateFrames(minsFrames, mins);
        return;
    }

    _populateFrames (nodeArray, timeArray) { 
        const rolling = this.settings.rolling;
        let currenttime, newtime;
        console.log(nodeArray);
        //frames should match time digits being passed in
        if (nodeArray.length !== timeArray.length) 
            console.error(new Error ('Number of digits does not match number of counter frames'));
        //loop through nodes for time category and set values for transition frames
        nodeArray.forEach( 
        (node, i) => {
            currenttime = timeArray[i];
            node.textContent = currenttime;
            if (rolling) {
                //debugger;
                node[0].textContent = currenttime;
                newtime = (parseInt(currenttime) - 1);
                newtime = (newtime < 0) ? "9" : newtime.toString();
                node[1].textContent = newtime;
                console.log(i);
            }
        });
        //debugger;
        if (rolling) this._transitionFrames(currenttime, newtime, this.secsNodes[1], nodeArray[1]);
    }

//recursion to pass trigger down a chain?
    _transitionFrames (top, bottom, slotRef, frames) {
        console.log(slotRef);
        console.log(frames);
        console.log({top, bottom});
        const newFrames = `<span>${top}</span><span>${bottom}</span>`;
        //handle seconds
            //grab nodes

console.log('roll');

        // frames.forEach(
        //     (node, i) => {
        //         //debugger;
        //         node.classList.add('rolling');
        //         console.log(top, bottom);
        //     }
        // );
        setTimeout( () => { console.log({top, bottom}); slotRef.innerHTML = (newFrames); }, 500 );
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