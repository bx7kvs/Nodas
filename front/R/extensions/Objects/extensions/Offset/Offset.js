/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.part('Objects' , ['Debug', function OffsetObjectExtension( Debug) {
    var object = this.object(),
        style = null,
        cache = null;

    function ObjectOffsetFunction() {
        var position = style.get('position'),
            result = [position[0],position[1]];

        var parent = object.parent();

        if(parent) {
            var parent_offset = parent.offset();

            result[0] += parent_offset[0];
            result[1] += parent_offset[1];
        }

        return result;
    }

    this.purge = function () {
        if(!style || !cache) {
            style = object.extension('Style');
            cache = object.extension('Cache');
        }

        cache.purge('offset');

        if(object.type() == 'Group') {
            var layers = object.extension('Layers');
            layers.forEach(function () {
                this.extension('Offset').purge();
            });
        }
    };

    this.register('offset' , function () {
        if(!style) {
            style = this.extension('Style');
            cache = this.extension('Cache');
        }
        return cache.value('offset' , ObjectOffsetFunction);
    });
}]);