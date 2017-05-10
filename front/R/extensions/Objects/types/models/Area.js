/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.part('Objects',
    ['@extend', '$ModelHelper', '$PathHelper', 'Debug',
        function AreaObjectModel(extend, ModelHelper, PathHelper, Debug) {
            extend(this, '$DefaultObjectModel');
            extend(this, '$GlobalBackgroundModel');
            extend(this, '$DefaultFreeStrokeModel');

            var style = this.extension('Style'),
                animation = this.extension('Animation');

            function SyncPathProperty(path, property) {
                for (var i = 0; i < path.length; i++) {
                    if (!property[i]) {
                        property.push(property[property.length - 1]);
                    }
                }

                if (path.length < property.length) {
                    property.splice(path.length - 1, property.length - path.length);
                }

            }

            style.define(0, 'path', [[0, 0, 0, 0, 0, 0, 0, 0]],
                function (value) {
                    if (PathHelper.checkSimplePath(value)) {
                        var old = style.get('path'),
                            result = PathHelper.convertSimplePath(value);
                        if (result[0][0] !== result[result.length - 1][2] || result[0][1] !== result[result.length - 1][3]) {
                            result.push([
                                result[result.length - 1][2],
                                result[result.length - 1][3],
                                result[0][0],
                                result[0][1],
                                result[result.length - 1][2],
                                result[result.length - 1][3],
                                result[0][0],
                                result[0][1]
                            ]);
                        }

                        if (old.length !== result.length) {
                            SyncPathProperty(result, style.get('strokeStyle'));
                            SyncPathProperty(result, style.get('strokeWidth'));
                            SyncPathProperty(result, style.get('strokeColor'));
                        }

                        return result;
                    }
                    else {
                        Debug.warn('Area Model / Invalid value for area path!');
                        return false;
                    }
                },
                function (value) {
                    return PathHelper.convertComplexPath(value);
                }
            );
        }
    ]
);
