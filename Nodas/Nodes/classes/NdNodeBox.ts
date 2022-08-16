import NdBox from '../../classes/NdBox';
import Node from '../Node';
import NdCache from '../../classes/NdCache';

export default class NdNodeBox {
    private box: NdBox
    private getter: () => NdBox
    public purge: () => void

    get value(): NdBox {
        return this.getter()
    }

    constructor(element: Node<any>, Cache: NdCache, boxGetter: (e: typeof element) => Parameters<NdBox['value']>) {
        this.box = new NdBox()
        const {getter, purge} = Cache.register<NdBox>('box', () => {
            this.box.value.apply(this.box, boxGetter(element))
            return this.box
        })
        this.getter = getter
        this.purge = () => {
            purge();
            if (element.parent) element.parent.purgeBox()
        }
    }
}