$R.service(['@inject', 'Debug', function Events(inject, Debug) {

    this.emitter = function (target) {
        if (typeof target === "object") {
            if (typeof target.on === "function" && target.on.$$EMITTERPROTECTED) {
                return target.on.call({$$EMITTERPROTECTEDCONTEXT: true});
            }
            return inject('$EventEmitter').decorate(target);
        } else {
            Debug.error({type: typeof target}, 'Unable to create EventEmitter. Invalid target {type} for emitter.', this);
        }
    };
    this.event = function (type, target, methods) {
        return inject('$Event').init(type, target, methods);
    }
}]);