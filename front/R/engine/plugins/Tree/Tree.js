/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.plugin('Objects', ['Debug', 'Tree',
        function Tree(Debug, TreeService) {

            var parent = null,
                identity = null,
                nonLetters = /[^a-zA-Z0-9-]+/gm,
                capitals = /[A-Z]/g;

            function normaliseIdentity(id) {
                id = id.replace(nonLetters, '');
                id = id.replace(capitals, function (string) {
                    return '-' + string.toUpperCase();
                })
                id = id.replace('--', '-');
                id = id.replace(/(^-)|(-$)/g, '');
                return id;
            }

            function checkTree(target, object) {
                if (target === object) {
                    return true;
                } else {
                    if (target.parent()) {
                        return checkTree(target, target.parent());
                    } else {
                        return false;
                    }
                }
            }

            function treeViolation(target, object) {
                if (target.type('Group')) {
                    if (!checkTree(target, object)) {
                        return false;
                    } else {
                        if (target === object) {
                            if (target.parent()) {
                                Debug.warn('You try to append group parent into itself.');
                            }
                        } else {
                            Debug.warn('You try to append group parent into it\'s children.');
                        }
                        return true;
                    }
                } else {
                    if (target.type() !== 'Group') {
                        Debug.warn({
                            target: target.type(),
                            object: object.type()
                        }, 'Yoy try to append [{object}] into [{target}].');
                        return true;
                    }
                }
            }

            var layers = null;

            this.register('unmount', function () {
                if(!identity) {
                    Debug.warn('Unable to unmount a free object');
                    return this;
                }
                if (this.parent()) {
                    this.events.resolve('unmount', this, this);
                    this.parent().extension('Layers').remove(this);
                    parent = null;
                }
                return null;
            });

            this.register('append', function (object) {
                if(!identity) {
                    Debug.warn('Unable to append a free object');
                    return this;
                }
                if (!this.type('Group')) {
                    Debug.watch({type: this.type()}, ' Can not append. type[{type}] of parent is not allowed!');
                } else if (!treeViolation(this, object)) {
                    object.unmount();
                    if (!layers) layers = this.extension('Layers');
                    layers.place(object.layer(), object);
                    object.extension('Tree').parent(this);
                    this.extension('Box').purge();
                    object.events.resolve('mount', object, object);
                }
                return this;
            });

            this.register('appendTo', function (object) {
                if(!identity) {
                    Debug.warn('Unable to append a free object');
                    return this;
                }
                object.append(this);
                return this;
            });

            this.register('parent', function () {
                return parent;
            });

            this.register('id', function (id) {
                if (identity === null) {
                    if (typeof id === "string") {
                        id = normaliseIdentity(id);
                        if (id.length) {
                            identity = id;
                            TreeService.register(this);
                            return this;
                        } else Debug.error('Normalised identity seems to be empty. Unable to register Graphics');
                    } else if (id === undefined) {
                        return identity;
                    } else Debug.error('Unable to set initial id. Id is not a string');
                } else {
                    if (typeof id === "string") {
                        id = normaliseIdentity(id);
                        if (id.length) {
                            TreeService.register(this, id);
                        } else Debug.error('Normalised identity seems to be empty. Unable to register Graphics');

                    } else if (id === undefined) {
                        return identity;
                    } else Debug.error('Id is not a string');
                }
            })

            this.parent = function (group) {
                if (typeof group.type !== "function" || !group.type('Group')) {
                    Debug.error({
                        group: typeof group,
                        type: group.type ? group.type() : 'unknownType'
                    }, 'Unable to set parent as {group}{type}. Object is not a group!', this);
                }
                if (group) {
                    parent = group;
                } else {
                    return parent;
                }
            };

            this.destroy(function () {
                TreeService.unregister(this.object());
                layers = undefined;
            });

        }
    ]
);
