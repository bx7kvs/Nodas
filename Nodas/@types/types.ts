import Ticker from '../Ticker';

export type NdCanvasContext = CanvasRenderingContext2D | null
export type NdCanvasQueueCallbackArgs = [NdCanvasContext, Date, number]
export type NdCanvasQueueCallback = (...args: NdCanvasQueueCallbackArgs) => void
export type NdCanvasQueueItem = {
    order: number,
    f: NdCanvasQueueCallback
}
export type NdNumericArray2d = [x: number, y: number];
export type NdEmitterCallback<Data> = (data: Data) => void;
export type NdMainDrawingPipeFArgs = [context: CanvasRenderingContext2D, date: Date, frame: number]
export type NdMainDrawingPipeF = (...args: NdMainDrawingPipeFArgs) => NdMainDrawingPipeFArgs[0] | false
export type NdRenderConditionPredicate = (...args: NdMainDrawingPipeFArgs) => boolean
export type NdConfigPropertyCheckName =
    'isNumber'
    | 'isString'
    | 'isArray'
    | 'custom'
    | 'under'
    | 'greater'
    | 'eq'
    | 'isBool'
export type NdConfigPropertyCustomCheck = (v: NdConfigPropertyValue) => boolean
export type NdConfigPropertyWatcher<T> = (v: T) => void
export type NdConfigPropertyCheckValue = undefined | string | number | boolean | NdConfigPropertyCustomCheck;
export type NdConfigPropertyValue = string | [] | number | boolean | undefined | {} | null
export type NdConfigPropertyCheckArrayItem = {
    f: NdConfigPropertyCheckName,
    value?: NdConfigPropertyCheckValue
}
export type NdConfigPropertyChecks = {
    [K in NdConfigPropertyCheckName]?: NdConfigPropertyCheckValue
}
export type NdDebugData = { [key: string]: string | number }
export type NdFontFormats = 'eot' | 'svg' | 'ttf' | 'woff';

export enum NdFontSpecialValues {
    'sans-serif' = 'sans-serif',
    'serif' = 'serif',
    'system' = 'system',
}

export type NdSpecialFontWeights = 'light'
    | 'normal'
    | 'bold'
    | 'black'

export type NdFontWeights =
    NdSpecialFontWeights
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 900
    | 1000
export type NdFontStyles = 'normal' | 'italic'
export type NdFontDescription = {
    name: string,
    weight: NdFontWeights[]
    style: NdFontStyles[]
}
export type NdTickerFArgs = [Date, number]
export type NdTickerF = (...args: NdTickerFArgs) => void
export type NdTickerQueueF = (a: NdTickerF | number, b ?: NdTickerF) => void
export type NdTickerQueueItem = {
    order: number,
    f: NdTickerF
}

export type NdTickerEvents = 'stop' | 'start' | 'error';

export type NdTickerEventCb = (data: Error | Ticker) => void

export interface NdTickerEventsContainer {
    stop: NdTickerEventCb[],
    start: NdTickerEventCb[],
    error: NdTickerEventCb[]
}

export interface NdListenable<Scheme, K extends keyof Scheme = keyof Scheme> {
    on: (event: K | K[], callback: (event: Scheme[K]) => any) => any
    once: (event: K | K[], callback: (event: Scheme[K]) => any) => any
    off: (event: K | K[], callback: (event: Scheme[K]) => any) => any
}