import {
    NdFontSpecialValues,
    NdFontStyles,
    NdFontWeights,
    NdMainDrawingPipeF,
    NdNumericArray2d
} from '../../@types/types';

import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdImage from '../../classes/NdImage';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';

import {ndEasings} from '../../classes/NdEasings';
import NdEvent from '../../classes/NdEvent';
import Canvas from '../../Canvas';
import NdMouseEvent from '../../classes/NdMouseEvent';
import NdStateEvent from '../../classes/NdStateEvent';
import Node from '../Node';
import NdSprite from "../../classes/NdSprite";
import NdEmitter from "../../classes/NdEmitter";
import NdAnimatedNode from "../classes/NdAnimatedNode";
import NdLayer from "../../classes/NdLayer";
import NdDestroyEvent from "../../classes/NdDestroyEvent";
import NdModBase from "../models/NdModBase";


export type GroupChildren = Node<any> | Node<any>[]

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

export type NdMouseEventData = {
    page: NdNumericArray2d,
    screen: NdNumericArray2d,
    cursor: NdNumericArray2d
}

export type NdNodeMouseEventsScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>
    mouseMove: NdMouseEvent<Class>
    mouseLeave: NdMouseEvent<Class>
    mouseEnter: NdMouseEvent<Class>
    mouseUp: NdMouseEvent<Class>
    mouseDown: NdMouseEvent<Class>
    dragStart: NdMouseEvent<Class>
    dragEnd: NdMouseEvent<Class>
    dragMove: NdMouseEvent<Class>
    focus: NdMouseEvent<Class>
    blur: NdMouseEvent<Class>
}
export type NdDestructibleEventScheme<Class extends NdEmitter<any>> = {
    destroy: NdDestroyEvent<Class>,
    destroyed: NdDestroyEvent<Class>,
}

export type NdNodeBasicEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>
    mount: NdStateEvent<Class>
    unmount: NdStateEvent<Class>
}

export type NdParticleEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>
    ready: NdEvent<Class, null>
}
export type NdNodeAssemblerEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>
    resize: NdStateEvent<Class>,
    update: NdStateEvent<Class>
} & NdDestructibleEventScheme<Class>
export type NdNodeStateEventsScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>
    export: NdStateEvent<Class>
    update: NdStateEvent<Class>
}
export type NdNodeEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>
} &
    NdDestructibleEventScheme<Class>
    & NdNodeBasicEventScheme<Class>
    & NdNodeStateEventsScheme<Class>
    & NdNodeMouseEventsScheme<Class>
export type NodeScheme<Model extends NdModBase> = { [key: string]: any } & NdNodeEventScheme<Node<Model, NodeScheme<Model>>>

export type NdRootCanvasMouseEventsScheme = {
    [key: string]: NdEvent<any, any>
    mouseEnter: NdMouseEvent<Canvas>
    mouseLeave: NdMouseEvent<Canvas>
    mouseMove: NdMouseEvent<Canvas>
    mouseDown: NdMouseEvent<Canvas>
    mouseUp: NdMouseEvent<Canvas>
}
export type NdRootCanvasStateEventsScheme = {
    [key: string]: NdEvent<any, any>
    switch: NdEvent<Canvas, null>
    resize: NdEvent<Canvas, null>
}
export type NdParticleModifier = (vector: NdParticleVector) => void
export type NdParticleArgs = [
    sprite: NdParticleSpriteResource | string,
    resolver: (vector: NdParticleVector, progress: number, time: Date) => boolean,
    initiator?: (vector: NdParticleVector, time: Date) => boolean
]
export type NodasAssemblerUpdateF<T extends AssemblerLayerConfig[], K extends number = keyof T & number> = (name?: T[K]['name']) => void
export type AssemblerLayerConfig = {
    name: string,
    resolver: ConstructorParameters<typeof NdLayer>[0]
}

//Nodas Element compiler types

export interface NdNodeCompilerPipe {
    [key: number]: (NdMainDrawingPipeF)[]
}


//Nodas Element styles and animations


export type NdStylePropAnimatedStarter<T, C, A> = (current: C, value: T, setStart: (val: A) => void, setEnd: (val: A) => void) => void
export type NdStylePropAnimatedApplier<T, E> = (value: T, node: E, progress: number) => T
export type NodasTickingType =
    number
    | NdPercentStr
    | NdTickingArr
    | NdTickingObj
    | NdTickingF
export type NdTickingObj = { [key: string]: NodasTickingType }
export type NdTickingArr = NodasTickingType[]
export type NdTickingF = () => NodasTickingType
export type NdEasingF = (timeElapsedS: number, startValue: number, valueDelta: number, durationS: number) => number

export type NdAnimationStack<Model extends NdNodeStylesModel> = {
    value: any
    result?: NodasTickingType
    name: string
    ani: NdNodeStylePropertyAnimated<any, any, any, any>
}[]


export interface NodasAnimateConfig<Class extends NdAnimatedNode<any, any>> {
    easing?: keyof typeof ndEasings,
    queue?: boolean,
    duration?: number,
    step?: (event: NdEvent<Class, any>) => void,
    complete?: (event: NdEvent<Class, any>) => void,
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
export type NdURLStr = `${string}.${('png' | 'jpg')}` | `data:image/${string};base64,${string}` & string
export type NdUrlSpriteStr =
    `${string}.${('png' | 'jpg' | 'font')}[${number}]`
    | `[${number}]data:image/${string};base64,${string}` & string
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

export type NdParticleVector = [x: number, y: number, r: number, xsk: number, ysk: number, xsc: number, ysc: number, o: number]
export type NdMatrixVal = [number, number, number, number, number, number]
export type NdParticleSpriteResource = NdSprite | NdImage | HTMLCanvasElement | HTMLImageElement
export type NdTagRegExpMatch = {
    [key: number]: string,
    index: number,
    groups: {
        content: string | null,
        tagname: 'c' | 'b' | 'i'
        value?: NdColorStr
    }
}


