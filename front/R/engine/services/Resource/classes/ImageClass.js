/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug',
        function Image(extend, Debug) {

            extend(this, '$ResourceClass');

            var url = null, resolveEventFunc = null, stateFunc = null, image = null, width = 0, height = 0;

            this.type = 'Image';

            this.on('init', function (_url, resolveFunc, setStateFunc) {
                resolveEventFunc = resolveFunc;
                stateFunc = setStateFunc;
                url = _url;
                CreateImage();
            });

            function CreateImage() {
                image = document.createElement('img');
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