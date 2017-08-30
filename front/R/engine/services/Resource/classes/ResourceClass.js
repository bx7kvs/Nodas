/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug',
        function ResourceClass(extend, Debug) {

            var url = null,
                self = this,
                resolveFunctionPassed = false,
                status = -1; // -1 init, 0 loading, 1 loaded, -2 error

            this.loaded = function () {
                return status == 1;
            };

            this.error = function () {
                return status == -2;
            };

            this.loading = function () {
                return status == 0;
            };

            this.url = function (_url) {
                if (_url == undefined) {
                    return url;
                }
                else {
                    if (url == undefined) {
                        url = _url;
                        status = 0;
                        if (resolveFunctionPassed) {
                            ResolveEvent('init', [url]);
                        }
                        else {
                            ResolveEvent('init', [url, ResolveEvent, setStatus]);
                            resolveFunctionPassed = true;
                        }
                    }

                }
                return url;
            };

            var cbContainer = {
                init: [],
                load: [],
                error: [],
                loading: []
            };

            function setStatus(val) {
                if (typeof val !== "number") {
                    Debug.error({val: val}, '[{val}] is not valid value for status');
                    return;
                }
                if (val > 1 || val < -2) {
                    Debug.error({val: val}, '[{val}] no such status possible!');
                    return;
                }
                status = val;
            }

            function ResolveEvent(event, data) {
                if (cbContainer[event]) {
                    data = typeof data == "object" && data.constructor == Array ? data : [];

                    for (var i = 0; i < cbContainer[event].length; i++) {
                        cbContainer[event][i].apply(self, data);
                    }
                }
                else {
                    Debug.warn({e: event}, 'Unable to set event {e}. No such event!');
                }
            }

            this.on = function (event, func) {
                var array = cbContainer[event],
                    func = typeof func == "function" ? func : false;

                if (event == 'load' && status == 1) {
                    func.call(this);
                }
                if (event == 'error' && status == -2) {
                    func.call(this);
                }

                if (!array || !func) {
                    Debug.warn({e: event}, 'Unable to set handler for event [{e}].');
                    return;
                }

                cbContainer[event].push(func);
            };

        }
    ]
);