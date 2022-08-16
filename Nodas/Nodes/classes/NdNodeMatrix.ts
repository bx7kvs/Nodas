import NdCache from '../../classes/NdCache';
import NdMatrix from '../../classes/NdMatrix';
import Node from '../Node';
import Group from '../Group';
import NdModBase from '../models/NdModBase';

export class NdNodeMatrix<Model extends NdModBase = NdModBase, N extends Node<Model> = Node<Model>> {
    private getter: () => NdMatrix
    public purge: () => void

    get value(): NdMatrix {
        return this.getter()
    }

    constructor(element: N, model: Model, cache: NdCache) {
        const matrix = new NdMatrix(element)
        const {getter, purge} =
            cache.register<NdMatrix>('transformMatrix',
                () => {
                    matrix.reset()
                    const position = model.position.protectedValue,
                        sprite = element.boundingRect,
                        origin = model.origin.protectedValue.map((v,key) => sprite.size[key] * v),
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

                    return matrix
                }
            )
        this.purge = purge
        this.getter = getter
    }
}