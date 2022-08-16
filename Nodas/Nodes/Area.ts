import Node from './Node';
import NdBox from '../classes/NdBox';
import NdModeAssembler from './classes/NdModeAssembler';
import NdModBase from './models/NdModBase';
import NdModFreeStroke from './models/NdModFreeStroke';
import NdNodeStylesModel from './classes/NdNodeStylesModel';
import NdModBg from './models/NdModBg';
import NdModAnchor from './models/NdModAnchor';
import NdNodeBox from './classes/NdNodeBox';
import {NdSegmentBezier} from './@types/types';
import Nodas from '../../Nodas';
import NdNodeEmpiricalMouseChecker from './classes/NdNodeEmpiricalMouseChecker';
import {NdNumericArray2d} from '../@types/types';

type AreaStaticModel = NdModFreeStroke & NdModBg & NdModAnchor & NdModBase
export default class Area extends Node<AreaStaticModel> {
    private xShift = 0
    private yShift = 0
    private strokeFix = 1
    private interpolationFix = 0
    private interpolated = false
    private mouseTester: NdNodeEmpiricalMouseChecker = new NdNodeEmpiricalMouseChecker()
    protected Box: NdNodeBox = new NdNodeBox(this, this.Cache, () => {
        let position = [...this.data.position.protectedValue] as NdNumericArray2d,
            minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity

        this.data.path.protectedValue.forEach((v: NdSegmentBezier) => {
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

        Node.applyBoxAnchor(position, width, height, this.data)
        return [position[0] + this.xShift, position[1] + this.yShift, width, height, fix, fix, fix, fix] as Parameters<NdBox['value']>
    })
    protected Assembler: NdModeAssembler = new NdModeAssembler([
        {
            name: 'fill',
            resolver: (context: CanvasRenderingContext2D) => {
                context.save();
                context.translate(this.boundingRect.margin[3] - this.xShift, this.boundingRect.margin[0] - this.yShift);
                if (!this.interpolated && this.data.interpolation.protectedValue > 0) {
                    NdNodeStylesModel.interpolate(this.data.path.protectedValue, this.data.interpolation.protectedValue, true)
                    this.interpolated = true
                }
                Node.drawFill(this.data, context)
                context.restore()
            }
        },
        {
            name: 'bg',
            resolver: (context: CanvasRenderingContext2D) => {
                context.translate(this.boundingRect.margin[3] - this.xShift, this.boundingRect.margin[0] - this.yShift);
                Node.drawPathBg(this.data, context, this.Assembler)
            }
        },
        {
            name: 'stroke',
            resolver: (context: CanvasRenderingContext2D) => {
                if (!this.interpolated) {
                    NdNodeStylesModel.interpolate(this.data.path.protectedValue, this.data.interpolation.protectedValue, true)
                    this.interpolated = true
                }
                context.translate(this.boundingRect.margin[3] - this.xShift, this.boundingRect.margin[0] - this.yShift);
                Node.drawStroke(this.data, context)
            }
        }
    ])
    protected test: Node<AreaStaticModel>['test'] = (cursor) => {
        return this.mouseTester.check(this.matrix.traceCursorToLocalSpace([...cursor])) ? this : false
    }
    protected render: Node<AreaStaticModel>['render'] = (context) => {
        Node.transformContext(this, context)
        context.drawImage(this.Assembler.export(this), 0, 0)
        return context
    }
    export: Node<AreaStaticModel>['export'] = () => this.Assembler.export(this)

    constructor(id: string, app: Nodas) {
        super(id, {...new NdModBase(), ...new NdModFreeStroke(true), ...new NdModAnchor(), ...new NdModBg}, app)
        this.watch('path', () => {
            this.interpolated = false
            this.Box.purge()
            this.Matrix.purge()
            this.Assembler.resize()
            this.Assembler.update()
            this.interpolated = false
            this.mouseTester.resize(this.boundingRect.size)
            this.mouseTester.redraw(this.data)
        })
        this.watch('interpolation', () => {
            this.interpolated = false;
            this.interpolationFix = Math.round(40 * this.data.interpolation.protectedValue);
            this.Assembler.update()
            this.Assembler.resize()
            this.mouseTester.resize(this.boundingRect.size)
            this.mouseTester.redraw(this.data)
            this.interpolated = false
        })
        this.watch(['strokeStyle', 'strokeColor'], () => {
            this.Assembler.update('stroke')
            this.Assembler.resize()
        })
        this.watch('fill', () => {
            this.Assembler.update('fill')
        })
        this.watch(['bg', 'backgroundSize', 'backgroundPosition'], () => {
            this.Assembler.update('bg')
        })
        this.watch('strokeWidth', () => {
            this.strokeFix = this.data.strokeWidth.protectedValue
                .reduce((prev: number, current: number) => prev < current ? current : prev, 0) / 2
            this.Assembler.update('stroke')
            this.mouseTester.resize(this.boundingRect.size)
            this.mouseTester.redraw(this.data)
            this.Box.purge()
            this.Matrix.purge()
            this.Assembler.resize()
        })
    }
}
