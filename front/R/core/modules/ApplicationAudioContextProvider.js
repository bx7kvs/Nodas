/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.$(function ApplicationAudioContextProvider() {


    var contexts = {};

    function getAppContext(appname) {
        return {
            context : new AudioContext(),
            constructor : function audio () {
                this.context = function () {
                    return contexts[appname].context;
                };
            }
        }
    }

    this.getApplicationAudioContext = function (appname) {
        contexts[appname] = getAppContext(appname);
        return contexts[appname].constructor;
    }
});