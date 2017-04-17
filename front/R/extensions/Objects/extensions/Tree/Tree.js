/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['Debug', function TreeObjectExtension(Debug) {

    var parent = null;

    function checkTree (object) {
        if (object.$$TREESEARCHVALUE) {
            return true;
        }
        else {
            if (object.parent()) {
                if(checkTree(object.parent())) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return false;
    }

    function treeViolation (target,object) {
        if(target.type() == 'Group') {

            object.$$TREESEARCHVALUE = true;

            if(!checkTree(target)) {
                delete object.$$TREESEARCHVALUE;
                return false;
            }
            else {
                if(target.$$TREESEARCHVALUE) {
                    if(target.parent()) {
                        Debug.warn({},'You try to append group parent into itself.');
                    }
                }
                else {
                    Debug.warn({},'You try to append group parent into it\'s children.');
                }
                delete object.$$TREESEARCHVALUE;
                return true;
            }
        }
        else {
            if(target.type() != 'Group') {
                Debug.warn({target : target.type(), object : object.type()},'Yoy try to append [{object}] into [{target}].');
                return true;
            }
        }
    }

    var layers = null;

    this.register('append' , function (object) {
        if(this.type() !== 'Group') {
            Debug.watch({type : this.type()}, ' Can not append. type[{type}] of parent is not allowed!');
        }
        else if(!treeViolation(this,object)) {

            if(!layers) layers = this.extension('Layers');

            var object_old_parent = object.parent(),
                object_tree_ext = object.extension('Tree');

            if(object_old_parent) {
                var old_object_parent_layers = object_old_parent.extension('Layers'),
                    object_layer = object.layer();

                old_object_parent_layers.remove(object);

                layers.place(object_layer,object);

                object_tree_ext.parent(this);

            }
            else {

                var object_layer = object.layer();

                layers.place(object_layer,object);

                object_tree_ext.parent(this);
            }

            var box = this.extension('Box');
            box.purge();
        }
        return this;
    });

    this.register('appendTo' , function (object) {
        object.append(this);
        return this;
    });

    this.register('parent' , function () {
        return parent;
    });


    this.parent = function (group) {
        if(!group.type || group.type() !== 'Group') {
            Debug.error('Object Tree Extension / Unable to set object as parent. Not a group!');
        }
        if(group) {
            parent = group;
        }
        else {
            return parent;
        }
    };

}]);