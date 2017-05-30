/**
 * Created by Viktor Khodosevich on 5/11/2017.
 */
$R.ext(['@app', '@Canvas', '@inject', 'Debug',
        function Keyboard(app, canvas, inject, Debug) {

            var callbacks = {},
                active = false,
                enabled = true,
                focused = true,
                queue = [];

            this.keydown = function (code, func) {
                return this.on(code, 'keydown', func);
            };

            this.keyup = function (code, func) {
                return this.on(code, 'keyup', func);
            };

            this.disable = function () {
                enabled = false;
                return this;
            };

            this.enable = function () {
                enabled = true;
                return this;
            };

            this.on = function (code, event, func) {
                if (typeof code == "number" && typeof event == "string") {
                    if (event === 'keyup' || event === 'keydown') {
                        if (typeof func === "function") {
                            if (!callbacks[code]) callbacks[code] = {};
                            if (!callbacks[event]) callbacks[code][event] = [];
                            callbacks[code][event].push(func);
                        }
                        else {
                            Debug.warn('Event callback is not a function');
                        }
                    }
                    else {
                        Debug.warn({e: event}, 'No such type of event as [{e}]');
                    }
                }
                else {
                    Debug.warn({c: code}, 'Wrong key code [{c}]');
                }
                return this;
            };

            function OnAppTick() {
                for (var i = 0; i < queue.length; i++) {
                    queue[i]();
                }
                queue = [];
            }

            function getQueueFunc(e) {
                return function () {
                    var keycode = e.keyCode;
                    if (callbacks[keycode] && callbacks[keycode][e.type]) {
                        for (var i = 0; i < callbacks[keycode][e.type].length; i++) {
                            var event = inject('$KeyboardEvent').build(e);
                            callbacks[keycode][e.type][i].apply(event, [keycode, e.type]);
                        }
                    }
                }
            }

            var canvasClicked = false;

            canvas.element().addEventListener('mousedown', function () {
                canvasClicked = true;
            });

            window.addEventListener('mousedown', function () {
                if (canvasClicked) {
                    focused = true;
                }
                else {
                    focused = false;
                }
                canvasClicked = false;
            });

            window.addEventListener('keydown', function (e) {
                if (!active || !enabled || !focused) return;
                queue.push(getQueueFunc(e));
            });
            window.addEventListener('keyup', function (e) {
                if (!active || !enabled || !focused) return;
                queue.push(getQueueFunc(e));
            });

            app.$on('start', function () {
                active = true;
            });
            app.$on('stop', function () {
                active = false;
            });
            app.$('tick', OnAppTick);
        }
    ]
);