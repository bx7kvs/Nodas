export enum ReflectCanvasEvents {
    'switch' = 'switch',
    'resize' = 'resize'
}
export type ReflectCanvasContext = CanvasRenderingContext2D | null
export type ReflectCanvasQueueCallbackArgs = [ReflectCanvasContext, Date, number]
export type ReflectCanvasQueueCallback = (...args:ReflectCanvasQueueCallbackArgs ) => void
export type ReflectCanvasQueueItem = {
    order: number,
    f: ReflectCanvasQueueCallback
}
