/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.app(
    ['@app', 'Objects', 'Canvas', 'Debug',
        function Loader(app, objects, canvas) {

            var resourceProviders = [],
                providersRegistered = [],
                resourcesCount = 0,
                loadCount = 0,
                progress = 0,
                loader = this;

            var progressLine = objects.line(),
                counter = objects.text();

            function update() {
                progress = (loadCount/(resourcesCount > 0 ? resourcesCount : 1));
                counter.style({
                    text : 'loading' +(progress * 100) + '%',
                    position : [canvas.width() /2, canvas.height() - 30],
                    anchor : ['center', 'bottom']
                });
                progressLine.style({
                    path : [[0 ,canvas.height() - 10],[canvas.width() * progress, canvas.height() - 10 ]],
                    strokeWidth : 10
                });

                if(progress >= 1) {
                    resolve('load');
                }
            }

            canvas.on('canvasresize', update);

            app.$define('register', function (provider) {
                provider.on('add', function () {
                    resourcesCount ++;
                    update();
                });
                provider.on('error', function () {
                    resourcesCount --;
                    update();
                });
                provider.on('load', function () {
                    resourcesCount --;
                    update();
                });
                providersRegistered.push(provider);
            });

            var cb = {
                load : [],
                int : []
            };

            function resolve(event) {
                if(cb[event]) {
                    var args = [progress,resourcesCount,loadCount];
                    for(var i = 0 ; i < cb[event].length; i++) {
                        cb[event].apply(loader, args);
                    }
                }
                else {
                    Debug.warn({event: event},'Unable to resolve event [{event}]. No such event.');
                }
            }

            app.$define('on', function (event,func) {
                if(typeof event == "string") {
                    if(cb[event]) {
                        if(typeof func == "function") {
                            cb[event].push(func);
                        }
                        else {
                            Debug.warn({event : event}, 'Unable to set callback foe event [{event}]. Callback is not a function.')
                        }
                    }
                    else {
                        Debug.warn({event : event}, 'Unable to set callback for event [{event}]. No such event.')
                    }
                }
                else {
                    Debug.warn('Unable to set callback. Wrong arguments.');
                }
            });
            app.$define('reset', function () {
                progress = 0;
                providersRegistered = [];
                loadCount = 0;
                resourcesCount = 0;
                return this;
            });

            app.$define('start', function () {
                app.$('start');
                return this;
            });
            app.$define('stop', function () {
                app.$('stop');
                return this;
            });

        }
    ]
);