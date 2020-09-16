/**
 * Created by bx7kv_000 on 12/25/2016.
 */

$R.service.class('Objects',
    ['@extend', '@inject', '<Plugins',
        function Graphics(extend, inject, plugins) {

            var type = null,
                resolved_plugins = {};

            this.extension = function (name) {
                return resolved_plugins[name];
            };

            this.type = function (str) {
                if (typeof str === "string") {
                    return type === str;
                }
                return type;
            };

            this.define = function (t, id) {
                if (typeof t !== "string") return;

                delete this.define;

                type = t;

                var list = plugins.list();

                extend(this, '$DefaultObjectType');
                for (var i = 0; i < list.length; i++) {
                    resolved_plugins[list[i]] = inject('$Plugin');
                    resolved_plugins[list[i]].defineObject(this);

                    extend(resolved_plugins[list[i]], '<' + list[i]);
                    if (resolved_plugins[list[i]].matchType(type)) {
                        resolved_plugins[list[i]].wrap(this);
                    } else {
                        delete resolved_plugins[list[i]];
                    }
                }
                if(id) this.id(id);

                extend(this, '$' + t + 'ObjectModel');
                extend(this, '$DefaultObjectDrawer');
                extend(this, '$' + t + 'ObjectDrawer');

                extend(this, '$' + t + 'ObjectClass');
                return this;
            };
            this.destroy = function () {
                var prop;
                this.unmount();
                for (prop in resolved_plugins) {
                    if (resolved_plugins.hasOwnProperty(prop)) {
                        resolved_plugins[prop].destroy();
                        delete resolved_plugins[prop];
                    }
                }
                for (prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        delete this[prop];
                    }
                }
                resolved_plugins = undefined; type = undefined;
            }
        }
    ]
);
