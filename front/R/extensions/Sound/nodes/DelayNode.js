/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound',['@audio','@extend', function DelayNode (context, extend) {

    extend(this,'AudioNode');
    
    this.build(function (sound, output) {
        var feedback = context.createGain(),
            delay = context.createDelay(),
            source = output ? output : sound;

        source.connect(feedback);
        feedback.connect(delay);
        delay.connect(feedback);
        return feedback;
    });
}]);