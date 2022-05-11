export default class Canvas {
    public readonly element:HTMLCanvasElement;
    public readonly context:CanvasRenderingContext2D;
    private size = [0,0]
    constructor() {
       this.element = document.createElement('canvas');
       const context = this.element.getContext('2d')
        if(context) {
            this.context = context;
        }
        else {
            throw new Error('Unable to establish Canvas rendering context!')
        }
    }
    get width () {
        return this.size[0]
    }
    set width(width) {
        this.size[0] = width
        this.element.setAttribute('width', width.toString());
    }
    get height() {
        return this.size[1]
    }
    set height(height) {
        this.element.setAttribute('height', height.toString())
    }
}