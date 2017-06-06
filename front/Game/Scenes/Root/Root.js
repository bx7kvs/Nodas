/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.app(['@app', '@extend', 'Resource', 'Objects', 'Container', function Root(app, extend, Resource, Objects, Container) {
    extend(this, '.GameScene');
    var text = Objects.text().style({
        str : 'some awesome string',
        font : 'Roboto',
        weight : 100,
        fontSize : 20,
        lineHeight: 25,
        color : 'rgba(255,255,255,1)'
    });
    var image = Objects.sprite().style({
        src : './images/ship_sprite.png[92]',
        position: [100,100]
    });

    Container.show();
    app.$('start');
    $R.application('Loader').load(['Root']);
}]);