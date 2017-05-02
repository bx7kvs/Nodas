/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function LowpassNode(audio, extend) {

    extend(this, '$AudioNode');

    var bqf  = audio.context().createBiquadFilter(),

        frequency = 22050;

    bqf.type = 'lowpass';
    bqf.frequency.value = frequency;

    this.build('lowpass', bqf, bqf);

    this.property('lowpass', 22050,
        function (value) {
            if (value < 0) value = 0;
            if (value > 22050) value = 22050;
            frequency = value;
            bqf.frequency.value = value;
            return value;
        },
        function (value) {
            return value;
        },
        function (value) {
            if (value < 0) value = 0;
            if (value > 22050) value = 22050;
            return value;
        }
    );
}]);