import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {NdAnchor} from '../@types/types';
import NdNodeStylesModel from '../classes/NdNodeStylesModel';

export default class NdModAnchor extends NdNodeStylesModel {
    anchor = new NdStylesProperty<NdAnchor, NdAnchor, NdAnchor>(
        0,
        ['left', 'top'],
        (current) => [...current],
        (value) => [...value]
    )
}