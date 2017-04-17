/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['@extend', 'Debug', function ImageObjectModel(extend, Debug) {

    extend(this, 'DefaultObjectModel');
    extend(this, 'GlobalSizeModel');

    var style = this.extension('Style');

    style.define(0, 'src', null,
        function (value) {
            if (typeof value == "string") {
                return value;
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid src value');
                return false;
            }
        },
        function (value) {
            return value;
        }
    );
}]);