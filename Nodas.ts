import Canvas from './Nodas/Canvas';
import Ticker from './Nodas/Ticker';
import Nodes from './Nodas/Nodes';
import Mouse from './Nodas/Mouse';
import Group from './Nodas/Nodes/Group';
import Line from './Nodas/Nodes/Line';
import Circle from './Nodas/Nodes/Circle';
import Sprite from './Nodas/Nodes/Sprite';
import Area from './Nodas/Nodes/Area';
import Rectangle from './Nodas/Nodes/Rectangle';
import Node from "./Nodas/Nodes/Node";
import ParticleEmitter from "./Nodas/Nodes/ParticleEmitter";
import Particle from "./Nodas/Nodes/Particle";
import {
    GroupChildren,
    NdPath,
    NdUrlSpriteStr,
    NdURLStr
} from './Nodas/Nodes/@types/types.js';
import Text from './Nodas/Nodes/Text';
import NodasFonts from './Nodas/Services/NodasFonts';
import {NdNumericArray2d} from './Nodas/@types/types';
import NodasResources from './Nodas/Services/NodasResources';
import NdImage from './Nodas/classes/NdImage';
import NdSprite from './Nodas/classes/NdSprite';
import NdModField from "./Nodas/Nodes/models/NdModField";
import Field from "./Nodas/Nodes/Field";
import NodasRandom from "./Nodas/Services/NodasRandom";

export default class Nodas {
    readonly ticker = new Ticker()
    readonly canvas: Canvas
    readonly nodes: Nodes
    readonly mouse: Mouse

    public Sprite: new(id: string, src?: NdUrlSpriteStr | NdURLStr) => Sprite
    public Area: new(id: string, path?: NdPath) => Area
    public Rectangle: new(id: string, size?: NdNumericArray2d) => Rectangle
    public Line: new(id: string, path?: NdPath) => Line
    public Text: new(id: string, str?: string) => Text
    public Group: new(id: string, children?: GroupChildren) => Group
    public Circle: new(id: string, radius?: number) => Circle
    public Field: new (id: string, options?: { [key in keyof NdModField]?: Parameters<NdModField[key]['set']>[0] }) => Field

    public get(id:string):Node<any> {
        return this.nodes.get(id)
    }

    public append:(node:Node<any> | Node<any>[]) => Nodas

    public setRoot(node:Group) {
        this.nodes.root?.detach()
        node.attach(this)
        return this
    }



    Animation = NdSprite
    Image = NdImage

    constructor(canvas: HTMLCanvasElement | string) {
        const TickerSrv = new Ticker()
        const CanvasSrv = new Canvas(TickerSrv)
        const TreeSrv = new Nodes(CanvasSrv)
        const MouseSrv = new Mouse(CanvasSrv, TickerSrv, TreeSrv)
        CanvasSrv.element(canvas)
        this.ticker = TickerSrv
        this.canvas = CanvasSrv
        this.mouse = MouseSrv
        this.nodes = TreeSrv


        const root = new Group('NODE_TREE_DEFAULT_ROOT')
        root.attach(this)

        this.append = (node:Node<any> | Node<any>[]) => {
            root.append(node)
            return this
        }
        this.Text = class NodasText extends Text {
            constructor(id: string, str?: string) {
                super(id);
                if (str) this.style('str', str)
                root.append(this)
            }
        }
        this.Area = class NodasArea extends Area {
            constructor(id:string, path?:NdPath) {
                super(id);
                if(path) this.style('path', path)
                root.append(this)
            }
        }
        this.Rectangle = class NodasRectangle extends Rectangle{
            constructor(id:string, size?:NdNumericArray2d) {
                super(id);
                if(size) this.style('size', size)
                root.append(this)
            }
        }
        this.Line = class NodasLine extends Line {
            constructor(id:string, path?:NdPath) {
                super(id);
                if(path) this.style('path', path)
                root.append(this)
            }
        }
        this.Sprite = class NodasSprite extends Sprite {
            constructor(id:string, url?:NdURLStr | NdUrlSpriteStr) {
                super(id);
                if(url) this.style('src', url)
                root.append(this)
            }
        }
        this.Circle = class NodasCircle extends Circle {
            constructor(id:string, radius?:number) {
                super(id);
                if(radius) this.style('radius', radius)
                root.append(this)
            }
        }
        this.Group = class NodasGroup extends Group {
            constructor(id:string, children?:GroupChildren) {
                super(id);
                if (children) this.append(children)
                root.append(this)
            }
        }

        this.Field = class NodasField extends Field {
            constructor(id:string, options?:{[key in keyof NdModField] ?: Parameters<NdModField[key]['set']>[0]}) {
                super(id);
                if(options) this.style(options)
                root.append(this)
            }
        }


    }
}
export  {
    Area as Area,
    Circle as Circle,
    Field as Field,
    Group as Group,
    Line as Line,
    Node as Node,
    ParticleEmitter as ParticleEmitter,
    Particle as Particle,
    Rectangle as Rectangle,
    Sprite as Sprite,
    Text as Text
}
export const Fonts: typeof NodasFonts = NodasFonts
export const Resources: typeof NodasResources = NodasResources
export const NodasImage = NdImage
export const NodasSprite = NdSprite
export const NodasRand: typeof NodasRandom = NodasRandom