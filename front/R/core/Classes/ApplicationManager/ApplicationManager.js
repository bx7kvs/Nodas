/**
 * Created by Viktor Khodosevich on 3/27/2017.
 */
$R.manager(function ApplicationManager(renderer) {

    var apps = {};

    function playApplication(name) {
        if(!apps[name]) return;
        renderer.enqueue(apps[name]);
    }

    function pauseApplication(name) {
        if(!apps[name])return;
        renderer.dequeue(apps[name])
    }

    this.each = function (func) {
        for(var name in apps) {
            func.call(apps[name],name);
        }
    };
    
    this.register = function (injection) {
        var name = injection.name();
        if(!apps[name]) apps[name] = $R.create('Application',[injection]);
    };

    this.play = playApplication;

    this.pause = pauseApplication;

});