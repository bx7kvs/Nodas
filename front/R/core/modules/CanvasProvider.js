/**
 * Created by Viktor Khodosevich on 4/27/2017.
 */
$R.$([function CanvasService() {

    function Canvas() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');

        this.context = function () {
            return context;
        };
    }

    this.canvasInjectionConstructor = function () {
        return Canvas;
    }
}]);