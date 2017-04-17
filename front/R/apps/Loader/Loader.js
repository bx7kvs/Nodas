/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.app(['@app', 'State', 'Objects', 'Sound', function Loader(app, State, Objetcs, Sound) {

    var sprite = Objetcs.sprite(),
        group = Objetcs.group(),
        text = Objetcs.text();

    var sample = Sound.sample('sample', '/audio/blink.mp3').delay(.5,.8).play();

    var channel = Sound.channel('default');

    channel.volume(.1);

    text.style({
        str : 'String\nstring String    string string \n some other string \n and string \n stringifier ',
        position : [100,100],
        style : 'normal',
        weight : 100,
        font : 'Arial, sans-serif',
        lineHeight: 25,
        fontSize : 14,
        align : 'center',
        anchor : ['center','middle']
    });

    group.layer(1);


    text.on('mousedown', function () {
        sample.play();
    });

    text.on('mouseenter', function () {
        this.style('color', 'rgba(255,0,0,1)');
        this.style('weight', 400);
    });
    text.on('mouseleave', function () {
        this.style('color','rgba(100,150,50,1)');
        this.style('weight', 600);
    });

    group.append(sprite);


    group.style({
        position: [10, 10],
        translate: [0, 0],
        rotate: 0,
        scale: 1
    });

    sprite.style({
        src: '/images/ship_sprite.png[92]',
        size: [50, 50],
        position: [0, 0]
    });

    var sw = false;

    sprite.on('mousedown', function (e) {
        sw = !sw;
        if (sw) {
            this.animate({position: [50, 50], rotate: 180}, 1000, 'easeInOutCubic');
        }
        else {
            this.animate({position: [0, 0], rotate: 0, opacity: 1}, 1000, 'easeInOutCubic');
        }
        e.stopPropagation();
    });

    console.log(sprite);

}]);