import NdModeAssembler from './classes/NdModeAssembler';
import NdNodeBox from './classes/NdNodeBox';
import NdModBase from './models/NdModBase';
import NdModFreeStroke from './models/NdModFreeStroke';
import NdModAnchor from './models/NdModAnchor';
import Node from './Node';
import Nodas from '../../Nodas';
import NdNodeStylesModel from './classes/NdNodeStylesModel';
import NdNodeEmpiricalMouseChecker from './classes/NdNodeEmpiricalMouseChecker';
import {NdNumericArray2d} from '../@types/types';

type LineNodeModel = NdModFreeStroke & NdModAnchor & NdModBase

export default class Line extends Node<LineNodeModel> {
    private xShift: number = 0
    private yShift: number = 0
    private strokeFix: number = 0
    private interpolationFix: number = 0
    private interpolated: boolean = false
    private mouseTester: NdNodeEmpiricalMouseChecker = new NdNodeEmpiricalMouseChecker()

    protected Assembler: NdModeAssembler = new NdModeAssembler([
        {
            name: 'stroke',
            resolver: (context) => {
                context.translate(this.boundingRect.margin[3] - this.xShift, this.boundingRect.margin[0] - this.yShift)
                if (!this.interpolated && this.data.interpolation.protectedValue > 0) {
                    NdNodeStylesModel.interpolate(this.data.path.protectedValue, this.data.interpolation.protectedValue, false)
                }
                Line.drawStroke(this.data, context)
            }
        }
    ])
    protected Box: NdNodeBox = new NdNodeBox(this, this.Cache, () => {
        let position = [...this.data.position.protectedValue] as NdNumericArray2d,
            fix = Math.max(this.strokeFix, this.interpolationFix),
            minx = Infinity,
            miny = Infinity,
            maxx = -Infinity,
            maxy = -Infinity;

        this.data.path.protectedValue.forEach(v => {
            if (v[0] < minx) {
                minx = v[0]
            }
            if (v[2] < minx) {
                minx = v[2]
            }
            if (v[1] < miny) {
                miny = v[1]
            }
            if (v[3] < miny) {
                miny = v[3]
            }
            if (v[0] > maxx) {
                maxx = v[0]
            }
            if (v[2] > maxx) {
                maxx = v[2]
            }
            if (v[1] > maxy) {
                maxy = v[1]
            }
            if (v[3] > maxy) {
                maxy = v[3]
            }
        })
        if (minx === Infinity) minx = 0;
        if (miny === Infinity) miny = 0;
        if (maxx === -Infinity) maxx = 0;
        if (maxy === -Infinity) maxx = 0;
        this.xShift = minx;
        this.yShift = miny;
        let width = Math.abs(maxx - minx)
        let height = Math.abs(maxy - miny)
        Node.applyBoxAnchor(position,width,height,this.data)
        return [position[0] + this.xShift, position[1] + this.yShift, width, height, fix, fix, fix, fix]
    })

    export: Node<LineNodeModel>['export'] = () => this.Assembler.export(this);
    render: Node<LineNodeModel>['render'] = (context) => {
        Line.transformContext(this, context)
        context.drawImage(this.Assembler.export(this), 0, 0)
        return context
    }
    test: Node<LineNodeModel>['test'] = (cursor) => {
        return this.mouseTester.check(this.matrix.traceCursorToLocalSpace([...cursor])) ? this : false
    }

    constructor(id: string, app: Nodas) {
        super(id, {...new NdModFreeStroke(), ...new NdModAnchor(), ...new NdModBase()}, app);
        this.watch('path', () => {
            this.purgeBox()
            this.Matrix.purge()
            this.Assembler.update('stroke')
            this.Assembler.resize()
            this.mouseTester.resize(this.boundingRect.size)
            this.mouseTester.redraw(this.data)
        })
        this.watch('strokeWidth', () => {
            this.strokeFix = this.data.strokeWidth.protectedValue.reduce((acc, current) => {
                return current > acc ? current : acc
            }, 0)
            this.Assembler.update('stroke')
            this.Assembler.resize()
            this.mouseTester.resize(this.boundingRect.size)
            this.mouseTester.redraw(this.data)
        })
        this.watch('interpolation', () => {
            this.interpolationFix = Math.round(20 * this.data.interpolation.protectedValue)
            this.purgeBox()
            this.Matrix.purge()
            this.Assembler.resize()
            this.Assembler.update('stroke')
            this.mouseTester.resize(this.boundingRect.size)
            this.mouseTester.redraw(this.data)
        })
        this.watch(['strokeStyle', 'strokeColor'], () => {
            this.Assembler.update('stroke')
        })

    }


}