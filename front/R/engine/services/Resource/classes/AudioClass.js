/**
 * Created by Viktor Khodosevich on 4/10/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug',
        function AudioResource(extend, Debug) {
            extend(this, '$Resource');


            this.type = 'Audio';


            var resolveEventFunc = null, stateFunc = null, url = null, response = null;

            this.on('init', function (_url, resolveFunc, setStateFunc) {
                resolveEventFunc = resolveFunc;
                stateFunc = setStateFunc;
                url = _url;
                createAudio();
            });

            function createAudio() {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function (e) {
                    stateFunc(1);
                    response = this.response;
                    resolveEventFunc('load', [response]);
                };
                xhr.onerror = function () {
                    stateFunc(-2);
                    resolveEventFunc('error', []);
                    Debug.error({url: url}, 'Unable to load audio [{url}].');
                };
                xhr.send();

            }

            this.export = function () {
                return response;
            }
        }
    ]
);