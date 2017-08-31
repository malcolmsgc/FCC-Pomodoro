import CountDownTimer from "./CountDownTimer";
import SetTimer from "./SetTimer";

class Pomodoro extends CountDownTimer {
    
        constructor(defaultWorkMins, defaultBreakMins, ceilingInSecs) {
            super({rolling: Modernizr.csstransitions || false});
            this.defaultWorkMins = defaultWorkMins;
            this.defaultBreakMins = defaultBreakMins;
            this.longBreakMultiplier = 3;
            this.ceilingInSecs = ceilingInSecs;
        }
    
        init() {
            //  Initialise Control Panel
            //      Work-for set time controls
            const workForMins = document.querySelector(".set-timer.work-for .mins");
            const workForSecs = document.querySelector(".set-timer.work-for .secs");
            const setWorkFor = new SetTimer(this.defaultWorkMins, {minsNode: workForMins, secsNode: workForSecs}, this.ceilingInSecs);
            this.workForTime = setWorkFor.setToDefault();
            //      Break-for set time controls
            const breakForSecs = document.querySelector(".set-timer.break-for .secs");
            const breakForMins = document.querySelector(".set-timer.break-for .mins");
            const setBreakFor = new SetTimer(this.defaultBreakMins, {minsNode: breakForMins, secsNode: breakForSecs}, this.ceilingInSecs);
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
            // ----------------------------------
            const startStopBtn = document.querySelector(".count-down-ctrls .main-btn");
            startStopBtn.addEventListener("click", () => {
                this._startStop(startStopBtn)} );
            // ----------------------------------
            //      reset count-down button
            // ----------------------------------
            const countDownResetBtn = document.querySelector('.reset.main-reset');
            countDownResetBtn.addEventListener('click', () => { 
                this.resetCountDown(); 
                this.sand = null;
                //stop work break cadence
                clearInterval(this.workBreakIntervalID);
                //remove timer message
                const timerMsgSection = document.querySelector('#timer-msg');
                timerMsgSection.querySelectorAll('p').forEach( (para) => {para.classList.remove("open")} );
                setTimeout( (timerMsgSection) => {timerMsgSection.innerHTML = "<p>Time left in this pomodoro:</p>"}, 500, timerMsgSection );
                //reset pomodoros counter
                this.numPomodoros = 0;
                // remove hinting (border highlight) on active timer
                document.querySelectorAll('.set-timer').forEach( (setTimer) => {setTimer.classList.remove("active")} );
            } );
            // ----------------------------------
            // MOBILE UI
            // ----------------------------------
            //  hide timer controls
            const setTimers = document.querySelectorAll('.set-timer');
            let userInputTimeout = null;
            setTimers.forEach(
                (timer) => { timer.addEventListener("click", 
                    (e) => {
                        e.stopPropagation;
                        if (timer.classList.contains("open")) {
                            // extend timeout to collapse controls when counter running
                            if (userInputTimeout && this.isCountingDown) {
                                clearTimeout(userInputTimeout);
                                userInputTimeout = setTimeout( () => timer.classList.remove("open"), 5500);
                            }
                            return;
                        }
                        else {
                            timer.classList.add("open");
                        }
                        if (this.isCountingDown) {
                            userInputTimeout = setTimeout( () => timer.classList.remove("open"), 5500);
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
        console.log(`Work: ${this.workForTime}s Break: ${this.breakForTime}s`);
        const workForTimer = document.querySelector('.set-timer.work-for');
        const breakForTimer = document.querySelector('.set-timer.break-for');
        const timerMsgSection = document.querySelector('#timer-msg');
        //handle button text
        if (this.isCountingDown === null || this.isCountingDown === undefined) this.isCountingDown = false;
        // start countdown cadence
        // SAND = seconds outstanding of current countdown, regardless of whether work or break time
        // initialise sand value
        this.sand = (this.sand) ? this.sand : this.workForTime;
        if (!this.isCountingDown) {
            [workForTimer, breakForTimer].forEach(
                (timer) => { 
                    if (timer.classList.contains("open")) { timer.classList.remove("open") }
                }  
            );
            this.startCountDown(this.sand);
            this.numPomodoros = 1;
            this.workBreakIntervalID = setInterval(() => { this._workBreakCadence(timerMsgSection, {workForTimer, breakForTimer}) }, 1000,
                                                                                        timerMsgSection,
                                                                                        {workForTimer, breakForTimer} );
            //expand timer message
            timerMsgSection.querySelectorAll('p').forEach( (para) => {para.classList.add("open")} );
            //add active timer hint
            workForTimer.classList.add("active");
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
    
    _workBreakCadence(msgSection, {workForTimer, breakForTimer}) {
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
                this.numPomodoros++;
                this.startCountDown(this.workForTime);
                msgSection.innerHTML = "<p class='open'>Time left in this pomodoro:</p>";
                breakForTimer.classList.remove("active");
                workForTimer.classList.add("active");
            }
            else {
                //prompt user to take longer break after 4 pomodoros
                //length based on mulitplier applied to normal break time. 
                //Could be extended to allow user to choose multiplier in a settings panel
                console.log("Phew, break time!");
                let breakLength = this.breakForTime;
                if (this.numPomodoros >= 4) {
                    if (window.confirm("That's been 4 pomodoros. Do you want to take a longer break?")) {
                        breakLength = (this.breakForTime * this.longBreakMultiplier) > this.ceilingInSecs ?
                            this.ceilingInSecs : this.breakForTime * this.longBreakMultiplier;
                            console.log(breakLength);
                    }
                    this.startCountDown(breakLength);
                    //reset pomodoro count
                    this.numPomodoros = 0;
                }
                else {
                    this.startCountDown(this.breakForTime);
                }
                msgSection.innerHTML = "<p class='open'>Time left in this break:</p>";
                workForTimer.classList.remove("active");
                breakForTimer.classList.add("active");
            }
        };
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

export default Pomodoro;