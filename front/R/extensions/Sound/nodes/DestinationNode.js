/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio','@extend', function DestinationNode(context,extend) {

    extend(this,'AudioNode');

    this.build( function (sound,out) {
        out.connect(context.destination);
        return false;
    });
}]);