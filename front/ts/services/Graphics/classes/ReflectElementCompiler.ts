import {
    ReflectMainDrawingPipeCallback,
    ReflectRenderConditionPredicate
} from "../../../@types/types";
import Emitter from "../../../core/classes/Emitter";
import Application from "../../../core/modules/Application/Application";
import {
    ReflectExportable,
    ReflectGraphicsCompilerPipe
} from "../@types/types";
import ReflectElement from "../ReflectElement";

export default class ReflectElementCompiler<T extends ReflectElement<any>> extends Emitter<'sprite-export' | 'render-update', T> {
    private readonly resovler: ReflectMainDrawingPipeCallback<T>;
    private readonly update: ReflectMainDrawingPipeCallback<T>;
    private readonly element: T;
    private pipeSize = 0;
    private conditions: ReflectRenderConditionPredicate<T>[] = []
    private renderAllowed = true;
    private exports = null;
    private callUpdateCb = false;
    private drawerPipeBefore: ReflectGraphicsCompilerPipe<T> = {};
    private drawerPipeAfter: ReflectGraphicsCompilerPipe<T> = {};
    private beforePipeSize = 0;
    private afterPipeSize = 0;
    private renderAllowIterator = 0
    private isRenderAllowed: ReflectRenderConditionPredicate<T> = (...args): boolean => {
        if (this.conditions.length > 0) {
            for (this.renderAllowIterator = 0; this.renderAllowIterator < this.conditions.length; this.renderAllowIterator++) {
                this.renderAllowed = this.conditions[this.renderAllowIterator](...args);
                if (!this.renderAllowed) break;
            }
            return this.renderAllowed;
        } else {
            return true;
        }
    }

    constructor(element: T, exports: ReflectExportable, resolver: ReflectMainDrawingPipeCallback<T>, updater: ReflectMainDrawingPipeCallback<T>) {
        super()
        this.element = element
        this.exports = exports
        this.resovler = resolver
        this.update = updater
    }

    public export() {
        this.emit('sprite-export', this.element)
        return typeof exports === "function" ? exports() : exports;
    }

    public filter(f: ReflectRenderConditionPredicate<T>) {
        this.conditions.push(f)
    }

    public pipe(f: ReflectMainDrawingPipeCallback<T>, order?: number) {
        if (!order) order = 0
        if (order > 100) {
            if (!this.drawerPipeAfter[order]) this.drawerPipeAfter[order] = [];
            this.drawerPipeAfter[order].push(f);
            this.afterPipeSize++
        } else {
            if (!this.drawerPipeBefore[order]) {
                this.drawerPipeBefore[order] = [];
            }
            this.drawerPipeBefore[order].push(f);
            this.beforePipeSize++;
        }
        this.pipeSize++;
        return this.element
    }

    public unpipe(f: ReflectMainDrawingPipeCallback<T>) {
        for (let index in this.drawerPipeBefore) {
            if (this.drawerPipeBefore.hasOwnProperty(index)) {
                this.drawerPipeBefore[index] = this.drawerPipeBefore[index].filter((cb) => {
                    if (cb === f) {
                        this.pipeSize--;
                        this.beforePipeSize--;
                        return false;
                    } else return true;
                });
            }
        }
        for (let index in this.drawerPipeAfter) {
            if (this.drawerPipeAfter.hasOwnProperty(index)) {
                this.drawerPipeAfter[index] = this.drawerPipeAfter[index].filter((cb) => {
                    if (cb === f) {
                        this.pipeSize--;
                        this.afterPipeSize--;
                        return false;
                    } else return true;
                });
            }
        }
        return this.element;
    }

    public compile(context: CanvasRenderingContext2D, date: Date, frame: number) {
        if (this.callUpdateCb) {
            this.emit('render-update', this.element)
            this.callUpdateCb = false;
        }
        this.renderAllowed = true;
        if (this.isRenderAllowed(this.element, context, date, frame)) {

            let currentContext: CanvasRenderingContext2D | boolean = context

            context.save();

            this.update(this.element, context, date, frame)

            if (this.beforePipeSize) {
                for (let pipeOrder in this.drawerPipeBefore) {
                    if (this.drawerPipeBefore.hasOwnProperty(pipeOrder)) {
                        for (let pipeIndex = 0; pipeIndex < this.drawerPipeBefore[pipeOrder].length; pipeIndex++) {
                            context.save();
                            const callbacksResult = this.drawerPipeBefore[pipeOrder][pipeIndex](this.element, currentContext, date, frame);
                            context.restore();
                            currentContext = callbacksResult ? callbacksResult : false;
                            if (!currentContext) break;
                        }
                    }
                    if (!currentContext) break;
                }
            }
            if(currentContext) {
                currentContext.globalCompositeOperation = this.element.Model.blending
                currentContext.globalAlpha *= this.element.Model.opacity
            }
            if (currentContext === context) {
                this.resovler(this.element, context, date, frame)
            } else {
                this.resovler(this.element, context, date, frame)
                if(currentContext) {
                    context.drawImage(currentContext.canvas, 0, 0, context.canvas.width, context.canvas.height);
                }
            }
            currentContext = context
            if (this.afterPipeSize) {
                for (let pipeOrder in this.drawerPipeAfter) {
                    if (this.drawerPipeAfter.hasOwnProperty(pipeOrder)) {
                        for (let pipeIndex = 0; pipeIndex < this.drawerPipeAfter[pipeOrder].length; pipeIndex++) {
                            currentContext.save();
                            const callbacksResult = this.drawerPipeAfter[pipeOrder][pipeIndex](this.element, currentContext, date, frame);
                            currentContext.restore();
                            currentContext = callbacksResult ? callbacksResult : false;
                            if (!currentContext) break;
                        }
                    }
                    if (!currentContext) break;
                }
            }
            context.restore();

        }
    }

}