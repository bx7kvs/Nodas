/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug',
        function Resource(extend, Debug) {

            var url = null,
                self = this,
                resolveFunctionPassed = false,
                cbContainer = {
                    init: [],
                    get: [],
                    load: [],
                    error: [],
                    loading: []
                },
                status = -1; // -1 init, 0 loading, 1 loaded, 2 error

            this.loaded = function () {
                return status === 1;
            };

            this.error = function () {
                return status === 2;
            };

            this.loading = function () {
                return status === 0;
            };

            this.load = function () {
                if (status < 0) {
                    status = 0;
                    resolveEvent('get', [url]);
                }
            };

            this.url = function (_url) {
                if (_url === undefined) {
                    return url;
                } else {
                    url = _url;
                    if (resolveFunctionPassed) {
                        resolveEvent('init', [url]);
                    } else {
                        resolveEvent('init', [url, resolveEvent, setStatus]);
                        resolveFunctionPassed = true;
                    }
                }

                return this;
            };

            function setStatus(val) {
                if (typeof val !== "number") {
                    Debug.error({val: val}, '{val} is not valid value for status');
                    return;
                }
                if (val > 1 || val <= 2) {
                    Debug.error({val: val}, '{val} no such status possible!');
                    return;
                }
                status = val;
            }

            function resolveEvent(event, data) {
                if (cbContainer[event]) {
                    data = typeof data == "object" && data.constructor === Array ? data : [];

                    for (var i = 0; i < cbContainer[event].length; i++) {
                        cbContainer[event][i].apply(self, data);
                    }
                } else {
                    Debug.warn({e: event}, 'Unable to set event {e}. No such event!');
                }
            }

            this.on = function (event, func) {
                var array = cbContainer[event];
                func = typeof func == "function" ? func : false;

                if (event === 'load' && status === 1) {
                    func.call(this);
                }
                if (event === 'error' && status === 2) {
                    func.call(this);
                }

                if (!array || !func) {
                    Debug.warn({e: event}, 'Unable to set handler for event {e}.');
                    return;
                }

                cbContainer[event].push(func);
            };

        }
    ]
);