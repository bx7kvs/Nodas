/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@inject', 'Tree',
        function Objects(inject, Tree) {

            function InjectByType(type, config) {
                var result = inject('$Graphics');

                result.defineType(type);

                if (config && config.length) {
                    result.style.apply(result, config);
                }
                return result;
            }

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

            Tree.root(this.group());

        }
    ]
);