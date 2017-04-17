/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.part('Objects' ,['Debug' , function CacheObjectExtension (Debug) {

    var values = {};

    this.value = function (name , func) {
        if(typeof name !== "string") {
            Debug.error('Object Value Cache / name is not a string!');
            return;
        }
        if(typeof func !== "function") {
            Debug.error('Object Value Cache / func is not a function');
            return;
        }

        if(!values[name]) {
            values[name] = {
                value : func(),
                func : func,
                relevant : true
            }
        }

        return this.get(name);
    };

    this.purge = function (name) {
        if(typeof name !== "string") {
            Debug.error('Object Value Cache / Can not purge cache of non string name');
            return;
        }
        if(values[name]) {
            values[name].relevant = false;
        }
    };

    this.get = function (name) {
        if(typeof name !== "string") {
            Debug.error('Object Value Cache / Can not get value of non-string name');
            return;
        }
        if(values[name]) {
            if(!values[name].relevant) {
                values[name].value = values[name].func();
                values[name].relevant = true;
            }

            return values[name].value;
        }
    }

}]);