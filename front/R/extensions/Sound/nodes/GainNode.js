/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function GainNode(context, extend) {

    extend(this,'AudioNode');

    this.build(function (sound, out) {
        if(out) {
            var gain = context.createGain();
            out.connect(gain);
            return gain;
        }
        else {
            return false;
        }
    });

}]);