/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Sound', ['@inject', 'Debug', function AnimationProvider(inject, Debug) {

    var animations = [],
        animated = false,
        morphs = {};

    this.morph = function (name, ordering, setter, applier) {
        var morph = inject('$Morph');
        morph.config(name, this, ordering, setter, applier);
        if (morph.valid()) {
            morphs[name] = morph;
        }
    };

    this.extractMorph = function (name) {
        return morphs[name];
    };

    function findCompetitor(properties, animation) {
        animation.$$SELF = true;

        var competitor = null;

        for (var i = 0; i < animations.length; i++) {
            if (!animations[i].$$SELF) {
                if (animations[i].active() && !animations[i].done()) {
                    var check = false;
                    for (var n = 0; n < properties.length; n++) {
                        if (animations[i].hasProperty(properties[n])) {
                            check = true;
                            break;
                        }
                    }
                    if (check) {
                        if (!competitor) competitor = [];
                        competitor.push(animations[i]);
                    }
                }
            }
        }

        delete animation.$$SELF;

        return competitor;
    }

    function CheckAnimationQueue() {
        var _animations = [];

        for (var i = 0; i < animations.length; i++) {
            if (!animations[i].active()) {
                var props = animations[i].properties();
                if (animations[i].queue()) {
                    if (!findCompetitor(props, animations[i])) {
                        animations[i].start();
                    }
                }
                else {
                    var competitors = findCompetitor(props, animations[i]);
                    if(competitors) {
                        for (var n = 0; n < competitors.length; n++) {
                            for (var p = 0; p < props.length; p++) {
                                competitors[n].stop(props[p]);
                            }
                        }
                    }
                    animations[i].start();
                }
                _animations.push(animations[i]);
            }
            else {
                if (!animations[i].done()) {
                    _animations.push(animations[i]);
                }
            }
        }

        animations = _animations;
    }


    function CreateAnimationType1(property, value, duration, easing) {
        var pair = {};

        pair[property] = value;

        if (morphs[property]) {
            var stack = [
                    {
                        ordering: morphs[property].ordering(),
                        morph: morphs[property],
                        value: value
                    }
                ],
                config = {};

            if (duration && typeof duration == "number") config.duration = duration;
            if (easing && typeof easing == "string") config.easing = easing;


            var animation = inject('$Animation');

            animation.config(this, stack, config, CheckAnimationQueue);
            animations.push(animation);
        }

    }

    function CreateAnimationType2(pairs,arg2,arg3) {
        var config = {};

        if(typeof arg2 == "object") {
            config = arg2;
        }
        else if(typeof arg2 == "number") {
            config = {
                duration : arg2
            };
            if(typeof arg3 == "string") {
                config.easing = arg3
            }
        }
        else if(typeof arg2 == "string") {
            config = {
                easing : arg2
            };
        }

        var result = {};

        for (var property in pairs) {
            if (!pairs.hasOwnProperty(property)) continue;
            if (!morphs[property]) {
                Debug.warn({
                    type: this.type(),
                    property: property
                }, 'Property {property} of {type} can not be animated!');
            }
            else {
                result[property] = {
                    ordering: morphs[property].ordering(),
                    morph: morphs[property],
                    value: pairs[property]
                }
            }
        }

        var morph_stack = [];

        for (var item in result) {
            morph_stack.push(result[item]);
        }

        if (morph_stack.length) {
            morph_stack.sort(function (a, b) {
                return a.ordering - b.ordering;
            });

            var animation = inject('$Animation');
            animation.config(this, morph_stack, config, CheckAnimationQueue);
            animations.push(animation);
        }
        else {
            Debug.warn('No properties to animate!');
        }
    }

    this.animate = function (arg1, arg2, arg3, arg4) {
        if (typeof arg1 == 'string' && arg2) {
            CreateAnimationType1.apply(this, arguments);
        }
        else if (typeof arg1 == "object" && arg1.constructor !== Array) {
            CreateAnimationType2.apply(this, arguments);
        }
        else {
            Debug.warn('Unable to create animation. Wrong arguments');
        }
        CheckAnimationQueue();
    };

    this.animated = function () {
        return animated;
    };

    this.stop = function (property) {
        if(typeof property !== "string" || property.length == 0) return;
        for (var i = 0; i < animations.length; i++) {
            animations[i].stop(property);
        }
    };

}]);