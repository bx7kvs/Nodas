/**
 * Created by bx7kv_000 on 12/25/2016.
 */

$R.part('Objects', ['@extend', '@inject',function Graphics(extend, inject) {

    var type = null,
        extensions = ['Cache', 'Style', 'Box', 'Animation', 'Matrix', 'Drawer', 'Layers', 'Tree', 'Mouse', 'Text'],
        resolved_extensions = {};

    this.extension = function (name) {
        return resolved_extensions[name];
    };

    this.type = function () {
        return type;
    };

    this.defineType = function (t) {
        if (typeof t !== "string") return;

        delete this.defineType;

        type = t;
        for (var i = 0; i < extensions.length; i++) {
            resolved_extensions[extensions[i]] = inject('Extension');
            resolved_extensions[extensions[i]].defineObject(this);
            extend(resolved_extensions[extensions[i]],extensions[i] + 'ObjectExtension');
            if(resolved_extensions[extensions[i]].matchType(type)) {
                resolved_extensions[extensions[i]].wrap(this);
            }
            else {
                delete resolved_extensions[extensions[i]];
            }
        }
        extend(this, t + 'ObjectModel');
        extend(this, 'DefaultObjectDrawer');
        extend(this, t + 'ObjectDrawer');
        extend(this, 'DefaultObjectType');
        extend(this, t + 'ObjectClass');

    };

}]);