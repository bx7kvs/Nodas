$R.service(['@inject', 'Debug', function States(inject, Debug) {

    this.container = function (target, emitter) {
        if (typeof target === "object") {
            if (typeof target.is === "function" && target.is.$$STATESPROTECTED === true) {
                var currentContainer = target.is.call({$STATESPROTECTEDCONTEXT: true});
                target.is.call({$STATESPROTECTEDHASEMITTERSET: true}, emitter);
                return currentContainer;
            }
            return inject('$State').decorate(target, emitter);
        } else Debug.error('States target is not an object', this);
    }

}]);