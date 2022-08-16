import Node from './Node';
import NdModBase from './models/NdModBase';
import NdModAnchor from './models/NdModAnchor';
import NdModBg from './models/NdModBg';
import NdModCirc from './models/NdModCirc';
import NdNodeBox from './classes/NdNodeBox';
import NdModeAssembler from './classes/NdModeAssembler';
import {NdNumericArray2d} from '../@types/types';
import Nodas from '../../Nodas';

type CircleElementModel = NdModCirc & NdModBg & NdModAnchor & NdModBase;

export default class Circle extends Node<CircleElementModel> {

    protected Box: NdNodeBox = new NdNodeBox(this, this.Cache, () => {
        const position = [...this.data.position.protectedValue] as NdNumericArray2d,
            d = this.data.radius.protectedValue * 2
        Node.applyBoxAnchor(position, d, d, this.data)
        return [position[0], position[1], this.data.radius.protectedValue * 2, this.data.radius.protectedValue * 2, this.strokeFix, this.strokeFix, this.strokeFix, this.strokeFix]
    })
    render = (context: CanvasRenderingContext2D) => {
        Node.transformContext(this, context)
        context.drawImage(this.Assembler.export(this), 0, 0)
        return context
    }
    export: Node<CircleElementModel>['export'] = () => this.Assembler.export(this)
    private strokeFix: number = 1;
    protected test: Node<CircleElementModel>['test'] = (cursor: NdNumericArray2d) => {
        const coords = this.matrix.traceCursorToLocalSpace(cursor),
            sprite = this.Box.value.sprite,
            radius = this.data.radius.protectedValue
        if (coords[0] > sprite.size[0] && coords[0] < 0 && coords[1] > sprite.size[1] && coords[1] < 0) {
            if (Math.pow((coords[0] + this.strokeFix) - radius, 2) + Math.pow((coords[1] + this.strokeFix) - radius, 2) <= Math.pow(radius, 2)) {
                return this
            }
        }
        return false
    }
    protected Assembler: NdModeAssembler = new NdModeAssembler([
        {
            name: 'fill',
            resolver: context => {
                context.beginPath()
                context.fillStyle = this.data.fill.protectedValue
                context.arc(this.boundingRect.size[0] / 2, this.boundingRect.size[1] / 2, this.data.radius.protectedValue, 0, Math.PI * 2)
                context.fill()
            }
        },
        {
            name: 'bg',
            resolver: context => {
                context.beginPath()
                context.arc(this.boundingRect.size[0] / 2, this.boundingRect.size[1] / 2, this.data.radius.protectedValue, 0, Math.PI * 2)
                context.clip()
                Node.drawBg(this.data, context, this.Assembler)
            }
        },
        {
            name: 'stroke',
            resolver: context => {
                context.beginPath()
                context.strokeStyle = this.data.strokeColor.protectedValue
                context.lineWidth = this.data.strokeWidth.protectedValue
                context.setLineDash(this.data.strokeStyle.protectedValue)
                context.arc(this.boundingRect.size[0] / 2, this.boundingRect.size[1] / 2, this.data.radius.protectedValue, 0, Math.PI * 2)
                context.stroke()
            }
        }
    ])


    constructor(id: string, App: Nodas) {
        super(id, {...new NdModCirc(), ...new NdModBg(), ...new NdModAnchor(), ...new NdModBase()}, App)
        this.watch('radius', () => {
            this.Assembler.update()
            this.Assembler.resize()
            this.Box.purge()
            this.Matrix.purge()
        })
        this.watch('fill', () => {
            this.Assembler.update('fill')
        })
        this.watch('strokeWidth', () => {
            this.strokeFix = this.data.strokeWidth.protectedValue;
            this.Box.purge()
            this.Assembler.update('stroke')
            this.Assembler.resize()
            this.Matrix.purge()
        })
        this.watch(['strokeStyle', 'strokeColor'], () => {
            this.Assembler.update('stroke')
        })
        this.watch(['bg', 'backgroundSize', 'backgroundPosition'], () => {
            this.Assembler.update('bg')
        })
    }
}