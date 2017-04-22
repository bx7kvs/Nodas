/**
 * Created by Viktor Khodosevich on 4/22/2017.
 */
$R.part('Sound', ['@audio', function AudioNodeSoundDispatcher() {

    var sounds = [];

    this.register = function (sound) {
        sound.addEventListener('end', function () {
            sound.$$SEARCH = true;

            var result = [];

            for(var i = 0; i < sounds.length; i++) {
                if(!sounds[i].$$SEARCH) {
                    result.push(sounds[i]);
                }
            }
            sounds = result;
        });

        sounds.push(sound);
    };
    
    this.reconnect = function (destination) {
        for(var i = 0 ; i < sounds.length; i++) {
            sounds[i].disconnect();
            sounds[i].connect(destination);
        }
    };
}]);