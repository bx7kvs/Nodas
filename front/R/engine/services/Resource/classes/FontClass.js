/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug', '$$config', '@HTMLRoot',
        function Font(extend, Debug, config, html) {

            extend(this, '$Resource');

            this.type = 'Font';
            var state = null, resolve = null, font = null,
                root = config.dir && typeof config.dir === "string" ? config.dir : './fonts',
                format = $R.fontFormats(),
                weight = null,
                style = null,
                response = null,
                fontLoaderElement = document.createElement('div');

            fontLoaderElement.style.fontFamily = 'sans-serif';
            fontLoaderElement.style.fontSize = '12px';
            fontLoaderElement.style.lineHeight = '12px';
            fontLoaderElement.style.position = 'absolute';
            fontLoaderElement.style.left = '-9999px';
            fontLoaderElement.style.top = '-9999px';
            fontLoaderElement.innerText = 'abcdefghijklmnopqrstuvwxyz 1234567890[!?,.<>"£$%^&*()~@#-=]';

            this.on('init', function (url, r, s) {
                resolve = r;
                state = s;
                font = url[0];
                weight = url[1];
                style = url[2];
                fontLoaderElement.style.fontStyle = style;
                html.element().appendChild(fontLoaderElement);
                getFont();
            });

            function getFont() {
                $R.font(root, font, weight, style);

                var checkInterval = null,
                    repeatUntillError = 1000,
                    repeatCount = 0,
                    initial = [fontLoaderElement.offsetWidth, fontLoaderElement.offsetHeight];

                fontLoaderElement.style.fontFamily = '"' + font + '-' + weight + '", sans-serif';
                checkInterval = setInterval(function () {
                    if (fontLoaderElement.offsetWidth !== initial[0] || fontLoaderElement.offsetHeight !== initial[1]) {
                        html.element().removeChild(fontLoaderElement);
                        clearInterval(checkInterval);
                        state(1);
                        resolve('load', []);
                    }
                    repeatCount++;
                    if (repeatCount > repeatUntillError) {
                        state(-2);
                        resolve('error', []);
                        Debug.warn({font: font + '-' + weight}, 'Unable to load font [{font}]. Font pending timed out...');
                        html.element().removeChild(fontLoaderElement);
                        clearInterval(checkInterval);
                    }
                }, 50);
            }

            this.export = function () {
                return font;
            };
        }
    ]
);