import Node from './Node';
import NdBox from '../classes/NdBox';
import NdNodeAssembler from './classes/NdNodeAssembler';
import NdModBase from './models/NdModBase';
import NdModFreeStroke from './models/NdModFreeStroke';
import NdNodeStylesModel from './classes/NdNodeStylesModel';
import NdModBg from './models/NdModBg';
import NdModAnchor from './models/NdModAnchor';
import NdNodeBox from './classes/NdNodeBox';
import {NdSegmentBezier} from './@types/types';
import NdNodeEmpiricalMouseChecker from './classes/NdNodeEmpiricalMouseChecker';
import {NdNumericArray2d} from '../@types/types';
import {alive} from "./decorators/alive";

type AreaStaticModel = NdModFreeStroke & NdModBg & NdModAnchor & NdModBase
export default class Area extends Node<AreaStaticModel> {
    private xShift = 0
    private yShift = 0
    private strokeFix = 1
    private interpolationFix = 0
    private interpolated = false
    private mouseTester?: NdNodeEmpiricalMouseChecker = new NdNodeEmpiricalMouseChecker()
    protected Box: NdNodeBox = new NdNodeBox(this, this.cache, () => {
        let position = [...this.data!.position.protectedValue] as NdNumericArray2d,
            minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity

        this.data!.path.protectedValue.forEach((v: NdSegmentBezier) => {
            if (v[0] < minX) {
                minX = v[0]
            }
            if (v[2] < minX) {
                minX = v[2]
            }
            if (v[1] < minY) {
                minY = v[1]
            }
            if (v[3] < minY) {
                minY = v[3]
            }
            if (v[0] > maxX) {
                maxX = v[0]
            }
            if (v[2] > maxX) {
                maxX = v[2]
            }
            if (v[1] > maxY) {
                maxY = v[1]
            }
            if (v[3] > maxY) {
                maxY = v[3]
            }
        })
        if (minX === Infinity) minX = 0;
        if (minY === Infinity) minY = 0;
        if (maxX === -Infinity) maxX = 0;
        if (maxY === -Infinity) maxX = 0;

        this.xShift = minX;
        this.yShift = minY;

        const fix = this.strokeFix + this.interpolationFix,
            width = Math.abs(maxX - minX),
            height = Math.abs(maxY - minY);

        Node.applyBoxAnchor(position, width, height, this.data!)
        return [position[0] + this.xShift, position[1] + this.yShift, width, height, fix, fix, fix, fix] as Parameters<NdBox['value']>
    })
    protected assembler?: NdNodeAssembler = new NdNodeAssembler([
        {
            name: 'fill',
            resolver: (context: CanvasRenderingContext2D) => {
                context.save();
                context.translate(this.Box.value.sprite.margin[3] - this.xShift, this.Box.value.sprite.margin[0] - this.yShift)
                if (!this.interpolated && this.data!.interpolation.protectedValue > 0) {
                    NdNodeStylesModel.interpolate(this.data!.path.protectedValue, this.data!.interpolation.protectedValue, true)
                    this.interpolated = true
                }
                Node.drawFill(this.data!, context)
                context.restore()
            }
        },
        {
            name: 'bg',
            resolver: (context: CanvasRenderingContext2D) => {
                context.translate(this.Box.value.sprite.margin[3] - this.xShift, this.Box.value.sprite.margin[0] - this.yShift)
                Node.drawPathBg(this.data!, context, this.assembler!)
            }
        },
        {
            name: 'stroke',
            resolver: (context: CanvasRenderingContext2D) => {
                if (!this.interpolated) {
                    NdNodeStylesModel.interpolate(this.data!.path.protectedValue, this.data!.interpolation.protectedValue, true)
                    this.interpolated = true
                }
                context.translate(this.Box.value.sprite.margin[3] - this.xShift, this.Box.value.sprite.margin[0] - this.yShift);
                Node.drawStroke(this.data!, context)
            }
        }
    ])

    @alive
    protected test(cursor: NdNumericArray2d):Area | false {
        return this.mouseTester!.check(this.matrix.traceCursorToLocalSpace([...cursor], this)) ? this : false
    }

    constructor(id: string) {
        super(id, {...new NdModBase(), ...new NdModFreeStroke(true), ...new NdModAnchor(), ...new NdModBg})
        this.once('destroyed', () => {
            this.mouseTester = this.mouseTester!.destroy()
        })
        this.watch('path', () => {
            this.interpolated = false
            this.Box.purge()
            this.matrixContainer.purge()
            this.assembler!.resize()
            this.assembler!.update()
            this.interpolated = false
            this.mouseTester!.resize(this.Box.value.sprite.size)
            this.mouseTester!.redraw(this.data!)
        })
        this.watch('interpolation', () => {
            this.interpolated = false;
            this.interpolationFix = Math.round(40 * this.data!.interpolation.protectedValue);
            this.assembler!.update()
            this.assembler!.resize()
            this.mouseTester!.resize(this.Box.value.sprite.size)
            this.mouseTester!.redraw(this.data!)
            this.interpolated = false

        })
        this.watch(['strokeStyle', 'strokeColor'], () => {
            if (this.assembler) {
                this.assembler.update('stroke')
                this.assembler.resize()
            }

        })
        this.watch('fill', () => {
            this.assembler!.update('fill')

        })
        this.watch(['bg', 'backgroundSize', 'backgroundPosition'], () => {
            this.assembler!.update('bg')
        })
        this.watch('strokeWidth', () => {
            this.strokeFix = this.data!.strokeWidth.protectedValue
                .reduce((prev: number, current: number) => prev < current ? current : prev, 0) / 2
            this.assembler!.update('stroke')
            this.mouseTester!.resize(this.Box.value.sprite.size)
            this.mouseTester!.redraw(this.data!)
            this.Box.purge()
            this.matrixContainer.purge()
            this.assembler!.resize()
        })
    }

    @alive
    export() {
        return this.assembler!.export(this)
    }

    @alive
    protected render(context: CanvasRenderingContext2D) {
        const render = this.assembler!.export(this)
        if (render) {
            Node.transformContext(this, context)
            context.drawImage(render, 0, 0)
        }
        return context
    }
}
