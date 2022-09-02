import NdNodeMouseDispatcher from './Mouse/NdNodeMouseDispatcher';
import NdModBase from './Nodes/models/NdModBase';
import {
    NdMouseEventData,
    NdNodeMouseEventsScheme,
    NdNodePointerPredicate,
    NdNodePointerTransformF
} from './Nodes/@types/types';
import Ticker from './Ticker';
import Canvas from './Canvas';
import {NdNumericArray2d} from './@types/types';
import NdMouseEvent from './classes/NdMouseEvent';
import Nodes from './Nodes';
import Node from './Nodes/Node';

export default class Mouse {
    private Nodes: {
        [key: string]: {
            handler: NdNodeMouseDispatcher<any>
            node: Node<any>
        }
    } = {}

    private currentHover: Node<any> | false = false
    private currentFocus: Node<any> | false = false
    private mouseDown: boolean = false
    private dragging: boolean = false
    private eventStack: (() => void)[] = []
    private postponed: (() => void)[] = []
    protected maxEventsPerQueue: number = 5
    protected maxEventsResolveTimePerFrame: number


    constructor(Canvas: Canvas, Ticker: Ticker, Tree: Nodes) {
        this.maxEventsResolveTimePerFrame = Ticker.frameTime
        Canvas.queue(this.resolveStack.bind(this))
        Canvas.on('mouseDown', (event) => {
            this.mouseDown = true
            if (this.currentHover) this.resolveOrPostpone(
                this.currentHover,
                'mouseDown',
                new NdMouseEvent<Node<any>>(this.currentHover, {...event.data as NdMouseEventData}))
            if (this.currentFocus && this.currentFocus !== this.currentHover) {
                if (this.currentFocus !== this.currentHover) {
                    this.resolveOrPostpone(
                        this.currentFocus, 'blur',
                        new NdMouseEvent<Node<any>>(this.currentFocus, {...event.data as NdMouseEventData})
                    )
                    if (this.currentHover) {
                        this.resolveOrPostpone(
                            this.currentHover, 'focus',
                            new NdMouseEvent<Node<any>>(this.currentHover, {...event.data as NdMouseEventData})
                        )
                    }
                    this.currentFocus = this.currentHover
                }
            }
        })
        Canvas.on('mouseUp', (event) => {
            this.mouseDown = false
            if (this.dragging) {
                if (this.currentFocus) this.resolveOrPostpone(
                    this.currentFocus, 'dragEnd',
                    new NdMouseEvent<Node<any>>(this.currentFocus, {...event.data as NdMouseEventData})
                )
                this.dragging = false
            }
            if (this.currentHover) {
                this.resolveOrPostpone(
                    this.currentHover, 'mouseUp',
                    new NdMouseEvent<Node<any>>(this.currentHover, {...event.data as NdMouseEventData})
                )
            }
        })
        Canvas.on('mouseLeave', (event) => {
            if (this.dragging) {
                if (this.currentFocus) {
                    this.resolveOrPostpone(this.currentFocus, 'dragEnd',
                        new NdMouseEvent<Node<any>>(this.currentFocus, {...event.data as NdMouseEventData})
                    )
                }
                this.dragging = false
            }
            if (this.currentHover) this.resolveOrPostpone(this.currentHover, 'mouseLeave',
                new NdMouseEvent<Node<any>>(this.currentHover, {...event.data as NdMouseEventData})
            )
            this.currentFocus = false
            this.currentHover = false
            this.mouseDown = false
        })
        Canvas.on('mouseMove', (event) => {
            if (!Tree.root) return
            if (!this.dragging) {
                const target = this.checkNode(Tree.root, (event.data as NdMouseEventData).cursor)
                if (target !== this.currentHover) {
                    if (this.currentHover) {
                        this.resolveOrPostpone(this.currentHover, 'mouseLeave',
                            new NdMouseEvent<Node<any>>(this.currentHover, {...event.data as NdMouseEventData})
                        )
                    }
                    if (target) {
                        this.resolveOrPostpone(target, 'mouseEnter',
                            new NdMouseEvent<Node<any>>(target, {...event.data as NdMouseEventData})
                        )
                    }
                    this.currentHover = target
                } else {
                    if (target) this.resolveOrPostpone(
                        target, 'mouseMove',
                        new NdMouseEvent<Node<any>>(
                            target,
                            {...event.data as NdMouseEventData}
                        ))
                }
            } else if (this.mouseDown && this.currentFocus) {
                if (!this.dragging) {
                    this.resolveOrPostpone(this.currentFocus, 'dragStart',
                        new NdMouseEvent<Node<any>>(this.currentFocus, {...event.data as NdMouseEventData})
                    )
                    this.dragging = true
                } else {
                    this.resolveOrPostpone(this.currentFocus, 'dragMove',
                        new NdMouseEvent<Node<any>>(this.currentFocus, {...event.data as NdMouseEventData})
                    )
                }
            }
        })
    }

    checkNode(node: Node<any>, cursor: NdNumericArray2d):Node<any> | false {
        if (this.Nodes[node.id]) {
            if (this.Nodes[node.id].node.destroyed) return false
            return !this.Nodes[node.id].node.destroyed ? this.Nodes[node.id].handler.test(cursor) : false
        } else throw new Error('Root swap')
    }

    private resolveStack() {
        if (!this.eventStack.length) return
        let iterations: number = 0
        const startTime = new Date().getTime()
        let elapsed = 0
        while (this.eventStack[0] && iterations < this.maxEventsPerQueue && elapsed < this.maxEventsResolveTimePerFrame) {
            (this.eventStack.shift() as () => void)() // call first in current queue
            iterations++
            elapsed = new Date().getTime() - startTime
        }
        // if stack appear to be empty and there are postponed events  => add first postponed callback to current resolve stack
        if (!this.eventStack.length && this.postponed[0]) this.eventStack.push(this.postponed.shift() as () => void)
    }

    private getStackCallback(
        node: Node<any> | null,
        event: keyof NdNodeMouseEventsScheme<any>,
        data: Parameters<Node<any>['cast']>[1]) {
        return () => {
            if (node && !node.destroyed) {
                const result = this.Nodes[node.id].handler.cast(event, data)
                if (result && result.propagate) {
                    this.eventStack.push(this.getStackCallback(this.Nodes[node.id].node.parent, event, data))
                }
            }
        }
    }

    private resolveOrPostpone(node: Node<any>, event: keyof NdNodeMouseEventsScheme<any>, data: Parameters<Node<any>['cast']>[1]) {
        !this.eventStack.length ?
            this.eventStack.push(this.getStackCallback(node, event, data)) :
            this.postponed.push(this.getStackCallback(node, event, data))
    }

    register<Props extends NdModBase>(
        node: Node<any>,
        emitter: Node<any>['cast'],
        test: NdNodePointerPredicate,
        transform?: NdNodePointerTransformF
    ) {
        if (!this.Nodes[node.id]) {
            this.Nodes[node.id] = {
                node: node,
                handler: new NdNodeMouseDispatcher<Props>(emitter.bind(node), test, transform)
            }
            node.once('destroy', () => delete this.Nodes[node.id])
        } else throw new Error(`Another Nodas with id ${node.id} has already been registered as mouse sensitive`)
        return this.Nodes[node.id].handler
    }
}