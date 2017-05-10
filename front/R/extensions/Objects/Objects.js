/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['@inject', '$Tree', '@app', function Objects(inject, Tree, app) {

    function InjectByType(type) {
        var result = inject('$Graphics');

        result.defineType(type);

        return result;
    }

    this.group = function () {
        return InjectByType('Group');
    };

    this.line = function () {
        return InjectByType('Line');
    };

    this.rect = function () {
        return InjectByType('Rectangle');
    };

    this.circle = function () {
        return InjectByType('Circle');
    };

    this.image = function () {
        return InjectByType('Image');
    };

    this.sprite = function () {
        return InjectByType('Sprite');
    };

    this.text = function () {
        return InjectByType('Text');
    };

    this.area = function () {
        return InjectByType('Area');
    };

    this.group();

}]);