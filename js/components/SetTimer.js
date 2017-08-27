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

export default SetTimer;