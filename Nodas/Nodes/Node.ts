import {
    NdExportableReturn,
    NdNodeEventScheme,
    NdNodePointerPredicate,
    NdPathBezier,
    NdSegmentBezier
} from './@types/types';
import {NdMainDrawingPipeF} from '../@types/types';
import {NdNodeMatrixContainer} from './classes/NdNodeMatrixContainer';
import NdCache from '../classes/NdCache';
import NdNodeBox from './classes/NdNodeBox';
import NdNodeConnector from './classes/NdNodeConnector';
import NdCompiler from '../classes/NdCompiler';
import NdNodeMouseDispatcher from '../Mouse/NdNodeMouseDispatcher';
import NdModBg from './models/NdModBg';
import NdModFreeStroke from './models/NdModFreeStroke';
import NdModBase from './models/NdModBase';
import NdNodeAssembler from './classes/NdNodeAssembler';
import NdImage from '../classes/NdImage';
import Nodas from '../../Nodas';
import NdModAnchor from './models/NdModAnchor';
import NdAnimatedNode from "./classes/NdAnimatedNode";
import {alive} from "./decorators/alive";

type NodeScheme<Model extends NdModBase> = { [key: string]: any } & NdNodeEventScheme<Node<Model, NodeScheme<Model>>>

export default abstract class Node<Model extends NdModBase, Scheme extends NodeScheme<Model> = NodeScheme<Model>> extends NdAnimatedNode<Model, NodeScheme<Model>> {


    protected abstract render(...args: Parameters<NdMainDrawingPipeF>): ReturnType<NdMainDrawingPipeF>

    protected abstract test(...args: Parameters<NdNodePointerPredicate>): ReturnType<NdNodePointerPredicate>

    abstract export(...args: any[]): NdExportableReturn | undefined | void

    protected TreeConnector?: NdNodeConnector
    protected Cache = new NdCache()
    protected Compiler: NdCompiler<Model>
    protected Matrix: NdNodeMatrixContainer
    protected Mouse: NdNodeMouseDispatcher<Model>
    protected Assembler?: NdNodeAssembler

    public pipe: NdCompiler<Model>['pipe']
    public unpipe: NdCompiler<Model>['unpipe']
    public condition: NdCompiler<Model>['filter']


    protected constructor(id: string, model: Model, app: Nodas) {
        super(app, model)
        this.data = model
        this.Matrix = new NdNodeMatrixContainer(this, model, this.Cache)
        this.Compiler = new NdCompiler<Model>(this, model, (...args) => this.render(...args))
        this.TreeConnector = app.Tree.register(id, this, this.Compiler.render)
        this.Mouse = app.Mouse.register(this, (...args) => this.cast(...args), (...args) => this.test(...args))

        this.pipe = this.Compiler.pipe.bind(this.Compiler)
        this.unpipe = this.Compiler.unpipe.bind(this.Compiler)
        this.condition = this.Compiler.filter.bind(this.Compiler)
        this.order = <(keyof Model)[]>Object.keys(model).sort((a, b) => model[a].ordering - model[b].ordering)
        this.watch(['position', 'rotate', 'origin', 'skew', 'translate', 'scale'], () => {
            this.Matrix.purge()
            this.TreeConnector!.forEachLayer(e => e.matrix.purgeInversion(e))
        })
        this.watch(['position', 'origin', 'translate'], () => this.purgeBox())
        this.once('destroyed', () => {
            if(this.Assembler) this.Assembler = this.Assembler.destroy()
            this.TreeConnector = this.TreeConnector!.destroy()
        })
    }



    @alive
    get id() {
        return this.TreeConnector!.id
    }

    set id(id) {
        this.TreeConnector!.tree.rename(this.id, id)
    }

    @alive
    get z() {
        return this.TreeConnector!.z
    }

    set z(value) {
        this.TreeConnector!.tree.z(this, value)
    }

    @alive
    get parent() {
        return this.TreeConnector!.parent
    }

    @alive
    get matrix() {
        return this.Matrix.value
    }

    @alive
    get width() {
        if (this.Box) {
            return this.Box.value.container.size[0]
        }
        return 0

    }

    @alive
    get height() {
        if (this.Box) {
            return this.Box.value.container.size[1]
        }
        return 0

    }

    @alive
    get left() {
        if (this.Box) {
            return this.Box.value.container.position[0]
        }
        return 0
    }

    @alive
    get top() {
        if (this.Box) {
            return this.Box.value.container.position[1]
        }
    }


    @alive
    purgeBox(): Node<Model> {
        if (this.Box instanceof NdNodeBox) {
            this.Box.purge()
        }
        return this
    }


    static transformContext(node: Node<any>, context: CanvasRenderingContext2D) {
        context.transform.apply(context, node.matrix.extract());
    }

    static drawLinearPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdNodeAssembler) {
        if (styles.path.protectedValue.length > 1 && styles.bg.protectedValue.length) {
            context.save()
            Node.clipBezierPath(styles.path.protectedValue, context)
            Node.drawBg(styles, context, assembler)
        }
    }

    static drawBg<T extends NdModBg & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdNodeAssembler) {
        if (styles.bg.protectedValue.length) {
            styles.bg.protectedValue.forEach((v: NdImage, key: number) => {
                if (!v.loaded) {
                    v.once('load', () => {
                        assembler.update('bg')
                    })
                } else {
                    const image = v.export()
                    if (image) {
                        context.save()
                        const bgWidth = styles.backgroundSizeNumeric.protectedValue[key][0],
                            bgHeight = styles.backgroundSizeNumeric.protectedValue[key][1],
                            bgPositionX = styles.backgroundPositionNumeric.protectedValue[key][0],
                            bgPositionY = styles.backgroundPositionNumeric.protectedValue[key][1];
                        context.translate(bgPositionX, bgPositionY);
                        context.drawImage(image, 0, 0, bgWidth, bgHeight)
                        context.restore()
                    }

                }
            })
        }
    }

    static drawPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdNodeAssembler
    ) {
        styles.interpolation ?
            Node.drawBezierPathBg(styles, context, assembler) :
            Node.drawLinearPathBg(styles, context, assembler)
    }

    static drawBezierPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdNodeAssembler
    ) {
        context.save()
        Node.clipBezierPath(styles.path.protectedValue, context, true)
        Node.drawBg(styles, context, assembler)
        context.restore()
    }

    static clipBezierPath(
        path: NdPathBezier,
        context: CanvasRenderingContext2D,
        smooth = false,
        closed = true
    ) {
        if (path.length > 1) {
            Node.registerPath(path, context, smooth, closed)
            context.clip()
        }
    }

    static registerPath(
        path: NdPathBezier,
        context: CanvasRenderingContext2D,
        smooth = false,
        closed = true
    ) {
        if (path.length > 1) {
            context.beginPath()
            context.moveTo(path[0][0], path[0][1])
            if (smooth) {
                path.forEach(
                    (segment: NdSegmentBezier) => {
                        if (segment[0] === segment[4] && segment[1] === segment[5] && segment[2] === segment[6] && segment[3] === segment[7]) {
                            context.lineTo(segment[2], segment[3])
                        } else {
                            context.bezierCurveTo(segment[4], segment[5], segment[6], segment[7], segment[2], segment[3])
                        }
                    }
                )
            } else {
                path.forEach((segment: NdSegmentBezier) => {
                    context.lineTo(segment[2], segment[3])
                })
            }

            if (closed) context.closePath()
        }
    }

    static drawFill<T extends NdModBase & NdModBg & NdModFreeStroke>(
        styles: T,
        context: CanvasRenderingContext2D) {
        context.save()
        context.lineCap = styles.cap.protectedValue
        Node.registerPath(styles.path.protectedValue, context, !!styles.interpolation, true)
        context.fillStyle = styles.fill.protectedValue
        context.fill()
        context.restore()
    }

    static drawStroke<T extends NdModBase & NdModFreeStroke>(
        styles: T,
        context: CanvasRenderingContext2D) {
        styles.path.protectedValue.forEach(
            (segment: NdSegmentBezier, key: number) => {
                const [x1, y1, x2, y2, cx1, cy1, cx2, cy2] = segment
                if (styles.strokeWidth.protectedValue[key] < .1) context.moveTo(x2, y2)
                else {
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.strokeStyle = styles.strokeColor.protectedValue[key]
                    context.lineWidth = styles.strokeWidth.protectedValue[key]
                    context.setLineDash(styles.strokeStyle.protectedValue[key])
                    if (styles.interpolation.protectedValue) {
                        context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2)
                    } else {
                        context.lineTo(x2, y2)
                    }
                    context.stroke()
                }

            }
        )
    }

    static applyBoxAnchor(position: [x: number, y: number], width: number, height: number, data: NdModAnchor) {
        if (data.anchor.protectedValue[0] === 'center') {
            position[0] -= width / 2
        }
        if (data.anchor.protectedValue[0] === 'right') {
            position[0] -= width
        }
        if (data.anchor.protectedValue[1] === 'middle') {
            position[1] -= height / 2
        }
        if (data.anchor.protectedValue[1] == 'bottom') {
            position[1] -= height
        }
    }

}