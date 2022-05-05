import {ReflectMainDrawingPipeCallback} from "../../../@types/types";
import Application from "../../../core/modules/Application/Application";
import ReflectElementBox from "../classes/ReflectElementBox";
import ReflectBox from "../classes/ReflectBoxProvider";
import ReflectCache from "../classes/ReflectCache";
import ReflectElementModel from "../classes/ReflectElementModel";
import ReflectElementCompiler from "../classes/ReflectElementCompiler";
import ReflectElement from "../ReflectElement";

export interface ReflectElementProps {
    app: Application,
    compiler: ReflectElementCompiler
    cache:ReflectCache
    box: ReflectBox
    model:ReflectElementModel
    id: string
}

export interface ReflectDrawerProps<T> {

}

export type ReflectAssemblerContextResolver = (context: CanvasRenderingContext2D) => void
export type ReflectDrawerGraphicsResolver = () => void

export type ReflectCacheGetter<T> = () => T
export type ReflectCacheStorageItem<T> = {
    getter: ReflectCacheGetter<any>, value: T, relevant: boolean
}
export type ReflectCacheStorage = {
    [key: string]: ReflectCacheStorageItem<any>
}
export type ReflectCacheRegister<T> = (name:string, func:ReflectCacheGetter<T>) => { purge: () => void, getter: () => T }
export type ReflectExportable = HTMLCanvasElement | Image | (() => HTMLCanvasElement | Image)
export type ReflectCacheRegisterReturn<T> = { purge: () => void, getter: () => T }

export type ReflectBoxGetter<T extends ReflectElement<any>> = ((box: ReflectElementBox, element: T) => ReflectElementBox)

export type ReflectElementLifecycleEvents = 'unmount'| 'mount' | 'destroy'

export interface ReflectGraphicsCompilerPipe<T extends ReflectElement<any>> {
    [key:number] : (ReflectMainDrawingPipeCallback<T>)[]
}