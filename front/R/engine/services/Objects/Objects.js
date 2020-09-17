/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@inject', 'Tree', 'Debug',
        function Objects(inject, Tree, Debug) {

            function InjectByType(type, config) {
                var id = config[0];

                if (typeof id === "string") {
                    if (id.length > 0) {
                        var result = inject('$Graphics').define(type, id);
                        Tree.root().append(result);
                        if (config[1]) result.style(config[1]);
                        return result;
                    } else Debug.error({t: type}, 'Id is empty. Unable to create [t]');
                } else Debug.error({t: type}, 'Id is not a string. Unable to create [t]');
            }

            this.create = function (type) {
                return inject('$Graphics').define(type);
            };

            this.group = function () {
                return InjectByType('Group', arguments);
            };

            this.line = function () {
                return InjectByType('Line', arguments);
            };

            this.rect = function () {
                return InjectByType('Rectangle', arguments);
            };

            this.circle = function () {
                return InjectByType('Circle', arguments);
            };

            this.image = function () {
                return InjectByType('Image', arguments);
            };

            this.sprite = function () {
                return InjectByType('Sprite', arguments);
            };

            this.text = function () {
                return InjectByType('Text', arguments);
            };

            this.area = function () {
                return InjectByType('Area', arguments);
            };

            this.get = function (id) {
                return Tree.get(id);
            };

            Tree.root(inject('$Graphics').define('Group', 'root'));
        }
    ]
);
