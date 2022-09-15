import {NdMainDrawingPipeF, NdRenderConditionPredicate} from '../@types/types';
import {NdNodeCompilerPipe} from '../Nodes/@types/types';
import Node from '../Nodes/Node';
import NdModBase from '../Nodes/models/NdModBase';

export default class NdCompiler<Props extends NdModBase,
    NodeType extends Node<Props> = Node<Props>> {
    private readonly resolver: NdMainDrawingPipeF;
    private readonly node: NodeType
    private readonly props: Props;
    private conditions: NdRenderConditionPredicate[] = []
    private drawerPipeBefore: NdNodeCompilerPipe = {};
    private drawerPipeAfter: NdNodeCompilerPipe = {};
    private beforePipeSize = 0;
    private afterPipeSize = 0;
    private isRenderAllowed: NdRenderConditionPredicate = (...args): boolean => {
        let renderAllowed = true;
        for (let i = 0; i < this.conditions.length; i++) {
            if (!(renderAllowed = this.conditions[i](...args))) break;
        }
        return renderAllowed;
    }

    constructor(node: NodeType, model: Props, resolver: NdMainDrawingPipeF) {
        this.node = node
        this.resolver = resolver
        this.props = model
    }

    public filter(f: NdRenderConditionPredicate) {
        this.conditions.push(f)
    }

    public pipe(f: NdMainDrawingPipeF, order?: number) {
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
        return this.node
    }

    public unpipe(f: NdMainDrawingPipeF) {
        for (let index in this.drawerPipeBefore) {
            if (this.drawerPipeBefore.hasOwnProperty(index)) {
                this.drawerPipeBefore[index] = this.drawerPipeBefore[index].filter((cb) => {
                    if (cb === f) {
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
                        this.afterPipeSize--;
                        return false;
                    } else return true;
                });
            }
        }
        return this.node;
    }

    public render: NdMainDrawingPipeF = (context: CanvasRenderingContext2D, date: Date, frame: number) => {
        if (this.isRenderAllowed(context, date, frame)) {
            let currentContext: CanvasRenderingContext2D | false = context
            context.save();
            if (this.beforePipeSize) {
                for (let pipeOrder in this.drawerPipeBefore) {
                    if (this.drawerPipeBefore.hasOwnProperty(pipeOrder)) {
                        for (let pipeIndex = 0; pipeIndex < this.drawerPipeBefore[pipeOrder].length; pipeIndex++) {
                            context.save();
                            const callbacksResult = this.drawerPipeBefore[pipeOrder][pipeIndex](currentContext, date, frame);
                            context.restore();
                            currentContext = callbacksResult ? callbacksResult : false;
                            if (!currentContext) break;
                        }
                    }
                    if (!currentContext) break;
                }
            }
            if (currentContext) {
                currentContext.globalCompositeOperation = this.props.blending.protectedValue
                currentContext.globalAlpha *= this.props.opacity.protectedValue
            }
            if (currentContext === context) {
                this.resolver(context, date, frame)
            } else {
                this.resolver(context, date, frame)
                if (currentContext) {
                    context.drawImage(currentContext.canvas, 0, 0, context.canvas.width, context.canvas.height);
                }
            }
            currentContext = context
            if (this.afterPipeSize) {
                for (let pipeOrder in this.drawerPipeAfter) {
                    if (this.drawerPipeAfter.hasOwnProperty(pipeOrder)) {
                        for (let pipeIndex = 0; pipeIndex < this.drawerPipeAfter[pipeOrder].length; pipeIndex++) {
                            currentContext.save();
                            const callbacksResult = this.drawerPipeAfter[pipeOrder][pipeIndex](currentContext, date, frame);
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
        return context
    }

}