import Node from './Node';
import NdModBase from './models/NdModBase';
import NdModAnchor from './models/NdModAnchor';
import NdModBg from './models/NdModBg';
import NdModCirc from './models/NdModCirc';
import NdNodeBox from './classes/NdNodeBox';
import NdNodeAssembler from './classes/NdNodeAssembler';
import {NdNumericArray2d} from '../@types/types';
import {alive} from "./decorators/alive";

type CircleNodeModel = NdModCirc & NdModBg & NdModAnchor & NdModBase;

export default class Circle extends Node<CircleNodeModel> {

    protected Box?: NdNodeBox = new NdNodeBox(this, this.cache, () => {
        const position = [...this.data!.position.protectedValue] as NdNumericArray2d,
            d = this.data!.radius.protectedValue * 2
        Node.applyBoxAnchor(position, d, d, this.data!)
        return [position[0], position[1], this.data!.radius.protectedValue * 2, this.data!.radius.protectedValue * 2, this.strokeFix, this.strokeFix, this.strokeFix, this.strokeFix]
    })

    private strokeFix: number = 1;
    protected test: Node<CircleNodeModel>['test'] = (cursor: NdNumericArray2d) => {
        const coords = this.matrix.traceCursorToLocalSpace([...cursor], this),
            sprite = this.Box!.value.sprite,
            radius = this.data!.radius.protectedValue
        if (coords[0] > sprite.size[0] && coords[0] < 0 && coords[1] > sprite.size[1] && coords[1] < 0) {
            if (Math.pow((coords[0] + this.strokeFix) - radius, 2) + Math.pow((coords[1] + this.strokeFix) - radius, 2) <= Math.pow(radius, 2)) {
                return this
            }
        }
        return false
    }
    protected assembler?: NdNodeAssembler = new NdNodeAssembler([
        {
            name: 'fill',
            resolver: context => {
                context.beginPath()
                context.fillStyle = this.data!.fill.protectedValue
                context.arc(this.Box!.value.sprite.size[0] / 2, this.Box!.value.sprite.size[1] / 2, this.data!.radius.protectedValue, 0, Math.PI * 2)
                context.fill()
            }
        },
        {
            name: 'bg',
            resolver: context => {
                context.beginPath()
                context.arc(this.Box!.value.sprite.size[0] / 2, this.Box!.value.sprite.size[1] / 2, this.data!.radius.protectedValue, 0, Math.PI * 2)
                context.clip()
                Node.drawBg(this.data!, context, this.assembler!)
            }
        },
        {
            name: 'stroke',
            resolver: context => {
                context.beginPath()
                context.strokeStyle = this.data!.strokeColor.protectedValue
                context.lineWidth = this.data!.strokeWidth.protectedValue
                context.setLineDash(this.data!.strokeStyle.protectedValue)
                context.arc(this.Box!.value.sprite.size[0] / 2, this.Box!.value.sprite.size[1] / 2, this.data!.radius.protectedValue, 0, Math.PI * 2)
                context.stroke()
            }
        }
    ])

    constructor(id: string) {
        super(id, {...new NdModCirc(), ...new NdModBg(), ...new NdModAnchor(), ...new NdModBase()})
        this.watch('radius', () => {
            this.assembler!.update()
            this.assembler!.resize()
            this.Box!.purge()
            this.matrixContainer.purge()
        })
        this.watch('fill', () => this.assembler!.update('fill'))
        this.watch('strokeWidth', () => {
            this.strokeFix = this.data!.strokeWidth.protectedValue;
            this.Box!.purge()
            this.assembler!.update('stroke')
            this.assembler!.resize()
            this.matrixContainer.purge()
        })
        this.watch(['strokeStyle', 'strokeColor'], () => this.assembler!.update('stroke'))
        this.watch(['bg', 'backgroundSize', 'backgroundPosition'], () => this.assembler!.update('bg'))
        this.once('destroyed', () => {
            NdModBg.destroyBackground(this.data!)
        })
    }

    @alive
    render(context: CanvasRenderingContext2D) {
        const render = this.assembler!.export(this)
        if (render) {
            Node.transformContext(this, context)
            context.drawImage(render, 0, 0)
        }

        return context
    }

    @alive
    export(): HTMLCanvasElement | undefined {
        return this.assembler!.export(this)
    }
}