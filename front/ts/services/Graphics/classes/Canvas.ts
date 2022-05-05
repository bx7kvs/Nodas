export default class Canvas {
    public readonly element = document.createElement('canvas')
    public readonly context = this.element.getContext('2d');
    private size = [0,0]
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