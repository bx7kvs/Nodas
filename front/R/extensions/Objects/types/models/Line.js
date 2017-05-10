/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['@extend', '$ModelHelper', '$PathHelper', '$ColorHelper', 'Debug',
    function LineObjectModel(extend, ModelHelper, PathHelper, ColorHelper, Debug) {

        extend(this, '$DefaultObjectModel');
        extend(this, '$DefaultFreeStrokeModel');

        //TODO: Add animation morphs!!

        var style = this.extension('Style');

        function SyncPathProperty(path, property) {
            for (var i = 0; i < path.length; i++) {
                if (!property[i]) {
                    property.push(property[property.length - 1]);
                }
            }

        }

        style.define(0, 'path', [[0, 0, 0, 0, 0, 0, 0, 0]],
            function (value) {
                if (PathHelper.checkSimplePath(value)) {
                    var old = style.get('path'),
                        result = PathHelper.convertSimplePath(value);

                    if (old.length !== result.length) {
                        SyncPathProperty(result, style.get('strokeStyle'));
                        SyncPathProperty(result, style.get('strokeWidth'));
                        SyncPathProperty(result, style.get('strokeColor'));
                    }

                    return result;
                }
                else {
                    Debug.warn('Line Model / Invalid value for path!');
                    return false;
                }
            },
            function (value) {
                return PathHelper.convertComplexPath(value);
            }
        );
    }]);