/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.service.class('Sound',
    ['@Audio', '@inject', 'Resource', 'Debug',
        function AudioSource(audio, inject, Resource, Debug) {

            var url = null,
                resource = null,
                buffer = null,
                output = null,
                events = inject('$EventProvider'),
                self = this,
                sounds = [];

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
                    audio.context().decodeAudioData(
                        response,
                        function (result) {
                            buffer = result;
                            events.resolve('load');
                        },
                        function () {
                            Debug.error({src: src}, '[{src}] audio buffer can not be decoded. Resource not found, or of wrong format');
                            events.resolve('error');
                        }
                    )
                });

                resource.on('error', function () {
                    Debug.error({src: src}, 'Unable to load audio file');
                    events.resolve(error)
                });
                delete this.build;

                return this;
            };

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

            this.play = function () {
                if (output && this.status('load')) {
                    var source = audio.context().createBufferSource();
                    source.buffer = buffer;
                    sounds.push(source);
                    output.play(source, false);
                    source.start(0);
                }
                return this;
            };

            this.stop = function () {
                for (var i = 0; i < sounds.length; i++) {
                    sounds[i].stop(0);
                }
                sounds = [];
                return this;
            };

        }
    ]
);