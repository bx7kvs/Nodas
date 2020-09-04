/**
 * Created by Viktor Khodosevich on 6/7/2017.
 */


/*
    This is a sample application. Is is basically root class that constructed when Reflect is ready to work,
    and start() called for the first time.

    Every application has own independent instances of services that can be injected as seen below.
    These services proved functionality to make your sources running.

    You can create you own services for your applications using $R.service() interface and classes for them,
    using $R.service.cls interface

    You can also create your own classes using $R.cls() for global classes used in all applications
    and $R.csl.sources() interface to create class isolated for the corresponding sources

    In this example we can see three services Objects, Sound, Tree

    Those services let you do some useful things :) like:

    Object : Creates graphical on the Primitives of class Graphics, like:
            Objects.rect() - creates a rectangle
            Objects.circle() - creates a circle
            Objects.group() - creates a group
            Objects.area() - creates a closed area of free shape
            Object.line() - creates compound line of 2 or more points
            Object.sprite() - creates an animated sprite
            Object.text() - creates a text element
            Object.image() - a simple static image

        All these types of Graphics objects has their own style properties you can manipulate.
        Every group can contain graphics objects abd other groups nested infinitely and also have ability to
        visualize its content by layers
        By default your objects are created in the Root group in the layer 0 which corresponds to z-index:0 in html


    Sound : Manages sounds in you application.
        Sound.sample - creates an Audio object of type sample. It is the sound that can be played
        Sound.channel - creates a channel. It helps you in managing your sound sample. Basically channel is
        a group that may or may not contain sounds.
        By default all the newly created samples are connected to the RootChannel. As well as all other newly created

    Tree: Allows you to access root group using Tree.root() interface.

    Let's see how it works:


*/


/* Lets inject our services into our application. Their instances will be created before application starts.
 */
$R.app(['Objects', 'Sound', 'Tree', '@Ticker', '@Application', function TestApp(Objects, Sound, Tree, Ticker, ExportedApp) {

    /* Let's create a simple rectangle using Objects service */

    var rect = Objects.rect('rect0', {
            anchor: ['center', 'middle'],
            size: [100, 100],
            position: [500, 300],
            strokeWidth: 0,
            fill: 'rgba(255,0,0,1)'
        }),
        rectcount = 50,
        therect = [];

    function createRect() {
        for (var i = 0; i < rectcount; i++) {
            therect.push(Objects.rect('rect' + (i + 1), {
                anchor: ['center', 'middle'],
                size: [100, 100],
                position: [100, 100 * i],
                strokeWidth: 0,
                fill: 'rgba(0,80,120,1)'
            }));
        }

    }

    function removeRect() {
        if (therect.length) {
            for (var i = 0; i < rectcount; i++) {
                therect[i].destroy()
            }
        }
        therect = [];
    }

    rect.on('mousedown', function () {
        therect.length ? removeRect() : createRect();
    })

    ExportedApp.start = function () {
        Ticker.start();
        return this;
    }


}]);

/* We have discribed out application :)
* It is time to run it!
* We have already registered our application constructor at the very beginning using $R.sources()
* Now we just need to say Reflect, which sources it should run by calling $R.run() and passing application's
* constructor function name.
*  */

var test = $R.run('TestApp');

/* At this stage our application is build and ready to display itself!
    We just need a little bit of tweaking)

    We will call a config function and pass some useful arguments in there.
 */
test.config({
    canvas: 'test-canvas', /* the id of the canvas at the page we would like to display our sources. */
    size: ['100%', '100%'], /* size of the canvas. It can be percents (of the parent element) or pixels (just numbers)*/
    warnings: true, /* Do we want our application to show warnings while it is working. Let them be. But there will be none :0*/
    clear: true, /* Should we erase the canvas each frame?
     Useful to squeeze a bit of performance in apps where
        background is always filled with images or solid color */
    fontDir: './front/fonts' /*Specifies the folder where fonts' files are placed*/
});

/* And lets go! */
test.start();

/* To stop application rendering just call test.stop() */
