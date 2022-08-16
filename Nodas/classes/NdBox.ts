import {NdNumericArray2d} from '../@types/types';

export default class NdBox {
    public readonly container: { size: NdNumericArray2d, position: NdNumericArray2d } = {
        size: [0, 0],
        position: [0, 0]
    }
    public readonly sprite:{margin:[number,number,number,number],position:NdNumericArray2d,size:NdNumericArray2d} = {
        margin: [0, 0, 0, 0],
        position: [0, 0],
        size: [0, 0]
    };

    value(x: number, y: number, width: number, height: number, marginTop: number, marginRight: number, marginBottom: number, marginLeft: number) {
        this.container.size[0] = width;
        this.container.size[1] = height;
        this.container.position[0] = x;
        this.container.position[1] = y;
        this.sprite.margin[0] = marginTop;
        this.sprite.margin[1] = marginRight;
        this.sprite.margin[2] = marginBottom;
        this.sprite.margin[3] = marginLeft;
        this.sprite.size[0] = marginLeft + width + marginRight;
        this.sprite.size[1] = marginTop + height + marginBottom;
        this.sprite.position[0] = x - marginLeft;
        this.sprite.position[1] = y - marginTop;
    }

    //computeBox .get() used to return container prop
}