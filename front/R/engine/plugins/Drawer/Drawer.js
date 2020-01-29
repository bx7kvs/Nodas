/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.plugin('Objects',
    ['Debug',
        function Drawer(Debug) {

            var draw = null,
                update = null,
                object = this.object(),
                pipeSize = 0,
                conditions = [],
                rendering = true,
                exports = null,
                updateCb = [],
                cbIterator = 0,
                callUpdateCb = false,
                drawerPipeBefore = {},
                drawerPipeAfter = {},
                beforePipeSize = 0,
                afterPipeSize = 0;

            this.spriteUpdated = function (cb) {
                if (this.$$CALL) callUpdateCb = true;
                else {
                    if (typeof cb === "function") {
                        updateCb.push(cb);
                    } else Debug.error({cb: typeof cb}, 'Sprite update callback {cb} is not a function.', this);
                }
            };

            var renderAllowIterator = 0;

            function renderAllowed(args) {
                if (conditions.length > 0) {
                    for (renderAllowIterator = 0; renderAllowIterator < conditions.length; renderAllowIterator++) {
                        rendering = conditions[renderAllowIterator].apply(object, args);
                        if (rendering === false) break;
                    }
                    return rendering;
                } else {
                    return true;
                }
            }

            this.drawFunction = function (func) {
                if (typeof func !== "function") {
                    Debug.error({}, 'ObjectDrawer / func is not a function!');
                    delete this.drawFunction;
                    return;
                }
                draw = func;
                delete this.drawFunction;
            };

            this.updateFunction = function (func) {
                if (typeof func !== "function") {
                    Debug.error({}, 'ObjectDrawer / func is not a function!');
                    delete this.updateFunction;
                    return;
                }
                update = func;
                delete this.updateFunction;
            };

            this.export = function () {
                if (exports === null) {
                    exports = arguments[0];
                    this.export = function () {
                        if (callUpdateCb) {
                            for (cbIterator = 0; cbIterator < updateCb.length; cbIterator++) {
                                updateCb[cbIterator].call(object)
                            }
                            callUpdateCb = false;
                        }
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

            this.pipe = function (f, order) {
                order = order === undefined ? 0 : order;
                if (typeof order === "number") {
                    if (typeof f === "function") {
                        if (order > 100) {
                            if (!drawerPipeAfter[order]) {
                                drawerPipeAfter[order] = [];
                            }
                            drawerPipeAfter[order].push(f);
                            afterPipeSize++
                        } else {
                            if (!drawerPipeBefore[order]) {
                                drawerPipeBefore[order] = [];
                            }
                            drawerPipeBefore[order].push(f);
                            beforePipeSize++;
                        }
                        pipeSize++;
                    } else {
                        Debug.error({ftype: typeof f}, 'Pipe callback {ftype} is not a function', this);
                    }
                } else {
                    Debug.error({order: order}, 'Invalid pipe function ordering {order}', this);
                }
                return object;
            };

            this.unpipe = function (f) {
                if (typeof f === "function") {
                    var index;
                    for (index in drawerPipeBefore) {
                        if (drawerPipeBefore.hasOwnProperty(index)) {
                            drawerPipeBefore[index] = drawerPipeBefore[index].filter(function (cb) {
                                if (cb === f) {
                                    pipeSize--;
                                    beforePipeSize--;
                                    return false;
                                } else return true;
                            });
                        }
                    }
                    for (index in drawerPipeAfter) {
                        if (drawerPipeAfter.hasOwnProperty(index)) {
                            drawerPipeAfter[index] = drawerPipeAfter[index].filter(function (cb) {
                                if (cb === f) {
                                    pipeSize--;
                                    afterPipeSize--;
                                    return false;
                                } else return true;
                            });
                        }
                    }
                }
                return object;
            };

            this.register('pipe', this.pipe);

            this.register('unpipe', this.unpipe);


            //Draw function variables
            var pipeIndex = 0,
                pipeOrder = 0,
                originalContext = null,
                currentContext = null,
                callbacksResult = null,
                args = [null, null, null];

            this.draw = function () {
                if (callUpdateCb) {
                    for (cbIterator = 0; cbIterator < updateCb.length; cbIterator++) {
                        updateCb[cbIterator].call(object)
                    }
                    callUpdateCb = false;
                }
                rendering = true;


                if (renderAllowed(arguments)) {
                    args[0] = arguments[0];
                    args[1] = arguments[1];
                    args[2] = arguments[2];
                    originalContext = args[0];

                    originalContext.save();

                    if (update) update.apply(this, args);

                    if (beforePipeSize) {
                        for (pipeOrder in drawerPipeBefore) {
                            if (drawerPipeBefore.hasOwnProperty(pipeOrder)) {
                                for (pipeIndex = 0; pipeIndex < drawerPipeBefore[pipeOrder].length; pipeIndex++) {
                                    args[0].save();
                                    callbacksResult = drawerPipeBefore[pipeOrder][pipeIndex].apply(this, args);
                                    args[0].restore();
                                    currentContext = callbacksResult ? callbacksResult : false;
                                    args[0] = currentContext;
                                    if (!currentContext) break;
                                }
                            }
                            if (!currentContext) break;
                        }
                    }

                    if (args[0]) {
                        if (args[0] === originalContext) {
                            args[0].globalCompositeOperation = object.extension('Style').get('blending');
                            args[0].globalAlpha *= object.extension('Style').get('opacity');

                            if (draw) draw.apply(this, args);
                        } else {
                            originalContext.globalCompositeOperation = object.extension('Style').get('blending');
                            originalContext.globalAlpha *= object.extension('Style').get('opacity');
                            if (draw) draw.apply(this, args);
                            originalContext.drawImage(args[0].canvas,
                                0, 0, args[0].canvas.width, args[0].canvas.height);
                            args[0] = originalContext;
                        }
                        if (afterPipeSize) {
                            for (pipeOrder in drawerPipeAfter) {
                                if (drawerPipeAfter.hasOwnProperty(pipeOrder)) {
                                    for (pipeIndex = 0; pipeIndex < drawerPipeAfter[pipeOrder].length; pipeIndex++) {
                                        args[0].save();
                                        callbacksResult = drawerPipeAfter[pipeOrder][pipeIndex].apply(this, args);
                                        args[0].restore();
                                        currentContext = callbacksResult ? callbacksResult : false;
                                        args[0] = currentContext;
                                        if (!currentContext) break;
                                    }
                                }
                                if (!currentContext) break;
                            }
                        }
                    }

                    originalContext.restore();

                }
            };
        }
    ]
);