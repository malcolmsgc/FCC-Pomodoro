class CountDownTimer() {

    constructor() {
        this.countdown; //var used to clear interval
    }

    setInterval() {
    }

    startCountDown(secs) {
        console.log({this.countdown});
        const   now = Date.now(),
                timeAtEnd = now + (secs * 1000); //convert secs to milliseconds
        this.displayCountDown(secs);
        this.countdown = setInterval(
            () => {
                const secsRemaining = Math.round((timeAtEnd - Date.now()) / 1000);
                if (secsRemaining < 0) {
                clearInterval(countdown)
                return;
                console.log(secsRemaining);
                }
            }
        , 1000) //run every second to update display
    }

    displayCountDown(secs) {
        //tie this into UI
        console.log(secs);
        return secs;
    }
}