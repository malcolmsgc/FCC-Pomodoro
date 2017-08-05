/* MOVE TO MODULE COUNTDOWNTIMER */
//import CountDownTimer from "./components/CountDownTimer";

class CountDownTimer {

    constructor() {
        this.timerIntervalID; //var used to clear interval
    }

    setInterval() {
    }

    startCountDown(secs) {
        const   now = Date.now(),
                timeAtEnd = now + (secs * 1000); //convert secs to milliseconds
        this.displayCountDown(secs);
        this.timerIntervalID = setInterval(
            () => {
                const secsRemaining = Math.round((timeAtEnd - Date.now()) / 1000);
                if (secsRemaining < 0) {
                    clearInterval(this.timerIntervalID)
                    return;
                }
                console.log(secsRemaining);
                }
        , 1000) //run every second to update display
    }

    displayCountDown(secs) {
        //tie this into UI
        console.log(secs);
        return secs;
    }
}

/* -------------------------------- */






const countDown = new CountDownTimer();