import Application from "../../../core/modules/Application/Application";
import ReflectElement from "../ReflectElement";
import {ReflectElementMouseEvents} from "../@types/types";
import ReflectElementBox from "../classes/ReflectElementBox";
import ReflectCache from "../classes/ReflectCache";
import ReflectElementAssembler from "../classes/ReflectElementAssembler";
import ReflectElementCompiler from "../classes/ReflectElementCompiler";

export default class Area extends ReflectElement<ReflectElementMouseEvents> {
    constructor(id: string, app: Application) {
        super(id);
        this.App = app
        this.Box = new ReflectElementBox()
        this.Model = new ReflectCache()
        this.Assembler = new ReflectElementAssembler<Area>(this)
        this.Compiler = new ReflectElementCompiler<ReflectElement<ReflectElementMouseEvents>>(this, this.Assembler.export,)
    }
}