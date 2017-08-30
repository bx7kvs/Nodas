/**
 * Created by Viktor Khodosevich on 4/21/2017.
 */
$R.service.class('Sound',
    ['@inject', '@Config', 'Debug',
        function UserAudioMixer(inject, config, Debug) {

            var events = inject('$EventProvider'),
                filters = [],
                output = null,
                name = '',
                filtersCfg = config.define('filters', ['Delay', 'Gain'], {isArray: true}).watch(function (v) {
                    filters = v;
                });


            events.wrap(this);

            function argF() {
                return [this];
            }

            events.event('play', argF, false);
            events.event('connect', argF, false);
            events.event('ready', argF, true);
            events.event('error', argF, true);

            this.build = function (n, channel) {

                for (var i = 0; i < filtersCfg.length; i++) {
                    var node = inject('$' + filtersCfg[i] + 'Node');
                    if (filters[filters.length - 1]) {
                        filters[filters.length - 1].connect(node);
                    }
                    filters.push(node);
                }

                if (typeof n === "string" && n.length > 0) {
                    name = n;
                }
                else {
                    Debug.warn({n: n}, '[{n}] is not a valid name for channel');
                    events.resolve('error');
                }

                if (channel && typeof channel === "object" && channel.connect && typeof channel.connect === "function") {
                    this.connect(channel);
                }
                else if (channel === 'destination') {
                    var destination = inject('$DestinationNode');
                    filters[filters.length - 1].connect(destination);

                    this.connect = function (out) {
                        if (out.$$AUDIONODE) {
                            return filters[0];
                        }
                    }
                }


                delete  this.build;
                return this;
            };

            this.connect = function (out) {
                if (out.$$AUDIONODE) {
                    return filters[0];
                }
                else {
                    var input = out.connect({$$AUDIONODE: true});
                    filters[filters.length - 1].connect(input);
                    output = out;
                }

                return this;
            };

            this.output = function () {
                return output;
            };

            this.filters = function () {
                return filters;
            };

            this.name = function () {
                return name;
            }

        }
    ]
);