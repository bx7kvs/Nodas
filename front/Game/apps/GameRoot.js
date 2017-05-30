/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.app(['@app', 'State', function GameRoot(app, State) {
    var Loader = $R.application('Loader');
    console.log(Loader);
    Loader.$('start');
}]);