import NdCache from '../../classes/NdCache';
import NdNodeMatrix from './NdNodeMatrix';
import Node from '../Node';
import Group from '../Group';
import NdModBase from '../models/NdModBase';

export class NdNodeMatrixContainer<Model extends NdModBase = NdModBase, N extends Node<Model> = Node<Model>> {
    private readonly getter: () => NdNodeMatrix
    public readonly purge: () => void

    get value(): NdNodeMatrix {
        return this.getter()
    }

    constructor(element: N, model: Model, cache: NdCache) {
        const matrix = new NdNodeMatrix()
        const {getter, purge} =
            cache.register<NdNodeMatrix>('transformMatrix',
                () => {
                    const sprite = element.boundingRect
                    if (sprite) {
                        matrix.reset()
                        const position = model.position.protectedValue,
                            origin = [sprite.size[0] * model.origin.protectedValue[0], sprite.size[1] * model.origin.protectedValue[1]],
                            skew = model.skew.protectedValue,
                            rotate = model.rotate.protectedValue,
                            scale = model.scale.protectedValue,
                            translate = model.translate.protectedValue,
                            _translate = element instanceof Group ? [
                                position[0] + translate[0],
                                position[1] + translate[1]
                            ] : [
                                sprite.position[0] + translate[0],
                                sprite.position[1] + translate[1]
                            ]


                        matrix.translate(origin[0], origin[1])
                        if (_translate[0] !== 0 || _translate[1] !== 0) matrix.translate(_translate[0], _translate[1])
                        if (rotate) matrix.rotate(rotate)
                        if (skew[0] !== 0 || skew[1] !== 0) matrix.skew(skew[0], skew[1])
                        if (scale[0] !== 0 || scale[1] !== 0) matrix.scale(scale[0], scale[1])
                        matrix.translate(-origin[0], -origin[1]);
                        matrix.invert()
                    }
                    return matrix
                }
            )
        this.purge = purge
        this.getter = getter
    }
}