/* 
TO DO: when >99:99 add another timer slot
*/

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

export default CountDownTimer;