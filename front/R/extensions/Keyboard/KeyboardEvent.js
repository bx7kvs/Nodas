/**
 * Created by Viktor Khodosevich on 5/11/2017.
 */
$R.part('Keyboard', [function KeyboardEvent() {

    var keycode = null,
        ctrlPressed = false,
        altPressed = false,
        shiftPressed = false,
        event = false,
        type = null;

    this.build = function (e) {
        keycode = e.keyCode;
        ctrlPressed = e.ctrlKey;
        altPressed = e.altKey;
        shiftPressed = e.shiftKey;
        event = e;
        type = e.type;
        delete this.build;
        return this;
    };

    this.type = function (string) {
        if(typeof string == "string") {
            return type === string;
        }
        else  return type;
    };

    this.code = function () {
        return keycode;
    };

    this.shift = function () {
        return shiftPressed;
    };
    this.alt = function () {
        return altPressed;
    };
    this.ctrl = function () {
        return ctrlPressed;
    };
    this.original = function () {
        return event;
    };
}]);