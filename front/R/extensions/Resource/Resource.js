/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.ext(['@app', '@inject', function Resource(app, inject) {

    var all = [],
        container = {
            images: [],
            sprites: [],
            fonts : [],
            audios : []
        },
        loadCounter = 0,
        self = this;

    function GetResourceByURL(type, search) {
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
        }
        else {
            var _type = type;

            var result = inject(type.charAt(0).toUpperCase() + type.slice(1));

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
        return InjectByType('image', src);
    };

    this.sprite = function (src) {
        return InjectByType('sprite', src);
    };

    this.audio = function (src) {
        return InjectByType('audio',src);
    };

    var cBContainer = {
        load: [],
        error: [],
        add: []
    };

    function ResolveEvent(type, data) {
        var array = cBContainer[type];
        if (!array) return;

        for (var i = 0; i < array.length; i++) {
            array[i].apply(self, data);
        }
    }

    app.$('tick', function (time) {
        time = time.getTime();
        for (var i = 0; i < container.sprites.length; i++) {
            if (container.sprites[i].ready() && container.sprites[i].loaded() == 1) {
                container.sprites[i].tick(time);
            }
        }
    });
}]);