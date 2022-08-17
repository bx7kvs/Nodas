# Nodas

Library to add Node tree functionality to HTMLCanvas elements. It is 100% standalone with no external dependencies

## Installing

To install package type in you console:

```shell
    npm i nodas --save
```

## Quick start

1. Create a canvas element somewhere at your page

```html

<html lang="en">
<head>
    <title>My first nodas app</title>
</head>
<body>
<canvas id="'#screen'"></canvas> <!-- here it is --->
</body>
</html>

```

2. Create ts or js file with following contents

```ts
//example.js
import Nodas from 'nodas'

const myApp = new Nodas('#screen') // Creating Nodas application. You can use query selector or just a canvas instance in your document to point where Nodas should draw
const {Text, Rectangle} = myApp; // Nodas app provides classes that you can use to draw on you canvas
new Text('test-text', 'Hello world') // Lets draw a text saying "Hellow world" at top left orner
new Rectangle('test-rect', [100, 100]) // And 100x100 rectagle
myApp.Ticker.start() // Tell nodas app that it shoul start rendering
//Whoala!

```

3. Compile your ts or js code however you do it and add compiled script to your page
4. ...
5. Done!

## Advanced usage

Nodas provide quite an API. You can create groups which are similar to SVG "g" element, Lines, Areas, Sprites and
etc. <br/>
You can add mouse handlers to your elements. Style them as you like and even animate some of their style properties

```ts
//example.js
import {Nodas, Fonts} from 'nodas'

// configuring font dispatcher, where it shoul look for fonts it is global for all Nodas apps
Fonts.root = 'public/fonts/'

// adding new font to nodas it will upload font files and track them loading
Fonts.add({
    name: 'Roboto',
    style: ['normal', 'italic'],
    weight: ['light', 'normal', 'bold', 'black']
})

// Extending default Nodas app class
class TestApp extends Nodas {
    constructor() {
        super('#screen'); // selector of my canvas element
        this.Canvas.clear = true // tell app that it shoul clear canvas before each frame
        this.Canvas.size('100%', '100%') // set canvas size as 100% width and 100% height of it's parent elemnt
        this.Ticker.start() // start application ticker
    }
}

const app = new TestApp() // creating app instance
const {Text, Rectangle, Sprite, Group} = app //dissasembling items into graphical elements constructors

const text = new Text('example-text', 'Hello World String') //creating text element saying 'hello world'
    .style({ //styling the text element
        color: 'rgba(200,0,0,1)', //set text color
        font: 'Roboto', // set text font. Previously added Roboto font used
        position: [0, 50], // set text position on canvas
        anchor: ['left', 'middle'] // set text anchor point (point on element box position should be aiming to)
    })
const rect = new Rectangle('example-rect', [100, 100]).style({ //creating rectangle
    radius: 5, //setting border radius. similar to css border-radius
    strokeColor: 'rgba(200,0,0,1)', //setting stroke color
    position: [100, 0]
})
//creating sprite element. Note the url contains [4] at the end. It means that this asset is animated sprite
//having four frames. Nodas will split image into 4 peaces half original image width and height and will show 
//them cosiquently 12 frames per second (default sprite fps)
const sprite = new Sprite('test-sprite', 'public/img/test.png[4]').style({
    position: [100, 100]
})

//this sprite is not animated (no [number] at the end of url). so it will be considered being a static image
const sprite2 = new Sprite('test-sprite-2', 'public/img/test.png').style({
    position: [200, 100]
})
//creating group and adding all previusly created grpahics to it
const group = new Group('test-group', [text, rect, sprite, sprite2])

//variable needed later :)
let trigger = true

//Binding to group mousedown event. you can bind тгьукщгы events like mouseMove, mouseEnter, mouseLeave, mouseDown, mouseUp etc.
// Nodas event bubble through event tree like they do in regular DOM, so clicking for example sprite element ehic is inside
// group element will cause mousedown event on group too
group.on('mouseDown', () => {
    trigger = !trigger //toggle the trigger
    rect.style('strokeColor', trigger ? 'rgba(239,71,111,1)' : 'rgba(6,214,160,1)') //chenging rect stroke color

    //animating group position
    group.animate(
        //props to animate. Not all the properties are animated. But most of the numeric ones are. For example position
        {
            position: trigger ? [0, 0] : [100, 200]
        },
        //animation duration in ms
        1000);

})
```

## Nodas documentation is on the way...

Sorry I had no time yet to create a complete documentation. It is a significant amount of work. Be patient