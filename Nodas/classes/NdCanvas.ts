import NdDestroyableNode from "../Nodes/classes/NdDestroyableNode";
import {alive} from "../Nodes/decorators/alive";
import {NdDestructibleEventScheme} from "../Nodes/@types/types";

export default class NdCanvas extends NdDestroyableNode<NdDestructibleEventScheme<NdCanvas>> {
    private _element?: HTMLCanvasElement;
    private _context?: CanvasRenderingContext2D;
    private size = [0, 0]

    constructor() {
        super()
        this._element = document.createElement('canvas');
        const context = this._element.getContext('2d')!
        this._context = context!;
        this.once('destroyed', () => {
            this._element = undefined
            this._context = undefined
        })
    }

    @alive
    get element() {
        return this._element!
    }

    @alive
    get context() {
        return this._context!
    }

    @alive
    get width() {
        return this.size[0]
    }

    set width(width) {
        this.size[0] = width
        this._element!.setAttribute('width', width.toString());
    }

    @alive
    get height() {
        return this.size[1]
    }

    set height(height) {
        this._element!.setAttribute('height', height.toString())
    }
}