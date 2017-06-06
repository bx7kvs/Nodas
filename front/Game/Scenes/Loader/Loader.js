/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.app(
    ['@app', 'Objects', 'Canvas', 'Debug', 'Container',
        function Loader(app, objects, canvas, Debug, Container) {

            var progress = 0,
                loaded = 0,
                pending = 0,
                active = false,
                providers = [];

            function onImageLoad() {

            }

            function onImageAdd() {

            }

            function onImageError() {

            }
            app.$define('active' , function () {
                return active;
            });

            app.$define('terminate', function () {
                if (app.active()) {
                    progress = 0;
                    loaded = 0;
                    pending = 0;
                    for (var i = 0; i < providers.length; i++) {
                        providers[i].off('load', onImageLoad);
                        providers[i].off('error', onImageError);
                        providers[i].off('add', onImageAdd);
                    }
                    providers = [];
                    active = false;
                    app.$('stop');
                    Container.hide();
                }
            });
            app.$define('load', function (scenes) {
                setTimeout(function () {
                    app.terminate();
                    active = true;
                    var apps = [];
                    for(var s = 0; s < scenes.length; s++) {
                        var _app = $R.application(scenes[s]);
                        if(_app) {
                            apps.push(_app);
                        }
                    }

                    for (var i = 0; i < apps.length; i++) {
                        if(apps[i].resourceProvider) {
                            var provider = apps[i].resourceProvider();
                            if(provider){
                                provider.on('load', onImageLoad);
                                provider.on('error', onImageError);
                                provider.on('add', onImageAdd);
                                providers.push(provider);
                                var resources = provider.list();
                                for(var i = 0 ; i < resources.length; i++) {
                                    if(resources[i].loaded() || resources[i].error()) {
                                        loaded ++;
                                    }
                                    else if(resources[i].loading()) {
                                        pending++;
                                    }
                                }
                            }
                        }
                    }
                    Container.show();
                    app.$('start');
                },1);
            });
        }
    ]
);