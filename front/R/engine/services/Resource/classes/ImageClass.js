/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug',
        function ImageResource(extend, Debug) {

            extend(this, '$Resource');

            var url = null, resolveEventFunc = null, stateFunc = null, image = new Image(), width = 0, height = 0;

            this.type = 'Image';

            this.on('init', function (_url, resolveFunc, setStateFunc) {
                resolveEventFunc = resolveFunc;
                stateFunc = setStateFunc;
                url = _url;
                CreateImage();
            });

            function CreateImage() {
                image.addEventListener('load', function () {
                    stateFunc(1);
                    width = image.width;
                    height = image.height;
                    resolveEventFunc('load', []);
                });
                image.addEventListener('error', function () {
                    stateFunc(-2);
                    resolveEventFunc('error', []);
                    Debug.error({url: url}, 'Unable to load image [{url}].');
                });

                image.setAttribute('src', url);
            }

            this.width = function () {
                return width;
            };

            this.height = function () {
                return height;
            };
            this.export = function () {
                return image;
            };

        }
    ]
);