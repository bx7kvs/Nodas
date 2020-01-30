/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@Config',
        function Debug(config) {

            var string = 'R⤑',
                regexp = /{[a-zA-Z]+}/g,
                regexpname = /[a-zA-Z]+/g,
                warnings = config.define('warnings', false, {isBool: true}, function (v) {
                    warnings = v;
                });


            var errorCb = [], messageCb = [], infoCb = [], importantCb = [];

            function ResolveEvent(type, data) {
                var array;
                if (type === 'error') array = errorCb;
                if (type === 'message') array = messageCb;
                if (type === 'info') array = infoCb;
                if (type === 'important') array = importantCb;

                for (var i = 0; i < array.length; i++) {
                    array[i](data);
                }
            }

            this.on = function (event, func) {
                if (typeof func !== "function") return;
                if (event === 'error') errorCb.push(func);
                if (event === 'message') messageCb.push(func);
                if (event === 'info') messageCb.push(func);
                if (event === 'important') messageCb.push(func);
            };


            function GetMessage(data, message, source) {
                message = message.toString();

                var matches = message.match(regexp);
                var props = {};

                if (matches) {
                    for (var i = 0; i < matches.length; i++) {
                        var matchname = matches[i].match(regexpname)[0];
                        if (matchname) props[matchname] = {
                            replace: matches[i],
                            data: '[' + (data[matchname] === undefined ? 'undefined' : data[matchname].toString()) + ']'
                        }
                    }
                }
                for (var prop in props) {

                    if (!props.hasOwnProperty(prop)) continue;

                    message = message.replace(props[prop].replace, props[prop].data);
                }

                if (source && source.constructor && source.constructor.name) {
                    message = ' ' + source.constructor.name + '⤑ ' + message;
                }
                message = string + message;
                return message;
            }

            this.error = function (data, message, source) {
                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }

                message = GetMessage(data, message, source);
                ResolveEvent('error', message);
                console.trace();
                throw new Error(message);
            };

            this.warn = function (data, message, source) {

                if (!warnings) return;

                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }
                message = GetMessage(data, message, source);

                ResolveEvent('message', message);
                console.log('%c' + message, 'border-left:4px solid rgb(178,137,75); padding :2px 6px; background: rgba(131,138,0,.1); color: rgb(178,137,75)');

            };

            this.info = function (data, message, source) {
                if (!warnings) return;
                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }
                message = GetMessage(data, message, source);
                ResolveEvent('info', message);
                console.log('%c' + message, 'border-left:2px solid rgb(145,178,75); padding :2px 6px; background: rgba(131,189,8,.1); color: rgb(145,178,75)');
            };

            this.message = function (data, message, source) {
                if (!warnings) return;
                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }
                message = GetMessage(data, message, source);
                ResolveEvent('info', message);
                console.log('%c' + message, 'padding: 1px 10px; border-left:4px solid #10949C; font-weight:bold; background: rgba(0,175,231,.1); color: #10949C');
            };

            this.separator = function (data, message, source) {
                if (!warnings) return;
                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }
                message = GetMessage(data, message, source);
                ResolveEvent('info', message);
                console.log('%c' + message, 'padding: 4px 10px; background: #10949C; color: white');
            };

            this.positive = function (data, message, source) {
                if (!warnings) return;
                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }
                message = GetMessage(data, message, source);
                ResolveEvent('info', message);
                console.log('%c' + message, 'padding: 4px 10px; background: rgb(149,202,0); color: rgb(60,80,0)');
            };

            this.negative = function (data, message, source) {
                if (!warnings) return;
                if (typeof data === "string") {
                    source = message;
                    message = data;
                    data = {};
                }
                message = GetMessage(data, message, source);
                ResolveEvent('info', message);
                console.log('%c' + message, 'padding: 4px 10px; background: rgb(137,0,0); color: white');
            }
        }
    ]
);