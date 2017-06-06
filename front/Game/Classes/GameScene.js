/**
 * Created by Viktor Khodosevich on 6/1/2017.
 */
$R.cls(function GameScene() {

    var provider = null;

    this.resourceProvider = function () {
        if(!provider) {
            if(arguments[0]) {
                provider = arguments[0]
            }
        }
        else {
            return provider;
        }
    };

});