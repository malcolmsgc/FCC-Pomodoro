/* MOVE TO MODULE COUNTDOWNTIMER */

/* 
TO DO: when >99:99 add another timer slot
*/

//import CountDownTimer from "./components/CountDownTimer";

class CountDownTimer {

    constructor(settings = {rolling: false}) {
        this.timerIntervalID; //var used to clear interval
        this.numDisplaySlots; //used to check how much 0 padding is required
        this.settings = settings;
    }

    _setNodeRefs(selectorsObj = {mins: "", secs: ""}) {
        const selectors = Object.keys(selectorsObj);
        const nodeArray = selectors.map(
            (key) => Array.from(document.querySelectorAll(selectorsObj[key]))
        );
        const [minsNodes, secsNodes] = nodeArray;
        this.secsNodes = secsNodes.reverse();
        this.minsNodes = minsNodes.reverse();
        return [...this.secsNodes, ...this.minsNodes];
    }


//TO DO - ensure nodes are obtained after num of frames for mins is determined
    startCountDown(secs) {
        clearInterval(this.timerIntervalID);
        this.countDownFinished = false;
        this.firstRoll = true;
        // if counter doesn't roll, destructure node refs into default vars
        // and pull in nodes held on class object
        // as arrays of nodes
        // to pass down to display and display helper functions
        if (!this.settings.rolling) {
            this._setNodeRefs(
                // argument is obj with css selectors as values
                {
                minsRef: ".count-down .mins span:first-child",
                secsRef: ".count-down .secs span:first-child"
            }); //adds arrays of node refs to prototype
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
                            this.countDownFinished = true;
                            return false;
                        }
                        this.sand = secsRemaining;
                        this._displayCountDown(secsRemaining);
                    }, 1000); //run every second to update display
        return this.sand;
    }

    resetCountDown() {
        this.startCountDown(0);
        if (this.settings.rolling) {
            [...this.minsNodes, ...this.secsNodes].forEach( 
                (slot) => { this._transitionFrames(0, 0, slot); }
            );
        }
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
  
    //TO DO evaluate if it makes sense to join handleslots and populateframes into a single function
    //May depened on whether frames can get refactored out
    _handleSlots(timeDigitArray = ["0","0","0","0"]) {
        let nodeRefs, minsFrames, secsFrames, framesArray;
        //split time strings into arrays
        if (this.settings.rolling) {
            // add parent nodes to array
            nodeRefs = this._setNodeRefs(
                // arg is object with selectors for querySelectorAll
                {
                minsRef: ".count-down .mins",
                secsRef: ".count-down .secs"
            });
            framesArray = this._getSlotFrames(nodeRefs);        
        }
        else {
            nodeRefs = [...this.secsNodes, ...this.minsNodes]; //TO DO  check non-rolling implem to see if this is nec or correct
        }
        this._populateFrames(nodeRefs, framesArray, timeDigitArray);
        return;
    }

    _populateFrames (nodeRefs, framesArray, timeDigitArray) { 
        //copy secs frame refs into new array
        const rolling = this.settings.rolling;
        const transitionObject = {};
        let newSecsTop, newSecsBottom; 
        //frames should match time digits being passed in
        if (nodeRefs.length !== timeDigitArray.length) 
            console.error(new Error ('Number of digits does not match number of counter frames'));
        if (rolling) {
            //handle seconds ones slot
            const secs1Frames = framesArray[0];
            const currentSecs = timeDigitArray[0];
            newSecsTop = this.firstRoll ? currentSecs : 
                (currentSecs === "9") ? "0" : (parseInt(currentSecs) + 1).toString();
            newSecsBottom = currentSecs;
            secs1Frames[0].textContent = newSecsTop;
            secs1Frames[1].textContent = newSecsBottom;
            //populate remaining frames
            for (let i = 1,
                currenttime,
                timeTop,
                timeBottom,
                maxVal,
                numDigits = timeDigitArray.length; 
                i < numDigits; i++) {
                    //set max value for minutes slot or other decimal based slots
                    maxVal = (i === 1) ? "5" : "9";
                    currenttime = timeDigitArray[i];
                    timeTop = currenttime;
                    timeBottom = (currenttime === "0") ? maxVal : (parseInt(currenttime) - 1).toString();
                    transitionObject[`timeslot${i+1}`] = {
                        timeTop,
                        timeBottom,
                        parentNode: nodeRefs[i]
                    }
                    if (this.firstRoll) {
                        framesArray[i][0].textContent = timeTop;
                        framesArray[i][1].textContent = timeBottom;
                    }
                }
                //transition ones seconds frames
                if (!this.firstRoll) this._transitionOnesSecSlot(newSecsBottom, nodeRefs[0]);
                // check for 0 value in other frames, transition if nec 
                // and use recursion to cascade 
                // from tens second slot to highest time digit
                this._cascadeTransition(0, timeDigitArray, transitionObject);
                // update firstroll flag
                if (this.firstRoll) {
                    this.firstRoll = false;
                    return;
                }
            }
        //non-rolling implementation
        else {
            // loop through nodes and assign content
            // node should be top frame only as non-rolling querySelector gets first child
            nodeRefs.forEach(
                (node, i) => { node.textContent = timeDigitArray[i]; }
            );

        }
    }

    // uses recursion to cascade frame transition to highest time digit
    // non-strict condition to enable number and string types
    _cascadeTransition(index, timeDigitArray, transitionObject) {
        //different trigger value for tens slot for seconds
        const triggerVal = (index === 1) ? "5" : "9";
        // non-strict condition to enable number and string types
        if (timeDigitArray[index] == triggerVal) {
            //transition frames on next highest slot
            // index offset by two to match non-zero index of timeslot
            const {timeTop, timeBottom, parentNode} = transitionObject[`timeslot${index+2}`];
            console.log ({timeTop, timeBottom, parentNode});
            this._transitionFrames(timeTop, timeBottom, parentNode);
            console.log(`rolling slot ${index + 2}`);
            //stop transition at highest slot
            if (index >= timeDigitArray.length - 2) {
                return;
            }
            this._cascadeTransition(index + 1, timeDigitArray, transitionObject);
        }
    }
    
    _transitionOnesSecSlot (bottom, slotRef) {
        const frames = [].concat(slotRef.childNodes[0], slotRef.childNodes[1]);
        const newFrames = `<span>${bottom}</span><span>${bottom}</span>`;
        frames.forEach(
            (node) => {
                node.classList.add('rolling');
            }
        );
        setTimeout( () => { slotRef.innerHTML = newFrames; }, 600 );
    }
    
    _transitionFrames (top, bottom, slotRef) {
        const frames = [].concat(slotRef.childNodes[0], slotRef.childNodes[1]);
        const newFrames = `<span>${top}</span><span>${bottom}</span>`;
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

class SetTimer {

    constructor(defaultInMins, { minsNode, secsNode } = {}) {
        this.defaultInSecs = Math.round(defaultInMins * 60);
        this.secsNode = secsNode;
        this.minsNode = minsNode;
    }

    displayTime(totalSecs = this.defaultInSecs) {
        const mins = this._padNum( Math.floor( totalSecs / 60 ) );
        const secs = this._padNum(totalSecs % 60);
        this.minsNode.textContent = mins;
        this.secsNode.textContent = secs;
        return totalSecs;
    }

    incrementSecs(totalSecs){
        return this.displayTime(++totalSecs);
    }
    
    decrementSecs(totalSecs){
        if (totalSecs > 0) return this.displayTime(--totalSecs);
        else return totalSecs;
    }

    incrementMins(totalSecs){
        return this.displayTime(totalSecs + 60);
    }
    
    decrementMins(totalSecs){
        if (totalSecs >= 60) return this.displayTime(totalSecs - 60);
        else if (totalSecs > 0) return this.displayTime(0);
        else return 0;
    }

    quickAddMinutes(minsToAdd, totalSecs) {
        return this.displayTime(totalSecs + (minsToAdd * 60));
    }

    setToDefault() {
        return this.displayTime(this.defaultInSecs);
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

}

/* -------------------------------- */
/*       ENDOF SETTIMER CLASS       */
/* -------------------------------- */


class Pomodoro extends CountDownTimer {

    constructor(defaultWorkMins, defaultBreakMins){
        super({rolling: Modernizr.csstransitions});
        this.defaultWorkMins = defaultWorkMins;
        this.defaultBreakMins = defaultBreakMins;
    }

    init() {
        //  Initialise Control Panel
        //      Work-for set time controls
        const workForMins = document.querySelector(".set-timer.work-for .mins");
        const workForSecs = document.querySelector(".set-timer.work-for .secs");
        const setWorkFor = new SetTimer(this.defaultWorkMins, {minsNode: workForMins, secsNode: workForSecs});
        this.workForTime = setWorkFor.setToDefault();
        //      Break-for set time controls
        const breakForSecs = document.querySelector(".set-timer.break-for .secs");
        const breakForMins = document.querySelector(".set-timer.break-for .mins");
        const setBreakFor = new SetTimer(this.defaultBreakMins, {minsNode: breakForMins, secsNode: breakForSecs});
        this.breakForTime = setBreakFor.setToDefault();
        //  Add listeners
        //          Quick add buttons
        this._quickAddBtnListeners("work-for", "workForTime", setWorkFor);
        this._quickAddBtnListeners("break-for", "breakForTime", setBreakFor);
        //      setTimer reset buttons
        this._timerResetListeners(setWorkFor, setBreakFor);
        //      increment and decrement buttons
        const workForCrementBtns = document.querySelectorAll(`.work-for .crement > div`);
        const breakForCrementBtns = document.querySelectorAll(`.break-for .crement > div`);
        this.continuousPressId;
        // --------------------------------------------------------------------------------
        // TO DO -- REFACTOR THIS. I'M SURE IT CAN BE CLEANER
        // work-for functions 
        // all are arrow funcs so as to be bound to class scope - 'this' keyword relies on it
        const continuousPressMinsUpWF = () => {
            this.workForTime = setWorkFor.incrementMins(this.workForTime);
        },
        continuousPressMinsDownWF = () => {
            this.workForTime = setWorkFor.decrementMins(this.workForTime);
        },
        continuousPressSecsUpWF = () => {
            this.workForTime = setWorkFor.incrementSecs(this.workForTime);
        },
        continuousPressSecsDownWF = () => {
            this.workForTime = setWorkFor.decrementSecs(this.workForTime);
        },
        // break-for functions
        //  -- all declared as consts
        continuousPressMinsUpBF = () => {
            this.breakForTime = setBreakFor.incrementMins(this.breakForTime);
        },
        continuousPressMinsDownBF = () => {
            this.breakForTime = setBreakFor.decrementMins(this.breakForTime);
        },
        continuousPressSecsUpBF = () => {
            this.breakForTime = setBreakFor.incrementSecs(this.breakForTime);
        },
        continuousPressSecsDownBF = () => {
            this.breakForTime = setBreakFor.decrementSecs(this.breakForTime);
        };
        
        workForCrementBtns[0].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressMinsUpWF); });
        workForCrementBtns[0].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressMinsUpWF); });
        workForCrementBtns[1].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressMinsDownWF); });
        workForCrementBtns[1].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressMinsDownWF); });
        workForCrementBtns[3].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressSecsUpWF); });
        workForCrementBtns[3].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressSecsUpWF); });
        workForCrementBtns[4].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressSecsDownWF); });
        workForCrementBtns[4].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressSecsDownWF); });
        breakForCrementBtns[0].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressMinsUpBF); });
        breakForCrementBtns[0].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressMinsUpBF); });
        breakForCrementBtns[1].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressMinsDownBF); });
        breakForCrementBtns[1].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressMinsDownBF); });
        breakForCrementBtns[3].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressSecsUpBF); });
        breakForCrementBtns[3].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressSecsUpBF); });
        breakForCrementBtns[4].addEventListener("mousedown", () => { this._continuousPressCrement(true, continuousPressSecsDownBF); });
        breakForCrementBtns[4].addEventListener("mouseup", () => { this._continuousPressCrement(false, continuousPressSecsDownBF); });
        // --------------------------------------------------------------------------------
        //      start/stop count-down button
        const startStopBtn = document.querySelector(".count-down-ctrls .main-btn");
        startStopBtn.addEventListener("click", () => {
            this._startStop(startStopBtn)} );
        //      reset count-down button
        const countDownResetBtn = document.querySelector('.reset.main-reset');
        countDownResetBtn.addEventListener('click', () => { 
            this.resetCountDown(); 
            this.sand = null;
            //stop work break cadence
            clearInterval(this.workBreakIntervalID);
        } );
        // MOBILE UI
        //  hide timer controls
        const setTimers = document.querySelectorAll('.set-timer');
        let userInputTimeout = null;
        setTimers.forEach(
            (timer) => { timer.addEventListener("click", 
                (e) => {
                    e.stopPropagation;
                    if (timer.classList.contains("open")) {
                        if (userInputTimeout) {
                            clearTimeout(userInputTimeout);
                            userInputTimeout = setTimeout( () => timer.classList.remove("open"), 5000);
                        }
                        return;
                    }
                    else {
                        timer.classList.add("open");
                    }
                    if (this.isCountingDown) {
                        userInputTimeout = setTimeout( () => timer.classList.remove("open"), 5500);
                        console.log({userInputTimeout});
                    }
                });
            }
        );
    }
    /* -- end of init method -- */

    
    _quickAddBtnListeners(selectorSnippet, timeVarAsStr, setTimer) {
        //internal functions are arrow functions so as to inherit scope from caller
        const allQuickAddBtns = document.querySelectorAll(`.${selectorSnippet} div[data-addmins]`);
        allQuickAddBtns.forEach(
            (btn) => { btn.addEventListener("click",
            (e) => {
                e.stopPropagation;
                this[timeVarAsStr] = setTimer.quickAddMinutes(btn.dataset.addmins, this[timeVarAsStr]);
            }, {capture : false })
        }
    );
}

_startStop(btnNode) {
    console.log(this.workForTime, this.breakForTime);
    const setTimers = document.querySelectorAll('.set-timer');
    //handle button text
    if (this.isCountingDown === null || this.isCountingDown === undefined) this.isCountingDown = false;
    // start countdown cadence
    // SAND = seconds outstanding of current countdown, regardless of whether work or break time
    // initialise sand value
    this.sand = (this.sand) ? this.sand : this.workForTime;
    if (!this.isCountingDown) {
        setTimers.forEach(
            (timer) => { 
                if (timer.classList.contains("open")) { timer.classList.remove("open") }
            }  
        );
        this.startCountDown(this.sand);
        this.workBreakIntervalID = setInterval(() => { this._workBreakCadence() }, 1000);
    }
    else {
        //stop count down
        clearInterval(this.timerIntervalID);
        //stop work break cadence
        clearInterval(this.workBreakIntervalID);
    }
    this.isCountingDown = !this.isCountingDown;
    btnNode.textContent = this.isCountingDown ? "Pause" : "Start";
}

_workBreakCadence() {
    // initialise atWork boolean
    if (this.atWork === null || this.atWork === undefined) this.atWork = true;
    if (this.countDownFinished) {
        this._playSound();
        //swap boolean value
        this.atWork = !this.atWork; 
        //reset flag
        this.countDownFinished = false;
        if (this.atWork) {
            console.log("Let's get to work");
            this.startCountDown(this.workForTime);
        }
        else {
            console.log("Phew, break time!");
            this.startCountDown(this.breakForTime);
        }
    };
    console.log(this.atWork, this.sand);
}

_playSound() {
    //get audio reference
    const beep = document.querySelector("audio.beep");
    beep.play();
}

_timerResetListeners(setWorkFor, setBreakFor) {
    //internal functions are arrow functions so as to inherit scope from caller
    const workForResetBtn = document.querySelector('.work-for .reset-btn');
    const breakForResetBtn = document.querySelector(`.break-for .reset-btn`);
    workForResetBtn.addEventListener("click",
    () => { this.workForTime = setWorkFor.setToDefault(); });
    breakForResetBtn.addEventListener("click", 
    () => { this.breakForTime = setBreakFor.setToDefault(); });
}

_continuousPressCrement(keyDown, callback) {
    if (!keyDown) {
        clearInterval(this.continuousPressId);
        this.continuousPressId = null;
    }
    else {
        if (this.continuousPressId) return; //prevent two buttons running at same time
        callback();
        this.continuousPressId = setInterval(callback, 300)
    }
}


}

/* -------------------------------- */
/*       ENDOF POMODORO CLASS       */
/* -------------------------------- */

const pomodoro = new Pomodoro(0.2,0.1);
pomodoro.init();