/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@inject', 'Resource', 'Debug', function AudioSource(context, inject, Resource, Debug) {

    var url = null,
        resource = null,
        buffer = null,
        output = null,
        events = inject('EventProvider'),
        self = this;

    function args() {
        return [resource, buffer, output];
    }

    events.wrap(this);

    events.event('ready', args, true);
    events.event('load', args, true);
    events.event('error', args, true);
    events.event('connect', args, false);
    events.event('disconnect', args, false);
    events.event('play', false);
    events.event('end', false);

    this.build = function (src) {
        resource = Resource.audio(src);

        resource.on('load', function (response) {
            context.decodeAudioData(
                response,
                function (result) {
                    buffer = result;
                    events.resolve('load');
                },
                function () {
                    Debug.error({src: src}, '[{src}] audio buffer can not be decoded.');
                    events.resolve('error');
                }
            )
        });

        resource.on('error', function () {
            Debug.error({src: src}, 'Unable to load audio file');
            events.resolve(error)
        });
        delete this.build;
    };

    this.disconnect = function () {
        if(output) {
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

    this.play = function () {
        if(output && this.status('load')) {
            var source =  context.createBufferSource();
            source.buffer = buffer;
            output.play(source);
        }
        return this;
    };

}]);