/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Audio () {
    var context = new AudioContext();
    this.context = function () {
        return context;
    }
});