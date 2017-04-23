/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function GainNode(context, extend) {

    extend(this, 'AudioNode');

    var volume = 1,
        gain = context.createGain();

    gain.gain.value = volume;

    this.build('gain', gain, gain);

    this.property('volume', 1,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                if (value > 1) value = 1;
                volume = value;
                gain.gain.value = volume;
                return value;
            }
        },
        function (value) {
            return value;
        },
        function (value) {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            return value;
        }
    );

}]);