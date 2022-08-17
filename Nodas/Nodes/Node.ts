import {NdAnimationStack, NdExportableReturn, NdNodeMouseEventsScheme, NdNodePointerPredicate, NdNodeStateEventsScheme, NdPathBezier, NdSegmentBezier, ReflectAnimateConfig} from './@types/types';
import NdAnimation from '../classes/NdAnimation';
import {ndEasings} from '../classes/NdEasings';
import {NdCanvasContext, NdMainDrawingPipeF} from '../@types/types';
import NdEmitter from '../classes/NdEmitter';
import NdNodeStylePropertyAnimated from './classes/NdNodeStylePropertyAnimated';
import {NdNodeMatrix} from './classes/NdNodeMatrix';
import NdCache from '../classes/NdCache';
import NdNodeBox from './classes/NdNodeBox';
import NdNodeConnector from './classes/NdNodeConnector';
import NdCompiler from '../classes/NdCompiler';
import NdNodeMouseDispatcher from '../Mouse/NdNodeMouseDispatcher';
import NdModBg from './models/NdModBg';
import NdModFreeStroke from './models/NdModFreeStroke';
import NdModBase from './models/NdModBase';
import NdModeAssembler from './classes/NdModeAssembler';
import NdImage from '../classes/NdImage';
import Nodas from '../../Nodas';
import EventEmitter from 'events';
import NdNodeStylesModel from './classes/NdNodeStylesModel';
import {NDB} from '../Services/NodasDebug';
import NdModAnchor from './models/NdModAnchor';

type ExtractAnimated<T extends NdNodeStylesModel, PT> = {
    [Key in keyof T]: T[Key] extends PT ? PT : never
}

export default abstract class Node<Model extends NdModBase> extends NdEmitter<NdNodeStateEventsScheme<Model> & NdNodeMouseEventsScheme<Model>> {

    protected abstract Box: NdNodeBox

    protected abstract render: NdMainDrawingPipeF
    protected abstract test: NdNodePointerPredicate
    public abstract export: (...args: any[]) => NdExportableReturn | undefined

    protected TreeConnector: NdNodeConnector
    protected Cache = new NdCache()
    protected Compiler: NdCompiler<Model>
    protected Matrix: NdNodeMatrix
    protected Mouse: NdNodeMouseDispatcher<Model>
    protected data: Model

    public pipe: NdCompiler<Model>['pipe']
    public unpipe: NdCompiler<Model>['unpipe']
    public condition: NdCompiler<Model>['filter']

    private modelEmitter = new EventEmitter()
    private order: (keyof Model)[] = [];
    private animations: NdAnimation<Model>[] = [];

    private checkQueue() {
        this.animations = this.animations.filter(
            (v) => {
                if (!v.active) {
                    if (v.queue) {
                        if (!this.findCompetitors(v).length) v.start()
                        return true
                    } else {
                        const competitors = this.findCompetitors(v)
                        if (competitors.length) {
                            competitors.forEach(
                                (competitor) => {
                                    v.props.forEach(
                                        (prop) => competitor.stop(prop)
                                    )
                                }
                            )
                        }
                        v.start()
                        return true
                    }
                } else {
                    return !v.done
                }
            }
        )
    }

    private findCompetitors(animation: NdAnimation<Model>) {
        let competitors = []
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i] !== animation) {
                if (this.animations[i].active && !this.animations[i].done) {
                    for (let c = 0; c < animation.props.length; c++) {
                        if (this.animations[i].indexOf(animation.props[c]) > -1) {
                            competitors.push(this.animations[i])
                        }
                    }
                }
            }
        }
        return competitors as NdAnimation<Model>[]
    }

    private tickElementAnimations = (canvas: NdCanvasContext, date: Date) => {
        const time = date.getTime()
        this.animations.forEach((animation) => {
            animation.morphine && animation.morphine.tick(time)
        })
    }

    protected constructor(id: string, model: Model, app: Nodas) {
        super()
        this.data = model
        this.Matrix = new NdNodeMatrix(this, model, this.Cache)
        this.Compiler = new NdCompiler<Model>(this, model, (...args) => this.render(...args))
        this.TreeConnector = app.Tree.register(id, this, this.Compiler.render)
        this.Mouse = app.Mouse.register(this, (...args) => this.cast(...args), (...args) => this.test(...args))
        this.pipe = this.Compiler.pipe.bind(this.Compiler)
        this.unpipe = this.Compiler.unpipe.bind(this.Compiler)
        this.condition = this.Compiler.filter.bind(this.Compiler)
        this.order = <(keyof Model)[]>Object.keys(model).sort((a, b) => model[a].ordering - model[b].ordering)
        app.Canvas.queue(-2, this.tickElementAnimations)
        this.once('destroy', () => {
            NDB.positive(`Destroying node ${id}...`)
            this.modelEmitter.removeAllListeners()
            this.removeAllListeners()
            app.Canvas.unQueue(this.tickElementAnimations)
        })
        this.watch(['position', 'rotate', 'origin', 'skew', 'translate', 'scale'], () => {
            this.Matrix.purge()
            this.TreeConnector.forEachLayer(e => e.matrix.purgeInversion())
        })
        this.watch(['position', 'origin', 'translate'], () => this.purgeBox())
    }


    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(
        props: { [Key in K]?: Parameters<Animated[Key]['set']>[0] },
        duration?: number,
        easing?: keyof typeof ndEasings,
        queue?: boolean): Node<Model>
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(
        props: { [Key in K]?: Parameters<Animated[Key]['set']>[0] },
        config?: ReflectAnimateConfig<Node<Model>>): Node<Model>
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated & string>(
        a: { [Key in K]?: Parameters<Animated[Key]['set']>[0] },
        b?: number | ReflectAnimateConfig<Node<Model>>,
        c?: keyof typeof ndEasings
    ) {
        const stack: NdAnimationStack<Model> = (<K[]>Object.keys(a))
            .sort(
                (a, b) => this.data[a].ordering - this.data[b].ordering).map(
                (prop) => {
                    return {
                        value: a[prop],
                        name: prop,
                        ani: this.data[prop] as NdNodeStylePropertyAnimated<any, any, any, any>
                    }
                })
        if (typeof b === 'number' || typeof b === 'undefined') {
            const animation = new NdAnimation<Model>(this, stack, b, c)
            animation.on('complete', () => this.checkQueue)
            this.animations.push(animation)
        } else if (typeof b === 'object') {
            const config = <ReflectAnimateConfig<Node<Model>>>b,
                animation = new NdAnimation<Model>(this, stack, config?.duration, config?.easing, config?.queue)
            if (config.complete) animation.on('complete', config.complete)
            if (config.step) animation.on('step', config.step)
            animation.on('complete', () => this.checkQueue)
        } else NDB.negative('Invalid animation config', this)
        this.checkQueue()
        return this
    }

    stop(prop?: keyof Extract<Model, NdNodeStylePropertyAnimated<any, any, any, any>>) {
        this.animations.forEach(v => v.stop(<string>prop))
        return this;
    }


    style(prop: keyof Model): Model[keyof Model]['publicValue']
    style<K extends keyof Model>(prop: K, value?:Parameters<Model[K]['set']>[0]): Model[keyof Model]['publicValue']
    style(props: { [Prop in keyof Model]?: Parameters<Model[Prop]['set']>[0] }): Node<Model>
    style<K extends keyof Model>(
        prop: K | { [Prop in keyof Model]: Parameters<Model[Prop]['set']>[0] },
        value?: Parameters<Model[keyof Model]['set']>[0]) {
        if (typeof prop === 'object') {
            (Object.keys(prop) as K[])
                .sort((a, b) => this.order.indexOf(a) - this.order.indexOf(b))
                .forEach((key: K) => {
                    if (prop[key] !== undefined) {
                        this.data[key].set(prop[key], this)
                        this.modelEmitter.emit(<string>key)
                    }
                })
        } else {
            if(typeof value !== undefined) {
                this.data[prop].set(value, this)
                this.modelEmitter.emit(<string>prop)
                return this
            }
            return this.data[prop].publicValue
        }
        return this
    }

    watch(prop: keyof Model | (keyof Model)[], callback: () => void) {
        if (prop instanceof Array) {
            prop.forEach(v => this.modelEmitter.on(<string>v, callback))
        } else this.modelEmitter.on(<string>prop, callback)
        return this
    }

    unwatch(prop: keyof Model | (keyof Model)[], callback: () => void) {
        if (prop instanceof Array) {
            prop.forEach(v => this.modelEmitter.off(<string>v, callback))
        } else this.modelEmitter.off(<string>prop, callback)
        return this
    }

    get id() {
        return this.TreeConnector.id
    }

    set id(id) {
        this.TreeConnector.tree.rename(this.id, id)
    }

    get z() {
        return this.TreeConnector.z
    }

    set z(value) {
        this.TreeConnector.tree.z(this, value)
    }

    get box() {
        return this.Box.value.container
    }

    get boundingRect() {
        return this.Box.value.sprite
    }

    get parent() {
        return this.TreeConnector.parent
    }

    get matrix() {
        return this.Matrix.value
    }

    get width() {
        return this.Box.value.container.size[0]
    }

    get height() {
        return this.Box.value.container.size[1]
    }

    get left() {
        return this.Box.value.container.position[0]
    }

    get top() {
        return this.Box.value.container.position[1]
    }

    get animated() {
        return !!this.animations.length
    }

    purgeBox() {
        this.Box.purge()
        return this
    }

    static transformContext(element: Node<any>, context: CanvasRenderingContext2D) {
        context.transform.apply(context, element.matrix.extract());
    }

    static drawLinearPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdModeAssembler) {
        if (styles.path.protectedValue.length > 1 && styles.bg.protectedValue.length) {
            context.save()
            Node.clipBezierPath(styles.path.protectedValue, context)
            Node.drawBg(styles, context, assembler)
        }
    }

    static drawBg<T extends NdModBg & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdModeAssembler) {
        if (styles.bg.protectedValue.length) {
            styles.bg.protectedValue.forEach((v: NdImage, key: number) => {
                if (!v.loaded) {
                    v.once('load', () => {
                        assembler.update('bg')
                    })
                } else {
                    const image = v.export()
                    if(image) {
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
        assembler: NdModeAssembler
    ) {
        styles.interpolation ?
            Node.drawBezierPathBg(styles, context, assembler) :
            Node.drawLinearPathBg(styles, context, assembler)
    }

    static drawBezierPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(
        styles: T,
        context: CanvasRenderingContext2D,
        assembler: NdModeAssembler
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

    static applyBoxAnchor(position:[x:number,y:number], width:number, height:number,data:NdModAnchor) {
        if (data.anchor.protectedValue[0] === 'center') {
            position[0] -= width / 2
        }
        if (data.anchor.protectedValue[0] === 'right') {
            position[0] -= width
        }
        if (data.anchor.protectedValue[1] === 'middle') {
            position[1]-= height / 2
        }
        if (data.anchor.protectedValue[1] == 'bottom') {
            position[1] -= height
        }
    }

}