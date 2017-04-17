/**
 * Created by Viktor Khodosevich on 3/27/2017.
 */
$R.member('Injector', function InjectionContainer (type,injection, parent) {

    parent = parent ? parent : null;

    this.type = function () {
        return type;
    };

    this.injection = function () {
        return injection;
    };

    this.member = function () {
        return parent;
    };

});