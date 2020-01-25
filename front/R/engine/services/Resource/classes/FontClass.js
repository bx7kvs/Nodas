/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug', '@Config', '@Fonts',
        function FontResource(extend, Debug, config, Fonts) {

            extend(this, '$Resource');

            this.type = 'Font';
            var state = null, resolve = null, font = null,
                root = config.watch('fontDir', function (str) {
                    root = str;
                    if (appended) document.getElementsByTagName('body')[0].removeChild(fontLoaderElement);
                    if (checkInterval) window.clearInterval(checkInterval);
                    getFont();
                }),
                format = Fonts.formats(),
                weight = null,
                style = null,
                response = null,
                appended = false,
                fontLoaderElement = document.createElement('div');

            fontLoaderElement.setAttribute('class', 'reflect-font-loader-element');
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
                this.on('get', function () {
                    getFont();
                });
            });
            var checkInterval = null;

            function getFont() {
                Fonts.font(root, font, weight, style);
                document.getElementsByTagName('body')[0].appendChild(fontLoaderElement);
                appended = true;
                var repeatTillError = 1000,
                    repeatCount = 0,
                    initial = [fontLoaderElement.offsetWidth, fontLoaderElement.offsetHeight];

                fontLoaderElement.style.fontFamily = '"' + Fonts.format(font) + '-' + weight + '", sans-serif';
                checkInterval = setInterval(function () {
                    if (fontLoaderElement.offsetWidth !== initial[0] || fontLoaderElement.offsetHeight !== initial[1]) {
                        document.getElementsByTagName('body')[0].removeChild(fontLoaderElement);
                        appended = false;
                        clearInterval(checkInterval);
                        state(1);
                        resolve('load', []);
                    }
                    repeatCount++;
                    if (repeatCount > repeatTillError) {
                        state(2);
                        resolve('error', []);
                        Debug.warn({font: font + '-' + weight}, 'Unable to load font {font}. Font pending timed out...');
                        document.getElementsByTagName('body')[0].removeChild(fontLoaderElement);
                        appended = false;
                        clearInterval(checkInterval);
                    }
                }, 50);
            }

            this.export = function () {
                return Fonts.format(font)
            };
        }
    ]
);