/**
 * Created by Viktor Khodosevich on 4/27/2017.
 */
$R.$(function ApplicationHTMLRootProvider() {


    var elements = {},
        hiddendiv = document.createElement('div');

    function getHTmlRootConstructor(canvas, appname) {
        var lastparent = null;

        elements[appname] = {
            element: document.createElement('div'),
            $constructor: function HTMLRoot() {
                var element = elements[appname].element,
                    cb = {
                        resize: []
                    };

                var width = 0,
                    height = 0;

                this.element = function () {
                    return element;
                };

                function resolve(event, argarray) {
                    var arr = cb[event],
                        args = argarray && typeof argarray == "object" && argarray.constructor == Array ? argarray : [];

                    if (arr) {
                        for (var f = 0; f < arr.length; f++) {
                            var _args = [];
                            arr[f].apply(this, args);
                        }
                    }
                }

                this.on = function (event, func) {
                    if (typeof event == "string" && event.length > 0) {
                        if (cb[event]) {
                            if (typeof func == "function") {
                                cb[event].push(func);
                            }
                            else {
                                throw new Error('Unable to set event [' + event + '] callback. Not a function');
                            }
                        }
                        else {
                            throw new Error('Unable to set event [' + event + ']. No such event.');
                        }
                    }
                    else {
                        throw new Error('Unable to set event. Event name is not a string or empty.');
                    }
                };

                this.hide = function () {
                    lastparent = this.element().parentNode;
                    hiddendiv.appendChild(this.element());
                };

                this.show = function () {
                    if(lastparent) {
                        lastparent.appendChild(this.element());
                        lastparent = null;
                    }
                };

                function checkElementResize(w, h) {
                    if (w !== width || h !== height) {
                        width = w;
                        height = h;
                        canvas.setAttribute('width', width);
                        canvas.setAttribute('height', height);
                        resolve('resize', [w, h]);
                    }
                }

                document.addEventListener('DOMContentLoaded', function () {
                    checkElementResize(element.offsetWidth, element.offsetHeight);
                });

                window.addEventListener('resize', function () {
                    checkElementResize(element.offsetWidth, element.offsetHeight);
                });
            }
        };
        elements[appname].element.setAttribute('class', 'reflect-canvas-wrapper');
        elements[appname].element.setAttribute('style', 'position:absolute; left:0;top:0;width:100%;height:100%;');
        canvas.setAttribute('style', 'position:absolute; left:0;top:0;');
        canvas.setAttribute('id','reflect-canvas-'+appname);
        canvas.setAttribute('class', 'reflect-canvas-output');
        elements[appname].element.appendChild(canvas);
        document.getElementsByTagName('body')[0].appendChild(elements[appname].element);
        return elements[appname].$constructor;
    }

    this.HTMLRootConstructor = function (canvas,appname) {
        return getHTmlRootConstructor(canvas,appname);
    }
});