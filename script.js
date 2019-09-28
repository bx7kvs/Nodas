/**
 * Created by Viktor Khodosevich on 6/7/2017.
 */


/*
    This is a sample application. Is is basically root class that constructed when Reflect is ready to work,
    and start() called for the first time.

    Every application has own independent instances of services that can be injected as seen below.
    These services proved functionality to make your app running.

    You can create you own services for your applications using $R.service() interface and classes for them,
    using $R.service.cls interface

    You can also create your own classes using $R.cls() for global classes used in all applications
    and $R.csl.app() interface to create class isolated for the corresponding app

    In this example we can see three services Objects, Sound, Tree

    Those services let you do some useful things :) like:

    Object : Creates graphical on the scene of class Graphics, like:
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
    Objects will be represented as $O, Sound will be represented as $S and Tree will be represeneted as $T.
 */
$R.app(['Objects', 'Sound', 'Tree', function TestApp($O, $S, $T) {

    /* Let's create a simple rectangle using service $O (Objects service) */

    var rect = $O.rect({
            anchor: ['center', 'middle'],
            size: [100, 100],
            position: [500, 300],
            strokeWidth: 0,
            fill: 'rgba(255,0,0,1)'
        }),
        /*
            As you can see we passed an object as an argument to the function .rect({})
            Very similar to jQuery, right? it is because it works the same way :)
            calling .rect() as seen above is equivalent to Object.rect().style({...your styles});

            Our object will be of size 100x100 and its position will be also x:100, y:100 from the left top corner
            of the scene.

            And it will be filled red.

            There is a lot more things you can do with the rectangle. Just console.log rect to see its full
             api



            Now lets use Sound service and create a sound sample.
            Just call Sound.sample() and it will be automatically uploaded;
             It is connected to the RootChannel, so there is no further configuration required.

             How to play sounds will be shown later below now we just initiate one
        */
        sample = $S.sample('./front/audio/blink.mp3'),

        /* Lets create some other objects on our scene and start with a sprite
        *  As you can see the passed src is rather unusual. [92] at the end of URL says that this sprite has 92 frames
        * rendered consequently. By default all sprites render with 12 fps.
        * sprite is loaded with a single file. It should be squred and splitted into equal parts horizontally and
        *  vertically, which will be your future frames. Use the minimal size of the square to fit all your frames
        * and tou are fine and tuned. As [frames] is passed number of actual frames. So just leave a bit of empty space
        * in you image file. It is ok to be not perfect sometimes.
        * */
        sprite = $O.sprite(
            {
                src: './front/img/ship_sprite.png[92]',
                position: [400, 100]
            }
        ),

        /* Than we add a text element to the screen. You can specify the fonts and font-weight and font-style if you
        like. The engine will try to load the font for you. Just look into the console to see how fonts file should be
        named*/

        text = $O.text({
            str: 'We can drag the circle and rectangle and do really\n IMPRESSIVE stuff!',
            font: 'Roboto',
            weight: 100,
            fontSize: 20,
            lineHeight: 30,
            position: [500, 100]
        }),

        /* Now, lets create a circle. Just for fun ;) But note that circle styles are not the same as rectangle's.
        * For example - radius property instead of size. Also note that we specified the anchor point of the circle.
        * anchor property defines the point where the position property will be pointing, here we have it pointing
        * to the middle of object's height and center of it's width
        * You should not be confused by other properties used :)
        * */
        circle = $O.circle({
            anchor: ['center', 'middle'],
            radius: 100,
            position: [800, 300],
            strokeWidth: 1,
            fill: 'rgba(55,24,10,1)'
        });

    /* Back to sounds. Samples, as well as Channels can be filtered.
        there is lowpass, hipass, volume and some other fancy filters to manipulate the audio sample.
        So in order to not being too loud lets drop sample volume really low :) ... but audible still :)
    * */

    sample.filter('volume', .1);

    /*  Event time!
    *   All objects have events that can be assigned to different mouse events.
    *   There are various events you may be familiar for JS for HTML elements and some more. Here is the list:
    *   mouseenter , mouseleave, mousemove, mouseenter, mouseleave, dragstart, dragmove, dragend
    *   additional drag events are useful to simplify dragging functionality.
    *   Lets add some action here!
    * */

    rect.on('mouseenter', function () {
        /* Do you recognize the animate functon from jQuery. Here it is the same way simple!
        * Just remember that las argument is always object. It makes code a little bit more obvious, but bulkier.
        * Just a matter of taste
        * You can animate any properties thet express as numbers and arrays. Also it is possible to animate colors
        * and some other useful properties of different types of graphics
        * */
        this.animate({scale: 2, rotate: -240}, {duration: 3000, queue: false});
    });
    rect.on('mouseleave', function () {
        this.animate({scale: 1, rotate: 0}, {duration: 3000, queue: false});
    });
    circle.on('mouseenter', function () {
        this.animate({fill: 'rgba(0,100,20,1)', radius: 110}, {duration: 300, queue: false});

        sprite.animate({
            position: [400, 400], // equals to [400,400]
            rotate: 120
        }, {duration: 1000, queue: false});
        /* Lets play our audio sample when we hovering our circle element :) */
        sample.play();
    });


    circle.on('mouseleave', function () {
        /* Note that animation can be eased by different types of easings available
        * Here is the list
        * linear (used by default)
        * linearSoft
        * linearSoftOut
        * linearSoftIn
        * easeInQuad
        * easeOutQuad
        * easeInOutQuad
        * easeInCubic
        * easeOutCubic
        * easeInOutCubic
        * easeInQuart
        * easeOutQuart
        * easeInOutQuart
        * easeInQuint
        * easeOutQuint
        * easeInOutQuint
        * easeInSine
        * easeOutSine
        * easeInOutSine
        * easeInExpo
        * easeOutExpo
        * easeInOutExpo
        * easeInCirc
        * easeOutCirc
        * easeInOutCirc
        * easeInBack
        * easeOutBack
        * easeInOutBack
        * easeOutBounce
        *  */
        this.animate({fill: 'rgba(50,10,220,1)', radius: 100}, {duration: 300, queue: false, easing: 'easeOutCubic'});
        sprite.animate({
            position: [400, 100],
            rotate: 120
        }, {duration: 1000, queue: false});
    });


    /* Lets make out circle and rectangle draggable. It can not be easier! */
    circle.on('dragmove', function (e) {
        this.style({
            'position': [e.drag.current[0], e.drag.current[1]]
        });
    });
    rect.on('dragmove', function (e) {
        this.style({
            'position': [e.drag.current[0], e.drag.current[1]]
        });
    });

    /* And finally we create a line to experiment with path manipulations */

    var path1 = [[0, 40], [50, 10], [100, 80], [150, 50]],
        path2 = [[0, 10], [50, 50], [100, 80], [150, 2], [200, 40]],
        line = $O.line(
            {
                path: path1 /* Path is a simple array of points[x,y]; */
            }
        );

    /* Path can be interpolated */

    line.style('interpolation', .4);
    /* value of interpolation can be a number
     from 0 (no smoothing) to .4 (maximum of smoothness)
     */

    /* You can not animate paths, because of performance issues. This feature is currently under developement
    * to better understand visually how it work let's create a couple of buttons to manipulate path behaviour
    * For buttons representation we will use text blocks
    * */

    var lineButton1 = $O.text(
        {
            str: 'Make path smooth',
            position: [0, 0],
            fontFamily: 'Roboto',
            fontWeight: 100,
            color: 'rgba(50, 100, 20, 1)'
        }
        ),
        lineButton2 = $O.text(
            {
                str: 'show path 1',
                position: [120, 0],
                fontFamily: 'Roboto',
                fontWeight: 100,
                color: 'rgba(50, 100, 20, 1)'
            }
        ),
        lineButton3 = $O.text(
            {
                str: 'show path 2',
                position: [200, 0],
                fontFamily: 'Roboto',
                fontWeight: 100,
                color: 'rgba(50, 100, 20, 1)'
            }
        ),
        lineButton4 = $O.text(
            {
                str: 'Disable smoothing',
                position: [300, 0],
                fontFamily: 'Roboto',
                fontWeight: 100,
                color: 'rgba(50, 100, 20, 1)'
            }
        );

    lineButton1.on('mousedown', function () {
        line.style({
            interpolation : .4
        });
    });
    lineButton2.on('mousedown', function () {
        line.style({
            path : path1
        });
    });
    lineButton3.on('mousedown', function () {
        line.style({
            path : path2
        },{duration: 500, queue: false});
    });
    lineButton4.on('mousedown', function () {
        line.style({
            interpolation : 0
        });
    });

    /* lets put our buttons to a group */

    var buttonsGroup = $O.group();

    buttonsGroup.append(lineButton1);
    buttonsGroup.append(lineButton2);
    buttonsGroup.append(lineButton3);
    buttonsGroup.append(lineButton4);

    /* Lets position out buttons somewhere on the scene */

    buttonsGroup.style({
        position: [20, 200]
    });

    /* Lets put our line into the button group and display it below the buttons */

    buttonsGroup.append(line);

    line.style({
        position : [0, 50]
    });


}]);

/* We have discribed out application :)
* It is time to run it!
* We have already registered our application constructor at the very beginning using $R.app()
* Now we just need to say Reflect, which app it should run by calling $R.run() and passing application's
* constructor function name.
*  */

var test = $R.run('TestApp');

/* At this stage our application is build and ready to display itself!
    We just need a little bit of tweaking)

    We will call a config function and pass some useful arguments in there.
 */
test.config({
    canvas: 'test-canvas', /* the id of the canvas at the page we would like to display our app. */
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