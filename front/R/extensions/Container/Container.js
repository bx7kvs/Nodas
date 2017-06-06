/**
 * Created by Viktor Khodosevich on 5/31/2017.
 */
$R.ext(['@HTMLRoot', '$$config', 'Debug', function Container(html, config, Debug) {
    var element = html.element(),
        visible = false,
        blur = false,
        speed = 1000,
        easing = 'ease',
        cb = {
            show: [],
            hide: [],
            blurout: [],
            blurin: []
        },
        zindex = config.z && typeof config.z == "number" && config.z > 0 ? config.z : 0,
        container = this,
        displayTo = null;

    function resolve(event) {
        if (cb[event]) {
            for (var i = 0; i < cb[event].length; i++) {
                cb[event][i].call(container);
            }
        }
    }

    function hide() {
        style({display: false});
        displayTo = null;
    }

    element.style.transition = 'opacity ' + speed + 's ' + easing + ',' +
        'filter ' + speed + 's';

    element.style.zIndex = zindex;

    style({display: 'none', blur: 0, opacity: 0});

    function style(source) {
        if (source.display) {
            if (source.display === true) {
                html.show();
            }
            if (source.display === false) {
                html.hide();
            }
        }
        if (source.blur || source.opacity !== undefined) {
            setTimeout(function () {
                if (source.blur !== undefined) {
                    element.style.filter = 'blur(' + source.blur + 'px)';
                }
                if (source.opacity !== undefined) {
                    element.style.opacity = source.opacity;
                }
            }, 1);
        }
    }

    this.on = function (event, func) {
        if (typeof event == "string" && event.length > 0) {
            if (typeof cb[event] == "object" && cb[event].constructor === Array) {
                if (typeof func === "function") {
                    cb[event].push(func);
                }
                else {
                    Debug.warn({event: event}, 'Unable to set callback for [{event}]. Func is not a function');
                }
            }
            else {
                Debug.warn({event: event}, 'Unable to set callback for event [{event}]. No such event');
            }
        }
        else {
            Debug.warn('Unable to set event. Event identifier is not a string or empty');
        }
    };

    this.show = function () {
        if (!this.visible()) {
            if (displayTo) clearTimeout(displayTo);
            style({
                display: true,
                opacity: 1
            });
            visible = true;
            resolve('show');
        }
    };

    this.hide = function () {
        if (this.visible()) {
            if (displayTo) clearTimeout(displayTo);
            style({
                display: true,
                opacity: 0
            });
            displayTo = setTimeout(hide, speed * 1000);
            visible = false;
            resolve('hide');
        }
    };

    this.blur = function () {
        if (!this.blurred()) {
            style({blur: 5});
            blur = true;
        }
    };

    this.focus = function () {
        if (this.blurred()) {
            style({blur: 0});
            blur = false;
        }
    };

    this.visible = function () {
        return visible;
    };

    this.blurred = function () {
        return blur;
    };

    this.background = function (string) {
        if (typeof string === "string" && string.length) {
            element.style.background = string;
        }
    };

}]);