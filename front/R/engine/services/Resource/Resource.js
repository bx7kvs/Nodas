/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service(
    ['@Canvas', '@inject', 'Debug', '@Config',
        function Resource(Canvas, inject, Debug, Config) {

            var all = [],
                container = {
                    ImageResources: [],
                    SpriteResources: [],
                    FontResources: [],
                    AudioResources: []
                },
                loadCounter = 0,
                self = this,
                loaderMode = 'auto';

            Config.define('loaderMode', false, {isString: true}).watch(function (v) {
                loaderMode = v === 'manual' || v === 'auto' ? v : 'auto';
            });

            function getResourceByURL(type, search) {
                if (type === 'font') search = search[0];

                var result = null,
                    array = container[type + 's'];

                if (!array) return result;

                for (var i = 0; i < array.length; i++) {
                    if (array[i].url() === search) {
                        result = array[i];
                        break;
                    }
                }

                return result;
            }

            function injectByType(type, src) {
                var existed = getResourceByURL(type, src);
                if (existed) {
                    return existed;
                } else {
                    var _type = type;

                    var result = inject('$' + type);

                    result.on('load', function () {
                        loadCounter--;
                        ResolveEvent('load', [this, loadCounter, all.length]);
                    });
                    result.on('error', function () {
                        loadCounter--;
                        ResolveEvent('error', [this, loadCounter, all.length]);
                    });

                    result.url(src);

                    container[_type + 's'].push(result);

                    all.push(result);

                    loadCounter++;

                    if(loaderMode === 'auto') result.load();

                    ResolveEvent('add', [result, loadCounter, all.length]);

                    return result;
                }
            }

            this.image = function (src) {
                return injectByType('ImageResource', src);
            };

            this.sprite = function (src) {
                return injectByType('SpriteResource', src);
            };

            this.audio = function (src) {
                return injectByType('AudioResource', src);
            };

            this.font = function (src, weight, style) {
                return injectByType('font', [src, weight, style]);
            };

            this.load = function () {
                if(loaderMode === 'manual') {
                    for(var i = 0 ; i < all.length; i++) {
                        all[i].load();
                    }
                }
            };

            var cBContainer = {
                load: [],
                error: [],
                add: []
            };

            this.on = function (event, func) {
                if (typeof event === "string") {
                    var array = cBContainer[event];
                    if (array) {
                        if (typeof func === "function") {
                            array.push(func);
                        } else {
                            Debug.warn({event: event}, 'Unable to set event [{event}] callback. func is not a function!');
                        }
                    } else {
                        Debug.warn({event: event}, 'Unable to set event [{event}]. No such event');
                    }
                } else {
                    Debug.warn('Unable to set event callback. Event name is not a string');
                }
            };

            this.off = function (event, func) {
                if (typeof event === "string") {
                    var array = cBContainer[event];
                    if (array) {
                        if (typeof func === "function") {
                            var narray = [];
                            func.$$SEARCH = true;
                            for (var i = 0; i < array.length; i++) {
                                if (!array[i].$$SEARCH) {
                                    narray.push(array[i])
                                }
                            }
                            delete func.$$SEARCH;
                            cBContainer[event] = narray;
                        }
                    } else {
                        Debug.warn({event: event}, 'Unable to unset callback for event [{event}]. No such event');
                    }
                } else {
                    Debug.warn('Unable to unset event. Event is not a string');
                }
            };

            this.list = function () {
                return [].concat(container.images).concat(container.audios).concat(container.fonts).concat(container.sprites);
            };

            function ResolveEvent(type, data) {
                var array = cBContainer[type];
                if (!array) return;

                for (var i = 0; i < array.length; i++) {
                    array[i].apply(self, data);
                }
            }
            function updateResources(canvas, date) {
                for (var i = 0; i < container.SpriteResources.length; i++) {
                    if (container.SpriteResources[i].ready() && container.SpriteResources[i].loaded()) {
                        container.SpriteResources[i].tick(date);
                    }
                }
            }

            Canvas.queue(-2, updateResources);
        }
    ]
);