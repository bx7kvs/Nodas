/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@Config',
        function Debug(config) {

            var string = '$R [Debug] : ',
                regexp = /{[a-zA-Z]+}/g,
                regexpname = /[a-zA-Z]+/g,
                warnings = config.define('warnings', false, {isBool: true}, function (v) {
                    warnings = v;
                });


            var errorCb = [], messageCb = [];

            function ResolveEvent(type, data) {
                var array = null;

                if (type === 'error') array = errorCb;
                if (type === 'message') array = messageCb;

                for (var i = 0; i < array.length; i++) {
                    array[i](data);
                }
            }

            this.on = function (event, func) {
                if (typeof func !== "function") return;
                if (event === 'error') errorCb.push(func);
                if (event === 'message') messageCb.push(func);
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
                            data: '[' +data[matchname].toString() + ']'
                        }
                    }
                }
                for (var prop in props) {

                    if (!props.hasOwnProperty(prop)) continue;

                    message = message.replace(props[prop].replace, props[prop].data);
                }

                if(source && source.constructor && source.constructor.name) {
                    message = '['+source.constructor.name+'] : ' + message;
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

                console.warn(message)
            }
        }
    ]
);