/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service.class('Morphine', [
        function Morphine() {

            var easing = null,
                duration = 1,
                repeat = false,
                repeatCount = 1,
                start_time = null,
                func = null,
                start = 0,
                end = 0;

            this.done = function () {
                return done;
            };

            this.pause = function () {
                pasued = true;
            };

            this.paused = function () {
                return pasued;
            };

            this.stop = function () {
                done = true;
            };

            var progress = 0,
                pasued = false,
                done = false;

            function Tick(time) {
                if (!done) {
                    if (pasued) {
                        start_time = new Date().getTime() - (duration * progress);
                        return;
                    }
                    if (!start_time) start_time = new Date().getTime();

                    progress = (time - start_time) / duration;

                    if (progress > 1) progress = 1;
                    if (progress === 1) {
                        if (!repeat) {

                            done = true;

                        }
                        else {
                            if (repeatCount > 0) {

                                if (repeatCount !== Infinity) {
                                    repeatCount--;
                                }

                                start_time = new Date().getTime();
                            }
                            else {
                                done = true;
                            }
                        }
                    }
                    func.apply(null, [progress, easing((time - start_time) / 1000, start, end - start, duration / 1000), start_time]);
                }
            }

            this.config = function (s, e, f, dur, ease, rpt) {

                if (typeof s !== "number" || typeof e !== "number" || typeof dur !== "number" || dur < 0) return;

                if (typeof ease !== "function") return;
                if (typeof f !== "function") return;

                if (typeof rpt === "number") repeat = rpt;

                start = s;
                end = e;
                easing = ease;
                func = f;
                duration = dur > 0 ? dur : 1;

                delete this.config;

                return Tick;
            }

        }
    ]
);