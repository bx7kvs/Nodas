/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@inject', 'Debug', function AudioNode(context, inject, Debug) {

    var output = null,
        input = null,
        nextNode = null,
        buildF = function (sound, output) {
            if(!output) {
                var input = this.input();
                for(var i = 0; i < input.length; i++) {
                    sound.connect(input[i]);
                }
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
            var _inpArray = nextNode.input();
            for(var i = 0 ; i < output.length; i++) {
                for(var n = 0; n <_inpArray.length; n++) {
                    output[i].disconnect(_inpArray[n]);
                }
            }
            nextNode = null;
            events.resolve('disconnect');
        }
        return this;
    };

    this.connect = function (out) {
        this.disconnect();
        nextNode = out;
        if (nextNode && output) {
            var _inpArr = nextNode.input();
            for(var i = 0 ; i < output.length; i++) {
                for(var n = 0 ; n < _inpArr.length; n++) {
                    output[i].connect(_inpArr[i]);
                }
            }
        }
        events.resolve('connect');
        return this;
    };

    this.build = function (name, inp, out, f) {
        input = typeof inp == "object" && inp.constructor === Array ? inp : [inp];
        output = typeof out == "object" && out.constructor === Array ? out : [out];
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
        sound.addEventListener('ended', function () {
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

    var model = {};

    this.property = function (name, defVal, setter, getter, normlizer) {
        if (typeof name == "string") {
            var property = {
                name: name,
                value: null,
                getter: null,
                setter: null,
                normalizer : normlizer,
                animated : typeof normlizer == "function" ? true : false
            };

            if (typeof getter === "function") {
                property.getter = getter;
            }
            if (typeof setter === "function") {
                property.setter = setter;
            }

            property.value = defVal;

            if (defVal && typeof property.getter && property.setter) {
                if (!model[property.name]) {
                    model[property.name] = property;
                }
                else {
                    Debug.warn({property: property}, 'Duplicated property [{property}]');
                }
            }
        }
        else {
            Debug.warn({name: name}, 'Property name [{name}] is not valid!');
        }
    };

    this.set = function (name, value) {
        if (typeof name == "string" && name.length > 0) {
            var result = model[name].setter(value);
            if (result !== undefined) {
                model[name].value = result;
            }
            else {
                Debug.warn({prop: name, val: value}, '[{val}] is not a valid valuen for [{prop}].');
            }
        }
    };

    this.get = function (name) {
        if (typeof name == "string" && name.length > 0) {
            if (model[name]) {
                return model[name].value;
            }
            else {
                Debug.warn({name: name}, 'Object has no property [{name}]. Unable to get value.');
            }
        }
        else {
            Debug.warn('Property name has to be a string');
        }
    };

    this.props = function () {
        var result = [];

        for (var prop in model) {
            if (model.hasOwnProperty(prop)) {
                result.push(model[prop]);
            }
        }

        return result;
    };

    this.has = function (name) {
        return !!model[name];
    };

}]);