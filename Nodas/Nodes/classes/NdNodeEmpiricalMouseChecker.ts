import Node from '../Node';
import NdModFreeStroke from '../models/NdModFreeStroke';
import NdModBase from '../models/NdModBase';
import NdModBg from '../models/NdModBg';
import {NdNumericArray2d} from '../../@types/types';
import NdDestroyableNode from "./NdDestroyableNode";
import NdStateEvent from "../../classes/NdStateEvent";
import {alive} from "../decorators/alive";

export default class NdNodeEmpiricalMouseChecker extends NdDestroyableNode<{ destroy: NdStateEvent<NdNodeEmpiricalMouseChecker>, destroyed:NdStateEvent<NdNodeEmpiricalMouseChecker> }>{
    private context?: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D

    constructor() {
        super();
        this.once('destroyed', () => {
            this.context = undefined
        })
    }

    @alive
    resize(size: NdNumericArray2d) {
        if (size[0] !== this.context!.canvas.width && size[0] > 0) {
            this.context!.canvas.width = size[0]
        }
        if (size[1] !== this.context!.canvas.height && size[1] > 0) {
            this.context!.canvas.height = size[1]
        }
    }

    @alive
    redraw(styles: (NdModFreeStroke & NdModBase) | (NdModFreeStroke &NdModBg )) {
        this.context!.clearRect(0, 0, this.context!.canvas.width, this.context!.canvas.height)
        this.context!.save()
        Node.registerPath(styles.path.protectedValue, this.context!, !!styles.interpolation, !!styles.fill)
        if (!!styles.fill) {
            this.context!.fillStyle = 'rgba(0,0,0,1)'
            this.context!.fill()
        } else {
            this.context!.strokeStyle = 'rgba(0,0,0,1)'
            this.context!.stroke()
        }
        this.context!.restore()
    }
    @alive
    check(pointer: NdNumericArray2d) {
        if (pointer[0] > 0 && pointer[0] < this.context!.canvas.width && pointer[1] > 0 && pointer[1] < this.context!.canvas.height) {
            const pixel = this.context!.getImageData(pointer[0], pointer[1], 1, 1)
            if (pixel) return !!pixel.data[3]
        }
        return false
    }

}