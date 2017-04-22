/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function DelayNode(context, extend) {

    extend(this, 'AudioNode');

    var timeCFG = 0, forceCFG = 0, killDelay = 10000,
        globalGain = context.createGain();

    globalGain.gain.value = 1;

    this.build('delay', globalGain, globalGain, function (sound, out) {
        if (!out) {
            sound.connect(this.input());
        }

        if (timeCFG > 0 && forceCFG > 0) {
            var delay = context.createDelay(),
                bq = context.createBiquadFilter(),
                feedback = context.createGain();

             bq.frequency.value = 2000;


            delay.connect(feedback);
            feedback.connect(bq);
            bq.connect(delay);

            feedback.gain.value = forceCFG;
            delay.delayTime.value = timeCFG;

            out.connect(feedback);
            feedback.connect(globalGain);

            setTimeout(function () {
                feedback.gain.value = 0;
                feedback.disconnect(globalGain);
                out.disconnect(feedback);
                console.log('delay killed');
            },killDelay);
        }

        return this.output();
    });

    this.wrap(
        {
            delay: function (time, force) {
                if (typeof time == "number") {
                    if (time > 1) time = 1;
                    if (time < 0) time = 0;
                    timeCFG = time;
                }
                if (typeof force === "number") {
                    if (force > 1) force = 1;
                    if (force < 0) force = 0;
                    forceCFG = .2 + (force + .2) * .6;
                }

                return this;
            }
        }
    );
}]);