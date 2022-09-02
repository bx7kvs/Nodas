import NdEvent from './NdEvent';
import {NdMouseEventData} from '../Nodes/@types/types';

export default class NdMouseEvent<Target> extends NdEvent<Target, NdMouseEventData> {
    constructor(target: Target, data: NdMouseEventData) {
        super(target, data);
        this._type = 'mouse'
    }
}