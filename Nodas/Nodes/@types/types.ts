import {NdFontSpecialValues, NdFontStyles, NdFontWeights, NdMainDrawingPipeF, NdNumericArray2d} from '../../@types/types';

import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdImage from '../../classes/NdImage';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';

import {ndEasings} from '../../classes/NdEasings';
import NdEvent from '../../classes/NdEvent';
import Canvas from '../../Canvas';
import NdMouseEvent from '../../classes/NdMouseEvent';
import NdStateEvent from '../../classes/NdStateEvent';
import Nodes from '../../Nodes';
import Mouse from '../../Mouse';
import Node from '../Node';
import NdModBase from '../models/NdModBase';


export type NdNodeGetter<Type extends Node<any>> = (id: string) => Type
export type GroupChildren = Node<any> | Node<any>[]
export type NodeConstructorParams = { id: string, Tree: Nodes, Mouse: Mouse, Canvas: Canvas }
export type NodeConstructor = new (params: NodeConstructorParams) => Node<any>

export type NdAssemblerContextResolver = (context: CanvasRenderingContext2D) => void
export type NdCacheGetter<T> = () => T
export type NdCacheStorageItem<T> = {
    getter: NdCacheGetter<T>, value?: T, relevant: boolean
}
export type NdCacheStorage = {
    [key: string]: NdCacheStorageItem<any>
}
export type NdExportableReturn = HTMLCanvasElement | HTMLImageElement
export type NdExportable = ((...args: any[]) => NdExportableReturn) | NdExportableReturn
export type NdCacheRegisterFReturn<T> = { purge: () => void, getter: () => T }


// NdEmitter maps and types
export type NdNodePointerPredicate = (cursor: NdNumericArray2d) => Node<any> | false
export type NdNodePointerTransformF = (cursor: NdNumericArray2d) => NdNumericArray2d

export type NdMouseEventData = {
    page: NdNumericArray2d,
    screen: NdNumericArray2d,
    cursor: NdNumericArray2d
}

export type NdNodeMouseEventsScheme<Props extends NdModBase> = {
    mouseMove: NdMouseEvent<Node<Props>>
    mouseLeave: NdMouseEvent<Node<Props>>
    mouseEnter: NdMouseEvent<Node<Props>>
    mouseUp: NdMouseEvent<Node<Props>>
    mouseDown: NdMouseEvent<Node<Props>>
    dragStart: NdMouseEvent<Node<Props>>
    dragEnd: NdMouseEvent<Node<Props>>
    dragMove: NdMouseEvent<Node<Props>>
    focus: NdMouseEvent<Node<Props>>
    blur: NdMouseEvent<Node<Props>>
}
export type NdNodeStateEventsScheme<Props extends NdModBase> = {
    unmount: NdStateEvent<Node<Props>>
    mount: NdStateEvent<Node<Props>>
    destroy: NdStateEvent<Node<Props>>
    export: NdStateEvent<Node<Props>>
    update: NdStateEvent<Node<Props>>
}

export type NdRootCanvasLifecycleData = {
    size: NdNumericArray2d
}

export type NdRootCanvasMouseEventsScheme = {
    mouseEnter: NdMouseEvent<Canvas>
    mouseLeave: NdMouseEvent<Canvas>
    mouseMove: NdMouseEvent<Canvas>
    mouseDown: NdMouseEvent<Canvas>
    mouseUp: NdMouseEvent<Canvas>
}
export type NdRootCanvasStateEventsScheme = {
    switch: NdStateEvent<Canvas>
    resize: NdStateEvent<Canvas>
}


//Nodas Element compiler types

export interface NdNodeCompilerPipe {
    [key: number]: (NdMainDrawingPipeF)[]
}


//Nodas Element styles and animations


export type NdStylePropAnimatedStarter<T, C, A> = (current: C, value: T, setStart: (val: A) => void, setEnd: (val: A) => void) => void
export type NdStylePropAnimatedApplier<T, E> = (value: T, element: E, progress: number) => T
export type ReflectTickingType =
    number
    | NdPercentStr
    | NdTickingArr
    | NdTickingObj
    | NdTickingF
export type NdTickingObj = { [key: string]: ReflectTickingType }
export type NdTickingArr = ReflectTickingType[]
export type NdTickingF = () => ReflectTickingType
export type NdEasingF = (timeElapsedS: number, startValue: number, valueDelta: number, durationS: number) => number

export type NdModAnimated<Model extends NdNodeStylesModel> = {
    [Key in keyof Model as Extract<Key, NdNodeStylePropertyAnimated<any, any, any, any>>] : Model[Key]
}
export type NdModAnimateProps<Model extends NdNodeStylesModel> = {
    [Key in keyof Model]?: Parameters<Model[Key]['set']>[0]
}

export type NdAnimationStack<Model extends NdNodeStylesModel> = {
    value: any
    result?: ReflectTickingType
    name: string
    ani: NdNodeStylePropertyAnimated<any, any, any, any>
}[]


export interface ReflectAnimateConfig<Element extends Node<any> = Node<any>> {
    easing?: keyof typeof ndEasings,
    queue?: boolean,
    duration?: number,
    step?: (event: NdEvent<Element, any>) => void,
    complete?: (event: NdEvent<Element, any>) => void,
}

export type NdTextPartialProps = {
    color: NdColorStr,
    font: string | NdFontSpecialValues,
    weight: NdFontWeights,
    fontSize: number
    lineHeight: number
    style: NdFontStyles
}

export type NdPercentStr = (`${number}%` | `${number}.${number}%` | `.${number}%`) & string
export type NdColorStr = `rgba(${number},${number},${number},${number})` & string;
export type NdURLStr = `${string}.${('png' | 'jpg')}` & string
export type NdUrlSpriteStr = `${string}.${('png' | 'jpg' | 'font')}[${number}]` & string
export type NdPosition =
    NdPercentStr
    | 'left'
    | 'center'
    | 'right'
    | 'top'
    | 'middle'
    | 'bottom'
    | number
export type NdSize = number | 'auto'
export type NdSizeArr = [NdSize, NdSize]
export type NdPositionArr = [NdPosition, NdPosition]
export type NdBg = (NdImage | NdURLStr)[] | NdImage | NdURLStr
export type NdBgSize = [NdPercentStr | 'auto' | number, NdPercentStr | 'auto' | number]
export type NdArrColor = [r: number, g: number, b: number, a: number];
export type NDCpArr = [number, number, number, number];
export type NdSegmentBezier = [x1: number, y1: number, x2: number, y2: number, cx1: number, cy1: number, cx2: number, cy2: number]
export type NdPathBezier = NdSegmentBezier[]
export type NdPath = NdNumericArray2d[]
export type NdColorArr = NdColorStr[]
export type NdColorBox = [NdColorStr, NdColorStr, NdColorStr, NdColorStr]
export type NdColorArrBox = [NdArrColor, NdArrColor, NdArrColor, NdArrColor]
export type NdStrokeWidthBox = [number, number, number, number]
export type NdStrokeWidthArr = number[]
export type NdStrokeStyle = number[]
export type NdStrokeStyleArr = NdStrokeStyle[]
export type NdAnchor = [x: 'left' | 'right' | 'center', y: 'top' | 'bottom' | 'middle']
export type NdCap = 'round' | 'butt' | 'square'
export type NdBlend = 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' |
    'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'multiply' |
    'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' |
    'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'
export type NdMatrixVal = [number, number, number, number, number, number]
export type NdTagRegExpMatch = {
    [key: number]: string,
    index: number,
    groups: {
        content: string | null,
        tagname: 'c' | 'b' | 'i'
        value?: NdColorStr
    }
}


