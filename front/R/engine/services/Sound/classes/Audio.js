/**
 * Created by Viktor Khodosevich on 4/23/2017.
 */
$R.service.class('Sound',
    ['@inject', 'Debug',
        function Audio(inject, Debug) {

            var source = null,
                url = null,
                type = null,
                events = inject('$EventProvider'),
                animations = inject('$AnimationProvider'),
                self = this,
                output = null,
                nodename = '';

            events.wrap(this);

            function eventArgs() {
                return [self, output, url, type];
            }

            events.event('ready', eventArgs, true);
            events.event('load', eventArgs, true);
            events.event('error', eventArgs, true);
            events.event('play', eventArgs, false);
            events.event('connect', eventArgs, false);
            events.event('disconnect', eventArgs, false);
            events.event('end', eventArgs, false);

            function createAnimationMorph(filter, property) {
                animations.morph.apply(this, [property.name, 0,
                    function (start, end, value) {
                        value = property.normalizer(value);
                        if (value !== undefined) {
                            end(value);
                            start(filter.get(property.name));
                        }
                    },
                    function (value) {
                        value = property.normalizer(value);
                        return filter.set(property.name, value);
                    }
                ]);
            }

            this.build = function (name, src) {
                if (typeof name === "string" && name.length > 0) {
                    if (typeof src === "string" && src !== 'destination' && src.length > 0) {
                        url = src;
                        source = inject('$UserAudioSource').build(src);
                        type = 'Sample';
                        source.on('load', function () {
                            events.resolve('load');
                        });

                        this.play = function () {
                            source.play();
                            return this;
                        };

                        this.terminate = function () {
                            source.stop();
                            return this;
                        }
                    }
                    else if (src === 'destination') {
                        source = inject('$UserAudioMixer').build(name, src);
                        this.connect = function () {
                            if (arguments[0] && typeof arguments[0] === "object" && arguments[0].$$SOURCE) {
                                return source;
                            }
                            return this;
                        };

                        url = '[' + name + ']' + 'AudioChannel';
                        type = 'Channel';
                        events.resolve('load');
                    }
                    else if (src === undefined) {
                        source = inject('$UserAudioMixer').build(name);
                        url = '[' + name + ']' + 'AudioChannel';
                        type = 'Channel';
                        events.resolve('load');
                    }

                    source.on('error', function () {
                        events.resolve('error');
                    });

                    source.on('play', function () {
                        events.resolve('play');
                    });

                    source.on('end', function () {
                        events.resolve('end');
                    });

                    source.on('connect', function () {
                        events.resolve('connect');
                    });

                    source.on('disconnect', function () {
                        events.resolve('disconnect');
                    });

                    var filters = source.filters();

                    for (var i = 0; i < filters.length; i++) {
                        var props = filters[i].props();
                        for (var m = 0; m < props.length; m++) {
                            if (props[m].animated) {
                                createAnimationMorph.apply(this, [filters[i], props[m]]);
                            }
                        }
                    }

                    nodename = name;

                    events.resolve('ready');

                }
                else {
                    Debug.warn('Audio mixer have no name! Should be a string');
                }

                return this;
            };

            this.filter = function (name, value) {
                if (typeof name === "string" && name.length > 0) {
                    var filter = null,
                        filters = source.filters();

                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].has(name)) {
                            filter = filters[i];
                        }
                    }

                    if (filter) {
                        if (value !== undefined) {
                            filter.set(name, value);
                        }
                        else {
                            return filter.get(name);
                        }
                    }
                    else {
                        Debug.warn({name: name}, 'Unable to set filter property [{name}]. No filter with that param!');
                    }
                }
                return this;
            };

            this.connect = function (out) {
                if (out && typeof out === "object" && out.$$SOURCE) {
                    return source;
                }

                if (typeof out === "object" && out.type && typeof out.type === "function") {
                    var ctype = out.type();
                    if (type === 'Channel' && ctype === 'Sample') {
                        Debug.error('Trying to connect Channel with Sample!');
                        return this;
                    }
                    else if (out.connect && typeof out.connect === "function") {
                        var outsource = out.connect({$$SOURCE: true});
                        output = out;
                        source.connect(outsource);
                        return out;
                    }
                    else {
                        Debug.error('Unknown type of  object passed as output!');
                    }
                }
                else {
                    Debug.error('Unknown type of  object passed as output!');
                }

                return this;
            };

            this.output = function () {
                return output;
            };

            this.animate = function () {
                animations.animate.apply(this, arguments);
                return this;
            };

            this.type = function (str) {
                if (typeof str === "string") {
                    return str === type;
                }
                return type;
            };

            this.url = function () {
                return url;
            };

            this.name = function () {
                return nodename;
            };

            this.stop = function () {
                animations.stop.apply(this, arguments);
                return this;
            };
        }
    ]
);