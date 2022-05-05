import Emitter from "../../core/classes/Emitter";
import Application from "../../core/modules/Application/Application";
import {ReflectElementLifecycleEvents, ReflectElementProps} from "./@types/types";
import ReflectElementBox from "./classes/ReflectElementBox";
import ReflectCache from "./classes/ReflectCache";
import ReflectElementModel from "./classes/ReflectElementModel";
import ReflectEvent from "./classes/ReflectEvent";
import ReflectElementCompiler from "./classes/ReflectElementCompiler";
export default class ReflectElement<Events extends ReflectElementLifecycleEvents> extends Emitter<Events, ReflectEvent<any, any>>{
    private identifier: string
    protected App: Application
    protected Compiler: ReflectElementCompiler<ReflectElement<Events>>
    protected Cache: ReflectCache
    protected Box: ReflectElementBox
    protected Model: ReflectElementModel
    public readonly parent: ReflectElement<ReflectElementLifecycleEvents> | null = null;

    constructor(...[app, compiler, cache, box, model, id]:ReflectElementProps) {
        super()
        this.identifier = id
        this.App = app
        this.Compiler = compiler
        this.Cache = cache
        this.Box = box
        this.Model = model
    }

    get id(): string {
        return this.identifier
    }

    set id(id) {
        this.identifier = id
    }

}