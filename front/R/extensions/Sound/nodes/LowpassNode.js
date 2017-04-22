/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function LowpassNode(context, extend) {

    extend(this, 'AudioNode');

    var bqf = context.feedback = context.createBiquadFilter(),

        frequency = 24000,
        q = 0;

    bqf.type = 'lowpass';
    bqf.Q.value = q;
    bqf.frequency.value = frequency;

    this.build('lowpass', bqf, bqf);

    this.wrap({
        lowpass: function (value) {
            if (value < 0) value = 0;
            if (value > 24000) value = 24000;
            frequency = value;
            bqf.frequency.value = value;
        }
    });


}]);