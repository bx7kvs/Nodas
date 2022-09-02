import NdEvent from './NdEvent';

export default class NdStateEvent<Target> extends NdEvent<Target, null> {
    constructor(target:Target,data:null) {
        super(target, null);
        this._type = 'state'
    }
}