import NdBox from '../../classes/NdBox';
import Node from '../Node';
import NdCache from '../../classes/NdCache';

export default class NdNodeBox {
    private readonly box: NdBox
    private readonly getter: () => NdBox
    public purge: () => void

    get value(): NdBox {
        return this.getter()
    }

    constructor(node: Node<any>, Cache: NdCache, boxGetter: (n: typeof node) => Parameters<NdBox['value']>) {
        let localNode:Node<any> | undefined = node
        this.box = new NdBox()
        node.once('destroyed', () => localNode = undefined)
        const {getter, purge} = Cache.register<NdBox>('box', () => {
            if(localNode) this.box.value.apply(this.box, boxGetter(localNode))
            return this.box
        })
        this.getter = getter
        this.purge = () => {
            purge();
            if(localNode && localNode.parent) localNode.parent.purgeBox()
        }
    }
}