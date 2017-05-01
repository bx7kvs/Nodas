/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Sound', ['$AnimationHelper', 'Morphine', function Animation(AnimationHelper, Morphine) {

    var progress = 0,
        duration = null,
        easing = null,
        done = false,
        stack = null,
        morphine = null,
        target = null,
        stepsCb = null,
        queue = false,
        active = false,
        clear = null,
        stepTypeStr = 'type',
        completeTypeStr = 'complete',
        config = null;

    function Resolve(type) {
        if (type == stepTypeStr) {
            for (var i = 0; i < stack.length; i++) {
                if (stepsCb.hasOwnProperty(stack[i].morph.property())) {
                    stepsCb[stack[i].morph.property()].apply(target, [progress, stack[i].result]);
                }
            }
        }
        else if (type == completeTypeStr) {
            done = true;
            var results = {};
            for (var i = 0; i < stack.length; i++) {
                results[stack[i].morph.property()] = stack[i].result;
            }
            config.done(1, results);
            clear();
        }
    }

    this.target = function () {
        return target
    };

    this.queue = function () {
        return queue;
    };

    this.active = function () {
        return active;
    };

    this.done = function () {
        return done;
    };

    this.hasProperty = function (property) {
        var result = 0;
        for (var i = 0; i < stack.length; i++) {
            if (stack[i].morph.property() == property) {
                result = i + 1;
                break;
            }
        }
        return result;
    };

    this.properties = function () {
        var array = [];
        for (var i = 0; i < stack.length; i++) {
            array.push(stack[i].morph.property());
        }
        return array;
    };

    this.stop = function (property) {
        if (property) {
            var index = this.hasProperty(property);
            if (index) {
                index = index - 1;
                stack.splice(index, 1)
            }
        }
        else {
            stack = [];
        }
    };

    this.start = function () {

        active = true;

        var _stack = [];

        for (var i = 0; i < stack.length; i++) {
            var morph = stack[i].morph.get(stack[i].value);

            if (morph !== undefined && morph.start() !== false && morph.end() !== false) {
                _stack.push(stack[i]);
            }
        }

        stack = _stack;

        var tick_function = AnimationHelper.getTickFunction();

        morphine = Morphine.create(0, 1, function (complete, value) {
            if (stack.length == 0) {
                Resolve(completeTypeStr);
                morphine.stop();
            }
            else {
                for (var i = 0; i < stack.length; i++) {
                    stack[i].result = tick_function(value, stack[i].morph.start(), stack[i].morph.end());
                    stack[i].morph.apply(complete, stack[i].result);
                }

                Resolve(stepTypeStr);

                if (complete == 1) {
                    Resolve(completeTypeStr);
                }

            }
        }, easing, duration, 0);
    };

    this.config = function (t, m, cfg, f) {
        AnimationHelper.normalizeConfig(cfg);

        duration = cfg.duration;

        easing = cfg.easing;

        stepsCb = cfg.step;

        queue = cfg.queue;

        clear = f;

        stack = m;

        target = t;

        config = cfg;
    }
}]);