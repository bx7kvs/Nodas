/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function LowpassNode(context, extend) {

    extend(this, 'AudioNode');

    this.build(function (sound, out) {
        if(out) {

        }
        else {
            return false;
        }
    });

}]);