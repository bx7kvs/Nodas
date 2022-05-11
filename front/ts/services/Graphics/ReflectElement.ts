import Emitter from "../../core/classes/Emitter";
import Application from "../../core/modules/Application/Application";
import {ReflectElementLifecycleEvents, ReflectElementProps} from "./@types/types";
import ReflectElementBox from "./classes/ReflectElementBox";
import ReflectCache from "./classes/ReflectCache";
import ReflectElementModel from "./classes/ReflectElementModel";
import ReflectEvent from "./classes/ReflectEvent";
import ReflectElementCompiler from "./classes/ReflectElementCompiler";
import ReflectElementAssembler from "./classes/ReflectElementAssembler";
export default class ReflectElement<Events extends (ReflectElementLifecycleEvents | string)>
    extends Emitter<Events, ReflectEvent<any, any>>{
    private identifier: string
    declare protected App: Application
    declare protected Compiler: ReflectElementCompiler<ReflectElement<Events>>
    declare protected Cache: ReflectCache
    declare protected Box: ReflectElementBox
    declare protected Model: ReflectElementModel
    declare protected Assembler: ReflectElementAssembler<ReflectElement<any>>
    public readonly parent: ReflectElement<ReflectElementLifecycleEvents> | null = null;

    constructor(id: string) {
        super()
        this.identifier = id;
    }

    get box() {
        return this.Box.container
    }
    get spriteBox() {
        return this.Box.sprite
    }

    // this.register('box', function () {
    //     return this.extension('Cache').value('box', BoxWrapperFunc).get();
    // });
    // this.register('width', function () {
    //     return this.extension('Cache').value('box', BoxWrapperFunc).get().size[0];
    // });
    // this.register('height', function () {
    //     return this.extension('Cache').value('box', BoxWrapperFunc).get().size[1];
    // });
    // this.register('left', function () {
    //     return this.extension('Cache').value('box', BoxWrapperFunc).get().position[0];
    // });
    // this.register('top', function () {
    //     return this.extension('Cache').value('box', BoxWrapperFunc).get().position[1];
    // });
    get id(): string {
        return this.identifier
    }

    set id(id) {
        this.identifier = id
    }

}