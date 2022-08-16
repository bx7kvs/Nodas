import {NdEasingF} from '../Nodes/@types/types';

export default class NdMorphine {

    private easing: (timeElapsedS: number, startValue: number, valueDelta: number, durationS: number) => number;
    private duration = 1;
    private repeat = 0;
    private repeatCount = 1;
    private start_time = 0;
    private callback: (progress: number, value: number, startTime: number) => void;
    private start: number;
    private end: number;
    private progress = 0;
    private _paused = false;
    private _done = false;

    constructor(startValue: number, endValue: number, duration: number, callback: (progress: number, value: number, startTime: number) => void, easingFunction: NdEasingF, repeat: number) {
        this.start = startValue
        this.end = endValue
        this.duration = duration > 0 ? duration : 0
        this.callback = callback
        this.easing = easingFunction
        this.repeat = repeat
        this.start_time = new Date().getTime()
    }

    get done() {
        return this._done;
    };


    public stop() {
        this._done = true
    }

    public pause() {
        this._paused = true;
    };

    get paused() {
        return this._paused;
    };

    public tick(time: number) {
        if (!this._done) {
            if (this._paused) {
                this.start_time = new Date().getTime() - (this.duration * this.progress)
            }else {
                this.progress = (time - this.start_time) / this.duration
                if (this.progress > 1) this.progress = 1;
                if (this.progress == 1) {
                    if (!this.repeat) {
                        this._done = true
                    } else {
                        if (this.repeatCount > 0) {
                            if (this.repeatCount !== Infinity) {
                                this.repeatCount--
                            }
                            this.start_time = new Date().getTime()
                        } else {
                            this._done = true;
                        }
                    }
                }
                this.callback(this.progress, this.easing((time - this.start_time) / 1000, this.start, this.end - this.start, this.duration / 1000), this.start_time);
            }
        }
    }

}