import NdStyledNode from "./NdStyledNode";
import NdAnimation from "../../classes/NdAnimation";
import {NdCanvasContext} from "../../@types/types";
import NdNodeStylePropertyAnimated from "./NdNodeStylePropertyAnimated";
import {ndEasings} from "../../classes/NdEasings";
import {NdAnimationStack, NdNodeBasicEventScheme, NodasAnimateConfig} from "../@types/types";
import {NDB} from "../../Services/NodasDebug";
import NdNodeStylesModel from "./NdNodeStylesModel";
import Nodas from "../../../Nodas";
import {alive} from "../decorators/alive";

type ExtractAnimated<T extends NdNodeStylesModel, PT> = {
    [Key in keyof T]: T[Key] extends PT ? PT : never
}
export default class NdAnimatedNode<Model extends NdNodeStylesModel, Scheme extends NdNodeBasicEventScheme<NdAnimatedNode<Model, Scheme>>> extends NdStyledNode<Model, Scheme> {
    protected animations?: NdAnimation<Model>[] = [];

    @alive
    private checkQueue() {
        this.animations = this.animations!.filter(
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
                                        (prop) => competitor.stop(prop as string)
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

    @alive
    private findCompetitors(animation: NdAnimation<Model>) {
        let competitors = []
        for (let i = 0; i < this.animations!.length; i++) {
            if (this.animations![i] !== animation) {
                if (this.animations![i].active && !this.animations![i].done) {
                    for (let c = 0; c < animation.props.length; c++) {
                        if (this.animations![i].indexOf(animation.props[c] as string) > -1) {
                            competitors.push(this.animations![i])
                        }
                    }
                }
            }
        }
        return competitors as NdAnimation<Model>[]
    }

    @alive
    private tickElementAnimations(date: Date) {
        if (this.animations!.length) {
            const time = date.getTime()
            this.animations!.forEach((animation) => {
                animation.morphine && animation.morphine.tick(time)
            })
        }
    }

    constructor(app: Nodas, model: Model) {
        super(model);
        const callback = (context: NdCanvasContext, date: Date) => this.tickElementAnimations(date)
        app.canvas.queue(-2, callback)
        this.once('destroyed', () => {
            app.canvas.unQueue(callback)
            this.animations = undefined
        })
    }

    @alive
    get animated() {
        return !!this.animations!.length
    }

    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(
        props: { [Key in K]?: Parameters<Animated[Key]['set']>[0] },
        duration?: number,
        easing?: keyof typeof ndEasings,
        queue?: boolean): NdAnimatedNode<Model, Scheme>
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(
        props: { [Key in K]?: Parameters<Animated[Key]['set']>[0] },
        config?: NodasAnimateConfig<NdAnimatedNode<Model, Scheme>>): NdAnimatedNode<Model, Scheme>

    @alive
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated & string>(
        a: { [Key in K]?: Parameters<Animated[Key]['set']>[0] },
        b?: number | NodasAnimateConfig<NdAnimatedNode<Model, Scheme>>,
        c?: keyof typeof ndEasings
    ) {
        const stack: NdAnimationStack<Model> = (<K[]>Object.keys(a))
            .sort(
                (a, b) => this.order.indexOf(a) - this.order.indexOf(b)).map(
                (prop) => {
                    return {
                        value: a[prop],
                        name: prop,
                        ani: this.data![prop] as unknown as NdNodeStylePropertyAnimated<any, any, any, any>
                    }
                })
        if (typeof b === 'number' || typeof b === 'undefined') {
            const animation = new NdAnimation<Model>(this, stack, b, c)
            animation.on('complete', () => this.checkQueue)
            this.animations!.push(animation)
        } else if (typeof b === 'object') {
            const config = <NodasAnimateConfig<NdAnimatedNode<Model, Scheme>>>b,
                animation = new NdAnimation<Model>(this, stack, config?.duration, config?.easing, config?.queue)
            if (config.complete) animation.on('complete', config.complete)
            if (config.step) animation.on('step', config.step)
            animation.on('complete', () => this.checkQueue)
        } else NDB.negative('Invalid animation config', this)
        this.checkQueue()
        return this
    }

    @alive
    stop(prop?: keyof Extract<Model, NdNodeStylePropertyAnimated<any, any, any, any>>) {
        this.animations!.forEach(v => v.stop(<string>prop))
        return this;
    }


}