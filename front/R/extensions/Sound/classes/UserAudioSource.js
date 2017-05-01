/**
 * Created by Viktor Khodosevich on 4/19/2017.
 */
$R.part('Sound', ['@extend', '@inject', 'Debug', function UserAudioSource(extend, inject, Debug) {

    var node = inject('$AudioSource'),
        events = inject('$EventProvider'),
        mixer = null,
        output = null,
        url = '';

    function cbArgs() {
        return [this];
    }

    function connectCbArgs() {
        return [this, output];
    }

    events.wrap(this);

    events.event('ready', cbArgs, true);
    events.event('load', cbArgs, true);
    events.event('error', cbArgs, true);
    events.event('connect', connectCbArgs, false);
    events.event('play', cbArgs, false);
    events.event('stop', cbArgs, false);

    node.on('ready', function () {
        events.resolve('ready');
    });

    node.on('load', function () {
        events.resolve('load');
    });

    node.on('error', function () {
        events.resolve('error');
    });

    this.build = function (src) {

        if (typeof src == "string" && src.length > 0) {
            url = src;
            node.build(src);
            mixer = inject('$UserAudioMixer').build('source-built-in-filter');
            mixer.on('connect', function () {
                events.resolve('connect');
            });
            node.connect(mixer.connect({$$AUDIONODE: true}));
            delete this.build;
            events.resolve('ready');
        }
        else {
            delete  this.build;
            events.resolve('error');
        }


        return this;
    };

    this.filters = function () {
        if(mixer) {
            return mixer.filters();
        }
        return [];
    };


    this.play = function () {
        if (!this.status('error')) {
            if (this.status('ready')) {
                if (this.status('load')) {
                    node.play();
                }
                else {
                    this.on('load', function () {
                        node.play();
                    });
                }
            }
        }

        return this;
    };

    this.stop = function () {
        node.stop();
        return this;
    };

    this.output = function () {
        return output;
    };

    this.connect = function (out) {
        if (out && out.constructor === mixer.constructor) {
            output = out;
            mixer.connect(out);
            Debug.warn({src:url, outname : out.name()},'[{src}] connected to [{outname}]');
        }
        return this;
    };

}]);