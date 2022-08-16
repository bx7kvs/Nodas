import Node from './Node';
import NdModBase from './models/NdModBase';
import NdNodeBox from './classes/NdNodeBox';
import {NdNumericArray2d} from '../@types/types';
import Nodas from '../../Nodas';

export default class Group extends Node<NdModBase> {
    protected Box: NdNodeBox = new NdNodeBox(this, this.Cache, () => {
        let minX = Infinity,
            minY = Infinity,
            maxY = -Infinity,
            maxX = -Infinity

        this.TreeConnector.forEachLayer((e) => {
            const box = e.box
            minX = Math.min(minX, box.position[0])
            minY = Math.min(minY, box.position[1])
            maxX = Math.max(maxX, box.position[0] + box.size[0])
            maxY = Math.max(maxY, box.position[1] + box.size[1])
        })

        if (!isFinite(minX)) minX = 0;
        if (!isFinite(maxX)) maxX = 0;
        if (!isFinite(minY)) minY = 0;
        if (!isFinite(maxY)) maxY = 0;

        return [
            minX + this.data.position.get()[0],
            minY + this.data.position.get()[1],
            maxX - minX,
            maxY - minY,
            0, 0, 0, 0
        ]
    });
    protected render: Node<NdModBase>['render']
    protected test: Node<NdModBase>['test']
    export: Node<NdModBase>['export'] = () => undefined

    constructor(id: string, app: Nodas) {
        super(id, new NdModBase(), app);
        this.render = (context, date, frame) => {
            Node.transformContext(this, context)
            this.TreeConnector.forEachLayer((e) => {
                app.Tree.compile(e, context, date, frame)
            })
            return context
        }
        this.test = (cursor: NdNumericArray2d) => {
            let result: Node<any> | false = false
            this.TreeConnector.forEachLayer(e => {
                if (app.Mouse.checkNode(e, cursor)) {
                    result = e
                }
            })
            return result
        }
    }

    forEachChild(cb: (e:Node<any>) => void) {
        this.TreeConnector.forEachLayer(cb)
    }

    append(node: Node<any> | Node<any>[]) {
        if (node instanceof Array) {
            node.forEach(v => {
                this.TreeConnector.tree.append(this, v.id)
            })
        } else {
            this.TreeConnector.tree.append(this, node.id)
        }

        return this

    }


}