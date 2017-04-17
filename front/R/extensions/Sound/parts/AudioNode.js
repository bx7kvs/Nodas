/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@inject', 'Debug', function AudioNode(context, inject, Debug) {

    var output = null,
        events = inject('EventProvider'),
        buildf = function () {
            return null
        };

    function args() {
        return [output];
    }

    events.wrap(this);

    events.event('ready', args, true);
    events.event('play', args, false);
    events.event('end', args, false);
    events.event('connect', args, false);
    events.event('disconnect', args, false);

    this.disconnect = function () {
        if (output) {
            output = null;
            events.resolve('disconnect');
        }
        return this;
    };

    this.connect = function (out) {
        this.disconnect();
        output = out;
        events.resolve('connect');
        return this;
    };

    this.build = function (func) {
        if (typeof func == "function") {
            buildf = func;
            events.resolve('ready');
            delete this.build;
        }
    };

    this.play = function (sound, out) {
        var filter_output = buildf(sound, out);

        if (filter_output) {
            if (output) {
                output.play(sound, filter_output);
                events.resolve('play');
            }
        }
        else {
            Debug.warn('Sound reached destination. No further output provided...');
        }

        return this;
    };

}]);