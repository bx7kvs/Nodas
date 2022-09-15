import NdEvent from './NdEvent';

export default class NdDestroyEvent<Target> extends NdEvent<Target, null> {
    constructor(target: Target) {
        super(target, null);
        this._type = 'state'
    }
}