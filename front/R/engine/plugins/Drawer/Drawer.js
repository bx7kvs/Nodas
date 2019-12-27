/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.plugin('Objects',
    ['Debug',
        function Drawer(Debug) {

            var f = null,
                cb = {
                    before: [],
                    after: []
                },
                object = this.object(),
                pipe = {},
                pipeSize = 0,
                conditions = [],
                rendering = true,
                exports = null;

            function resolve(event, args) {
                for (var i = 0; i < cb[event].length; i++) {
                    cb[event].apply(object, args);
                }
            }

            function renderAllowed(args) {
                if (conditions.length > 0) {
                    for (var i = 0; i < conditions.length; i++) {
                        rendering = conditions[i].apply(object, args);
                        if (rendering === false) break;
                    }
                    return rendering;
                } else {
                    return true;
                }
            }

            this.f = function (func) {
                if (typeof func !== "function") {
                    Debug.error({}, 'ObjectDrawer / func is not a function!');
                    delete this.f;
                    return;
                }
                f = func;
                delete this.f;
            };

            this.exports = function () {
                if (exports === null) {
                    exports = arguments[0];
                    this.export = function () {
                        return typeof exports === "function" ? exports() : exports;
                    };
                    delete this.exports;
                    return this;
                }
            };


            this.filter = function (func) {
                if (typeof func === "function") {
                    conditions.push(func);
                } else {
                    Debug.error({tfunc: typeof func}, 'Drawer Filter callback {tfunc} is not a function', this);
                }
            };

            this.register('pipe', function (f, order) {
                order = order === undefined ? 0 : order;
                if (typeof order === "number") {
                    if (typeof f === "function") {
                        if (!pipe[order]) {
                            pipe[order] = [];
                        }
                        pipe[order].push(f);
                        pipeSize++;
                    } else {
                        Debug.error({ftype: typeof f}, 'Pipe callback {ftype} is not a function', this);
                    }
                } else {
                    Debug.error({order: order}, 'Invalid pipe function ordering {order}', this);
                }
                return object;
            });

            this.register('unpipe', function (f) {
                if (typeof f === "function") {
                    f.$$SEARCH = true;
                    var found = false;
                    for (var index in pipe) {
                        if (pipe.hasOwnProperty(index)) {
                            pipe[index] = pipe[index].filter(function (cb) {
                                var result = !cb.$$SEARCH;
                                if (result && !found) {
                                    found = true;
                                    pipeSize--;
                                }
                                return result;
                            });
                        }
                    }
                    delete f.$$SEARCH;
                }
                return object;
            });

            this.register('before', function (func) {
                if (typeof func == "function") {
                    cb.before.push(func);
                } else {
                    Debug.warn('Unable to set event [before Render]. func is not a Function', this)
                }
            });

            this.register('after', function (func) {
                if (typeof func == "function") {
                    cb.after.push(func);
                } else {
                    Debug.warn('Unable to set event [after Render]. func is not a Function', this)
                }
            });


            //Draw function variables
            var pipeBreak = false,
                pipeIndex = 0,
                pipeOrder = 0;

            this.draw = function () {
                rendering = true;
                if (renderAllowed(arguments)) {
                    arguments[0].save();

                    resolve('before', arguments);

                    arguments[0].globalCompositeOperation = object.extension('Style').get('blending');
                    arguments[0].globalAlpha *= object.extension('Style').get('opacity');

                    if (pipeSize) {
                        for (pipeOrder in pipe) {
                            if (pipe.hasOwnProperty(pipeOrder)) {
                                for (pipeIndex = 0; pipeIndex < pipe[pipeOrder].length; pipeIndex++) {
                                    pipeBreak = pipe[pipeOrder][pipeIndex].apply(this, arguments) === false;
                                    if (pipeBreak) break;
                                }
                            }
                            if (pipeBreak) break;
                        }
                    }

                    if (!pipeBreak) {
                        if (f) f.apply(this, arguments);
                    } else pipeBreak = false;

                    resolve('after', arguments);

                    arguments[0].restore();

                }
            };

        }
    ]
);