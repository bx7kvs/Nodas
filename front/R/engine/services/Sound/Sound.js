/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.service(
    ['@Audio', '@inject', '@Config', 'Debug',
        function Sound(context, inject, config, Debug) {

            config.define('filters', ['Delay', 'Gain'], {isArray: true});

            console.log(config.watch('filters', function () {}));

            var destination = inject('$Audio').build('$$DESTINATION', 'destination'),
                sounds = {},
                soundcount = 0,
                channelcount = 0,
                channels = {
                    $$DESTINATION: destination
                },
                self = this;



            this.sample = function (url, channel, name) {
                if (typeof url === "string" && url.length > 0) {
                    if (sounds[url]) return sounds[url];
                    if (typeof name !== "string" || name.length === 0) name = 'UserSound[' + soundcount + ']';
                    soundcount++;
                    var result = inject('$Audio').build(name, url);
                    if (typeof channel !== "string" || channel.length === 0) channel = '$$DESTINATION';
                    var out = this.channel(channel);
                    result.connect(out);
                    sounds[result.url()] = result;
                    return result;
                }
                else {
                    Debug.warn({url: url}, '[{url}] is not valid audio url or empty.');
                }
            };

            this.channel = function (name) {
                if (typeof name === "string" && name.length > 0) {
                    if (channels[name]) return channels[name];

                    var result = inject('$Audio').build(name);

                    result.connect(destination);
                    channels[name] = result;
                    channelcount++;
                    return result;
                }
            };

            this.channels = function (byurl) {
                var list = {},
                    byurl = !!byurl;

                for (var channel in channels) {
                    if (channels.hasOwnProperty(channel)) {
                        if (channel !== '$$DESTINATION') {
                            if (byurl) {
                                list[channel.url()] = channel[channel];
                            }
                            else {
                                list[channel] = channels[channel];
                            }

                        }
                    }
                }

                return list;
            };

            this.sounds = function (byurl) {
                var list = {},
                    byurl = !!byurl;

                for (var prop in sounds) {
                    if (sounds.hasOwnProperty(prop)) {
                        if (byurl) {
                            list[prop] = sounds[prop];
                        }
                        else {
                            list[sounds[prop].name()] = sounds[prop];
                        }
                    }
                }

                return list;
            };

            this.destination = function () {
                return channels.$$DESTINATION;
            };
        }
    ]
);