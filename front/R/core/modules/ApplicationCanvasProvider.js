/**
 * Created by Viktor Khodosevich on 4/27/2017.
 */
$R.$([function ApplicationCanvasProvider() {

    var canvases = {};


    function getCanvasConstructor(appname) {
       return function Canvas() {
            var canvas = canvases[appname].element,
                context = canvas.getContext('2d');

            this.element = function () {
                return canvas;
            };

            this.context = function () {
                return context;
            };
        }
    }

    this.canvasInjectionConstructor = function (appname) {
        canvases[appname] = {
            appname : appname,
            element : document.createElement('canvas'),
            constructor : getCanvasConstructor(appname)
        };
        return canvases[appname].constructor;
    };

    this.getApplicationCanvas = function (app) {
        return canvases[app].element;
    };
}]);