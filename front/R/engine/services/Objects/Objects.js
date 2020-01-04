/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@inject', 'Tree',
        function Objects(inject, Tree) {

            function create(type) {
                return inject('$Graphics').defineType(type);
            }

            function InjectByType(type, config) {
                var result = create(type);

                if (config && config.length) {
                    result.style.apply(result, config);
                }
                Tree.root().append(result);
                return result;
            }

            this.create = create;

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

            Tree.root(inject('$Graphics').defineType('Group'));
        }
    ]
);