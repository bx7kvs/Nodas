/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function DelayNode(context, extend) {

    extend(this, 'AudioNode');

    var timeCFG = 0, forceCFG = 0, killDelay = 10000,
        globalGain = context.createGain(),
        delay = context.createDelay(),
        feedback = context.createGain(),
        bq = context.createBiquadFilter();

    globalGain.gain.value = 1;
    bq.frequency.value = 2000;
    feedback.gain.value = forceCFG;
    delay.delayTime.value = timeCFG;

    delay.connect(feedback);
    feedback.connect(bq);
    bq.connect(delay);
    feedback.connect(globalGain);

    this.build('delay', globalGain, globalGain, function (sound, out) {
        if (!out) {
            sound.connect(globalGain);
            sound.connect(feedback);
        }
        else {
            out.connect(globalGain);
            out.connect(feedback);
        }

        return this.output();
    });

    this.property('delay', [0, 0],
        function (value) {
            if (typeof value == "object" && value.constructor === Array &&
                value.length == 2 && typeof value[0] == "number" && typeof value[1] == "number") {
                var time = value[0],
                    force = value[1];

                if (time > 1) time = 1;
                if (time < 0) time = 0;
                if (force > .8) force = .8;
                if (force < 0) force = 0;
                timeCFG = time;
                forceCFG = force;
                delay.delayTime.value = timeCFG;
                feedback.gain.value = forceCFG;
                return [force, time];
            }
        },
        function (value) {
            return [value[0], value[1]];
        },
        function (value) {
            var time = value[0],
                force = value[1];

            if (time > 1) time = 1;
            if (time < 0) time = 0;
            if (force > .8) force = .8;
            if (force < 0) force = 0;

            return [force, time];
        }
    );
}]);