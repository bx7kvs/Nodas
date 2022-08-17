import {NDB} from './NodasDebug';
import {NdURLStr} from '../Nodes/@types/types';

class NodasResources {

    private images: {
        [key: string]: {
            loaded: boolean,
            loading: boolean,
            onError: (() => void)[],
            onLoad: (() => void)[],
            onReset: (() => void)[],
            error: boolean,
            src: string,
            image: HTMLImageElement
        }
    } = {}

    image(src: string, onLoad?: () => void, onError?: () => void, onReset?: () => void) {
        if (this.images[src]) {
            NDB.info(`Dispatcher returned cached image ${src}`)
            if (this.images[src].loading) {
                if(onLoad) this.images[src].onLoad.push(onLoad)
                if(onError) this.images[src].onError.push(onError)
            } else {
                setTimeout(() => {
                    if (this.images[src]) {
                        if (this.images[src].loaded && onLoad) onLoad()
                        if (this.images[src].error && onError) onError()
                    }
                })
            }
            if(onReset) this.images[src].onReset.push(onReset)
        } else {
            NDB.info(`Loading image ${src}`)
            this.images[src] = {
                loaded: false,
                error: false,
                loading: true,
                onError: onError? [onError] : [],
                onLoad: onLoad ? [onLoad] : [],
                onReset: onReset ? [onReset] : [],
                src: src,
                image: new Image()
            }
            this.images[src].image.addEventListener('load', () => {
                NDB.positive(`Image ${src} loaded.`)
                this.images[src].loaded = true
                this.images[src].error = false
                this.images[src].onLoad.forEach(v => v())
                this.images[src].onError = []
                this.images[src].onLoad = []
            })
            this.images[src].image.addEventListener('error', () => {
                NDB.negative(`Image ${src} failed to load`)
                this.images[src].loaded = false
                this.images[src].error = true
                this.images[src].loading = false
                this.images[src].onError.forEach(v => v())
                this.images[src].onError = []
                this.images[src].onLoad = []
            })
            this.images[src].image.src = src
        }
        return this.images[src].image
    }

    reset() {
        const images = Object.values(this.images)
        this.images = {}
        images.forEach(v => v.onReset.forEach(v => v()))
    }
    bulkLoad(resources:NdURLStr[]) {
        resources.forEach(v => {this.image(v)})
    }
}

export const NDR = new NodasResources()
export default NDR
