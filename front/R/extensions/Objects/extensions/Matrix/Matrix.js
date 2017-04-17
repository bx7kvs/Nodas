/**
 * Created by Viktor Khodosevich on 2/6/2017.
 */
$R.part('Objects', ['Debug', function MatrixObjectExtension(Debug) {

    var f = null, object = this.object();

    this.f = function (func) {
        if (typeof func == "function") {
            f = func;
            delete this.f;
        }
    };

    function MatrixWrapper() {
        return f.call(object);
    }

    this.register('matrix', function () {
        return this.extension('Cache').value('transformMatrix', MatrixWrapper);
    });

    this.purge = function () {
        object.extension('Cache').purge('transformMatrix');
        if(object.type() == 'Group') {
            var layers = object.extension('Layers');
            layers.forEach(function () {
                this.extension('Cache').purge('transformMatrix');
            });
        }
    };
}]);