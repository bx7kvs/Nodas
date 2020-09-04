$R.service([
    '@inject',
    function Api(inject) {
        this.control = function (target) {
            var api = null;
            if (typeof target.can === "function" && target.can.$$APIPROTECTED) {
                api = target.can.call({$$APIPROTECTED: true});
            }
            if(!api) {
                api = inject('$ApiController');
                api.wrap(target);
            }
            return api;
        }
    }
]);