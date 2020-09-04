/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.plugin('Objects',
    ['Debug',
        function Layers(Debug) {
            var layers = {
                    0: []
                },
                layer = 0;

            this.register('layer', function (val) {
                if (val === undefined) return layer;
                else if (typeof val !== "number" || val < 0) {
                    Debug.warn({n: val}, 'Value {n} is not a number or less than 0', this);
                    return this;
                }

                if (this.parent()) {
                    var parent_layer_ext = this.parent().extension('Layers');
                    parent_layer_ext.place(val, this);
                }
                layer = val;
                return this;

            });

            function removeObjectFromLayers(object) {
                var done = false;
                for (var layer in layers) {
                    if (layers.hasOwnProperty(layer)) {
                        done = false;
                        for (var i = 0; i < layers[layer].length; i++) {
                            if(layers[layer][i] === object) {
                                done = true;
                                layers[layer].splice(i, 1);
                                break;
                            }
                        }
                        if (done) break;
                    }
                }
            }

            this.place = function (layer, object) {
                removeObjectFromLayers(object);
                if (!layers[layer]) layers[layer] = [];
                layers[layer].push(object);
            };

            this.remove = function (object) {
                removeObjectFromLayers(object);
            };

            this.forEach = function (func) {
                var iterator = 0,
                    layer = null;
                for (layer in layers) {
                    for (iterator = 0; iterator < layers[layer].length; iterator++) {
                        func.call(layers[layer][iterator], layers[layer][iterator]);
                    }
                }
            };

            this.layers = function () {
                return layers;
            };
            this.destroy(function () {
                var prop;
                layer = undefined;
                for(prop in layers) {
                    if(layers.hasOwnProperty(prop)) {
                        while (layers[prop][0]) {
                            layers[prop][0].destroy();
                            layers[prop].shift();
                        }
                        delete layers[prop];
                    }
                }
            });
        }
    ]
);