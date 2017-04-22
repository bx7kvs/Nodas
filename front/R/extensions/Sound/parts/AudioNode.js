/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@inject', 'Debug', function AudioNode(context, inject, Debug) {

    var output = null,
        input = null,
        nextNode = null,
        buildF = function (sound, output) {
            if (!output) {
                sound.connect(this.input());
            }
            return this.output();
        },
        sounds = [],
        events = inject('EventProvider'),
        nodename = '';

    function args() {
        return [nextNode];
    }

    events.wrap(this);

    events.event('ready', args, true);
    events.event('play', args, false);
    events.event('end', args, false);
    events.event('connect', args, false);
    events.event('disconnect', args, false);
    events.event('property', args, false);

    this.disconnect = function () {
        if (nextNode && output) {
            output.disconnect(nextNode.input());
            nextNode = null;
            events.resolve('disconnect');
        }
        return this;
    };

    this.connect = function (out) {
        this.disconnect();
        nextNode = out;
        if (nextNode && output) {
            output.connect(nextNode.input());
        }
        events.resolve('connect');
        return this;
    };

    this.build = function (name, inp, out, f) {
        input = inp;
        output = out;
        nodename = name;
        if (typeof f == "function") buildF = f;
        delete this.build;
        events.resolve('ready');
        return this;
    };

    this.input = function () {
        return input;
    };

    this.output = function () {
        return output;
    };

    this.name = function () {
        return nodename;
    };

    this.play = function (sound, output) {
        sounds.push(sound);
        sound.addEventListener('end', function () {
            console.log('sound deleted...');
            var result = [];
            sound.$$SEARCH = true;
            for (var i = 0; i < sounds.length; i++) {
                if (!sounds.$$SEARCH) {
                    result.push(sounds[i]);
                }
            }
            delete sound.$$SEARCH;
            sounds = result;
        });

        if (nextNode) {
            nextNode.play(sound, buildF.apply(this, arguments));
        }

    };

    var wrapProps = null;

    function getResultF(cfg,prop) {
        return function () {
            cfg[prop].apply(this, arguments);
            events.resolve('property');
            return this;
        }
    }

    this.wrap = function (cfg) {
        if (cfg && typeof cfg == "object") {
            for (var prop in cfg) {
                if (cfg.hasOwnProperty(prop) && typeof cfg[prop] == "function") {
                    if (!wrapProps) wrapProps = {};
                    wrapProps[prop] = getResultF(cfg,prop);
                }
            }
        }

        this.wrap = function (target) {
            if (wrapProps) {
                for (var prop in wrapProps) {
                    if (wrapProps.hasOwnProperty(prop)) {
                        if (!target[prop]) {
                            target[prop] = wrapProps[prop].bind(target);
                        }
                    }
                }
            }
            delete this.wrap;
        }
    };
}]);