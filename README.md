# Nodas

[![github](https://img.shields.io/badge/github-follow-green)](https://github.com/bx7kvs/Nodas)<br/>
Library to add Node tree functionality to HTMLCanvas elements.<br/>
It is 100% standalone with no external dependencies

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

// Creating Nodas application. 
// You can use query selector or just a canvas instance in your document to point where Nodas should draw
const myApp = new Nodas('#screen')

// Nodas app provides classes which you can use to draw on you canvas
const {Text, Rectangle} = myApp;

// Drawing text saying "Hellow world" at top left orner of the canvas
new Text('test-text', 'Hello world')

//Drawing a 100x100 rectangle
new Rectangle('test-rect', [100, 100])

// Start Nodas rendering
myApp.Ticker.start()
//Whoala!

```

3. Compile your ts or js code however you do it and add compiled script to your page
4. ...
5. Done!

## Advanced usage

Nodas provide quite an API. <br/>
You can create groups which are similar to SVG "g" element,<br/>
Lines, Areas, Sprites and etc. <br/>
You can add mouse handlers to your elements. <br/>
Style them as you like and even animate some of their style properties

```ts
//example.js

import {Nodas, Fonts} from 'nodas'

// Configuring font dispatcher, where it should look for fonts.
// It is always global for all Nodas apps on your page

Fonts.root = 'public/fonts/'

// Adding new font to nodas it will upload font files and track them loading. 
// It will look for files: 
// Roboto-light-normal.ttf [.svg, .otf, .woff depeding on end user browser]
// Roboto-light-italic.ttf [.svg, .otf, .woff depeding on end user browser]
// Roboto-normal-normal.ttf [.svg, .otf, .woff depeding on end user browser]
// ... 
// The pattern of the file names is [font name]-[weight]-[style].[otf,svg,ttf,woff] 
// The files path will be /public/fonts/[font name]-[weight]-[style].[otf,svg,ttf,woff] 

Fonts.add({
    name: 'Roboto',
    style: ['normal', 'italic'],
    weight: ['light', 'normal', 'bold', 'black']
})

// Feel free to extend Nodas
class TestApp extends Nodas {
    constructor() {
        // Pass screen selector to your canvas for you Nodas class
        super('#screen');
        // Tell Nodas app that it shoul clear canvas before each frame
        this.Canvas.clear = true
        // Set canvas size as 100% width and 100% height of it's parent element
        this.Canvas.size('100%', '100%')
        // Start application ticker
        this.Ticker.start()
    }
}

// Create TestApp instance
const app = new TestApp()

// Extracting Constructors Nodas provides to draw on canvas. 
// Their names are pretty self explanetory 

const {Text, Rectangle, Sprite, Group} = app

// Creating text element saying 'hello world'. 
// NOTE: Nodas supports tag syntaxis for tags 
// 1. [b][/b] - bold text (600)
// 2. [c="rgba(r,g,b,a)"][/c] - to set separate substring color
// 3. [i][/i] - making part of your string italic
// Look at the example below

const text = new Text('example-text', 'Hello World [b]String[/b]')
    //Use style API to make you app unique :)
    .style({
        //Text color
        color: 'rgba(200,0,0,1)',
        // Set font. Previously added Roboto font family used
        font: 'Roboto',
        // Set text position on canvas
        position: [0, 50],
        // Set text anchor point (point on element box position should be aiming to)
        anchor: ['left', 'middle'] 
    })

// Creating rectangle
const rect = new Rectangle('example-rect', [100, 100])
    .style({
        //Set border radius. Similar to css border-radius
    radius: 5,
        //Set stroke color
    strokeColor: 'rgba(200,0,0,1)', 
    position: [100, 0]
})
// Creating sprite element. 
// Note the url contains [4] at the end. It means that this asset is animated sprite
// having four frames. Nodas will split image into 4 peaces half original image width and height and will show 
// them cosiquently 12 frames per second (default sprite fps)
const sprite = new Sprite('test-sprite', 'public/img/test.png[4]').style({
    position: [100, 100]
})

// This sprite is not animated (no [number] at the end of url). 
// It will be considered being a static image
const sprite2 = new Sprite('test-sprite-2', 'public/img/test.png').style({
    position: [200, 100]
})
// Creating group and adding all previusly created grpahics to it
const group = new Group('test-group', [text, rect, sprite, sprite2])

// Variable needed later :)
let trigger = true

// Binding to group mousedown event.
// You can bind to planty of events like mouseMove, mouseEnter, mouseLeave, mouseDown, mouseUp etc.
// Nodas events bubble through event tree like they do in regular DOM
// Clicking for example sprite element inside group element
// will cause mousedown event on group too
group.on('mouseDown', () => {
    trigger = !trigger //toggle the trigger
    rect.style('strokeColor', trigger ? 'rgba(239,71,111,1)' : 'rgba(6,214,160,1)') //chenging rect stroke color

    //Nodas can animate some of the style properties using animate API
    //Not all the properties are animated. 
    //Most of the numeric and color ones are. For example position
    group.animate(
        //Props to animate. 
        {
            position: trigger ? [0, 0] : [100, 200]
        },
        //animation duration in ms
        1000);

})
```

## 0.9.4
### New:
1. Following models are available to import by user. Useful for creating user defined nodes:  Base,Anchor,Bg,Circle,Emitter,Field,FreeStroke,Particle,Rect,Size,Sprite.
2. EventScheme type available to import. Also needed to extend custom nodes 
### Fixed:
1. NodasRandom service methods return values fixed

## 0.9.3
### New:
1. Morphine - class for smooth numeric value change with time
2. universalTicker - function to tick any numeric, numeric array or percent value. Useful in combination with Morphine class
3. Easings - a library of standard easing functions useful when using Morphine class

## 0.9.2
### New:
1. NdEvent,NdStateEvent,NdMouseEvent, NdDestroyEvent are available to import

## 0.9.1
### New:
1. Base64 string support for sprite url
2. NdImage and NdSprite classes are now available to import and extend

### Fixed:
1. Backgrounds where not loaded under certain conditions

## 0.9.0
### Features:
1. Nodes can be detached from instance and transferred across Nodas apps
2. Group class new methods prepend(), attach(), detach(), remove() and boolean property "mount" indicating if node is currently attached to an app
3. All nodes new methods appendTo(), prependTo()
4. Nodas provides detached classes import Area, Circle, Field, Group, Line, Node, ParticleEmitter,Particle, Rectangle,Sprite, Text. Those classes can be extended and attached to any Nodas app
5. Nodas now has new methods:
   a) setRoot() to set any group as a root group for a Nodas app
   b) append() to append element to current root group and mount (attach) those nodes to app
6. Added Particle field for Field class to create particle attached to the Field from the start
7. Added ParticleEmitter field for Field class to create ParticleEmitter attached to Field from the start

### Updated:
1. Full refactor of node tree functionality

### Fixed:
1. Nodes now actually emit "mount" and "unmount" events
2. Numerous small fixes and improvements across package

## 0.8.1

### Features:

1. Nodes now can be detached from node tree
2. Nodes now can be rendered to external context

### Fixes:

1. Nodas stops rendering automatically on window blur
2. Slightly optimized Rectangle rendering

## 0.8.0

### Features:

1. Particles and Fields.<br/>
   1.1 Added Field constructor<br/>
   1.2 Added Particle constructor <br/>
   1.3 Added ParticleEmitter constructor
2. Added built-in random generator service

### Fixes:
1. Removed internal memory leak
2. Fixed node destruction functionality
3. Overall stability improvements


## Nodas documentation is on the way...

Sorry I had no time yet to create a complete documentation. It is a significant amount of work. Be patient