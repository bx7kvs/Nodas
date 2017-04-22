/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.ext(['@audio', '@inject', 'Debug', function Sound(context, inject, Debug) {

    var output = inject('UserAudioMixer').build('$$DESTINATION', 'destination'),
        channels = {
            $$DESTINATION: output
        };

    this.sample = function (src, channel) {
        if (typeof src == "string" && src.length > 0) {
            var sound = inject('UserAudioSource').build(src);
            if (typeof channel == "string" && channel.length > 0 && channel !== '$$DESTINATION') {
                if (channels[channel]) {
                    sound.connect(channels[channel]);
                }
                else {
                    var output = this.channel(channel);
                    sound.connect(output);
                }
            }
            else {
                sound.connect(channels.$$DESTINATION);
            }
            return sound;
        }
        else {
            Debug.warn({src: src}, '[{src}] is not a string ot empty.');
        }
    };

    this.channel = function (name) {
        if (typeof name == "string" && name.length > 0 && name !== '$$DESTINATION') {
            if (channels[name]) {
                return channels[name];
            }
            else {
                var channel = inject('UserAudioMixer').build(name, channels.$$DESTINATION);
                channels[name] = channel;
                return channel;
            }
        }
        else {
            Debug.warn({name: name}, '[{name}] is not a valid channel name');
        }

    };

    this.list = function () {
        var list = {};

        for (var channel in channels) {
            if (channels.hasOwnProperty(channel)) {
                if (channel !== '$$DESTINATION') {
                    list[channel] = channels[channel];
                }
            }
        }

        return list;
    };

    this.destination = function () {
        return channels.$$DESTINATION;
    };


}]);