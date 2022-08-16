# Nodas 
Library to add Node tree functionality to HTMLCanvas elements

To use it, just create and extend your custom class with Nodas and pass HTMLCanvas element to the super constructor
```ts
class MyNodas extends Nodas {
    constructor() {
        super(document.getElementsByTagName('canvas')[0])
    }
}

const {Image,Rectangle,Circle} = new MyNodas();

const rect = new Rectangle('MyNodasRect') //create a rect
rect.styles({
    size: [100,100],
    fill: 'rgba(0,0,0,1)'
}) //make rekt look like 100x100 black rectangle

```

#### Nodas documentation is on the way...