/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service(
    ['@Canvas', '@inject', 'Debug',
        function Resource(Canvas, inject, Debug) {

            var all = [],
                container = {
                    ImageResources: [],
                    SpriteResources: [],
                    FontResources: [],
                    AudioResources: []
                },
                loadCounter = 0,
                self = this,
                request = null;

            function GetResourceByURL(type, search) {
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

            function InjectByType(type, src) {
                var existed = GetResourceByURL(type, src);
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

                    ResolveEvent('add', [result, loadCounter, all.length]);

                    return result;
                }
            }

            this.image = function (src) {
                return InjectByType('ImageResource', src);
            };

            this.sprite = function (src) {
                return InjectByType('SpriteResource', src);
            };

            this.audio = function (src) {
                return InjectByType('AudioResource', src);
            };

            function preloadRequest(data) {
                if (data.images && data.images.constructor === Array) {
                    for (var i = 0; i < data.images.length; i++) {
                        if (typeof data.images[i] === "string") {
                            if (/^([./_\da-zA-Z]+)(\[(\d+)\])$/.test(data.images[i])) {
                                this.sprite(data.images[i]);
                            } else {
                                this.image(data.images[i]);
                            }
                        }

                    }
                }
                if (data.audio && data.constructor === Array) {
                    for (var i = 0; i < data.audio.length; i++) {
                        if (typeof data.audio[i] === "string") {
                            this.audio(data.audio[i]);
                        }
                    }
                }
                if (data.fonts && data.fonts.constructor === Array) {
                    for (var i = 0; i < data.fonts.length; i++) {
                        if (data.fonts[i] && typeof data.fonts[i] === "object"
                            && typeof data.fonts[i].name === "string" && data.fonts[i].name.length) {

                            var weight = data.fonts[i].weight && typeof data.fonts[i].weight === "number" ?
                                data.fonts[i].weight : 400,
                                style = data.fonts[i].style === 'italic' ? data.fonts[i].style : 'normal';

                            this.font(data.fonts[i].name, weight, style);
                        }
                    }
                }
            }

            this.preload = preloadRequest.bind(this);

            this.preloadByUrl = function (url) {
                if (request) request.abort();
                if (typeof url === "string" && url.length > 0) {
                    request = new XMLHttpRequest();
                    request.addEventListener('load', function () {
                        var result = {};

                        try {
                            result = JSON.parse(response.responseText);
                        } catch (e) {
                            Debug.error({url: url}, 'Unable to parse JSON from [{url}]. Unknown response format.');
                        }
                        preloadRequest(result);
                    });
                    request.addEventListener('error', function () {
                        Debug.error({url: url}, 'Unable to get resources from [{url}] to preload. Server error.');
                        preloadRequest({});
                    });
                    request.addEventListener('abort', function () {
                        Debug.warn({url: url}, 'Unable to get resources from [{url}] to preload. Request aborted.');
                        preloadRequest({});
                    });

                    request.open('GET', url, true);
                    request.setRequestHeader('Content-Type', 'application/json');
                    request.send();
                }
            };

            this.font = function (src, weight, style) {
                return InjectByType('font', [src, weight, style]);
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