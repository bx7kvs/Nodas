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
import NdMouseConnector from '../classes/NdMouseConnector';
import NdModBg from './models/NdModBg';
import NdModFreeStroke from './models/NdModFreeStroke';
import NdModBase from './models/NdModBase';
import NdNodeAssembler from './classes/NdNodeAssembler';
import NdImage from '../classes/NdImage';
import Nodas from '../../Nodas';
import NdModAnchor from './models/NdModAnchor';
import NdAnimatedNode from "./classes/NdAnimatedNode";
import {alive} from "./decorators/alive";
import {NDB} from "../Services/NodasDebug";
import NdStateEvent from "../classes/NdStateEvent";
import Group from "./Group";
import SharedConnectorService from "../Services/SharedConnectorService";

type NodeScheme<Model extends NdModBase> = { [key: string]: any } & NdNodeEventScheme<Node<Model, NodeScheme<Model>>>

export default abstract class Node<Model extends NdModBase, Scheme extends NodeScheme<Model> = NodeScheme<Model>> extends NdAnimatedNode<Model, NodeScheme<Model>> {


    protected abstract render(...args: Parameters<NdMainDrawingPipeF>): ReturnType<NdMainDrawingPipeF>

    protected abstract test(...args: Parameters<NdNodePointerPredicate>): ReturnType<NdNodePointerPredicate>

    abstract export(...args: any[]): NdExportableReturn | undefined | void


    protected app: Nodas | null = null

    @alive
    get mounted() {
        return !!this.app
    }

    @alive
    detach(soft: boolean = false) {
        if (this.mounted) {
            this.treeConnector.forEachChild(v => v.detach(true))
            this.app!.nodes.unregister(this)
            this.app!.mouse.unregister(this)
            this.cast('unmount', new NdStateEvent(this, this.app!))
            this.app = null
        } else NDB.warn(`Node ${this.id} is not attached. Ignoring detach`)
        if (!soft) this.treeConnector.parent = null
        return this
    }


    @alive
    attach(app: Nodas) {
        if(app !== this.app) {
            if (this.mounted) this.detach()
            this.app = app
            app.nodes.register(this, this.treeConnector)
            app.mouse.register(this, this.mouseConnector)
            this.cast('mount', new NdStateEvent(this, this.app!))
            this.treeConnector.forEachChild(v => v.attach(app))
            NDB.positive(`Node ${this.id} has been attached to a new app`)
            return this
        } else NDB.positive(`Node ${this.id} has already been attached to requested app. Ignored`)
    }

    @alive
    renderTo(context: CanvasRenderingContext2D, time: Date) {
        context.save()
        this.render(context, time, 0)
        context.restore()
        return this
    }

    @alive
    destroy() {
        this.treeConnector.forEachChild(v => v.destroy())
        if(this.parent) this.parent.remove(this)
        if (this.assembler) this.assembler = this.assembler.destroy()
        this.detach()
        this.treeConnector.reset()
        this.mouseConnector.destroy()
        return super.destroy();
    }

    get z() {
        return this.treeConnector.z
    }

    set z(v) {
        if (this.treeConnector.parent) {
            const parentConnector = SharedConnectorService.connector(this.treeConnector.parent)
            if (parentConnector) {
                parentConnector.zChild(this, v)
            } else NDB.warn(`Warning! Node ${this.id} is a child of an unregistered node ${this.treeConnector.parent.id}`)
        }
        this.treeConnector.z = v
    }

    get id() {
        return this.treeConnector.id
    }

    set id(v) {
        if (this.mounted) this.app!.nodes.rename(this.id, v)
        this.treeConnector.id = v
    }

    private readonly treeConnector: NdNodeConnector
    protected mouseConnector: NdMouseConnector


    public pipe: NdCompiler<Model>['pipe']
    public unpipe: NdCompiler<Model>['unpipe']
    public condition: NdCompiler<Model>['filter']
    protected cache = new NdCache()
    protected compiler: NdCompiler<Model>
    protected matrixContainer: NdNodeMatrixContainer
    protected assembler?: NdNodeAssembler

    protected constructor(id: string, model: Model) {
        super(model)
        this.data = model
        this.matrixContainer = new NdNodeMatrixContainer(this, model, this.cache)
        this.compiler = new NdCompiler<Model>(this, model, (...args) => this.render(...args))
        this.treeConnector = new NdNodeConnector(id, this.compiler.render)
        this.mouseConnector = new NdMouseConnector<Model>(this.cast.bind(this), (point) => this.test(point))
        this.pipe = this.compiler.pipe.bind(this.compiler)
        this.unpipe = this.compiler.unpipe.bind(this.compiler)
        this.condition = this.compiler.filter.bind(this.compiler)
        this.order = <(keyof Model)[]>Object.keys(model).sort((a, b) => model[a].ordering - model[b].ordering)
        SharedConnectorService.register(this, this.treeConnector)
        this.on(['unmount', 'mount'], () => {
            this.matrixContainer.purge()
        })
        this.once('destroy', () => SharedConnectorService.unregister(this))
        this.watch(['position', 'rotate', 'origin', 'skew', 'translate', 'scale'], () => {
            this.matrixContainer.purge()
            this.treeConnector!.forEachChild(e => e.matrix.purgeInversion(e))
        })
        this.watch(['position', 'origin', 'translate'], () => this.purgeBox())
    }

    appendTo(node: Group) {
        node.append(this)
        return this
    }
    prependTo(node:Group) {
        node.prepend(this)
        return this
    }

    @alive
    get parent() {
        return this.treeConnector!.parent
    }

    @alive
    get matrix() {
        return this.matrixContainer.value
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