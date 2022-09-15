import NdEvent from './NdEvent';
import Nodas from "../../Nodas";

export default class NdStateEvent<Target, Data extends Nodas = Nodas> extends NdEvent<Target, Data> {
    constructor(target: Target, data: Data) {
        super(target, data);
        this._type = 'state'
    }
}