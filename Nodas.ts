import Canvas from './Nodas/Canvas';
import Config from './Nodas/Config';
import Ticker from './Nodas/Ticker';
import Nodes from './Nodas/Nodes';
import Mouse from './Nodas/Mouse';
import Group from './Nodas/Nodes/Group';
import Line from './Nodas/Nodes/Line';
import Circle from './Nodas/Nodes/Circle';
import Sprite from './Nodas/Nodes/Sprite';
import Area from './Nodas/Nodes/Area';
import Rectangle from './Nodas/Nodes/Rectangle';
import {GroupChildren, NdPath, NdUrlSpriteStr, NdURLStr} from './Nodas/Nodes/@types/types.js';
import Text from './Nodas/Nodes/Text';
import NodasFonts from './Nodas/Services/NodasFonts';
import {NdNumericArray2d} from './Nodas/@types/types';
import NodasResources from './Nodas/Services/NodasResources';
import NdImage from './Nodas/classes/NdImage';
import NdSprite from './Nodas/classes/NdSprite';

export default class Nodas {
    readonly Ticker = new Ticker()
    readonly Canvas: Canvas
    readonly Tree: Nodes
    readonly Mouse: Mouse
    protected readonly Config = new Config()

    public Sprite:new(id:string, src?:NdUrlSpriteStr | NdURLStr) => Sprite
    public Area:new(id:string, path?:NdPath) => Area
    public Rectangle:new(id:string, size?:NdNumericArray2d) => Rectangle
    public Line:new(id:string, path?:NdPath) => Line
    public Text:new(id:string, str?:string) => Text
    public Group:new(id:string, children?:GroupChildren) => Group
    public Circle:new(id:string, radius?:number) => Circle

    constructor(canvas: HTMLCanvasElement | string) {
        const TickerSrv = new Ticker()
        const CanvasSrv = new Canvas(TickerSrv)
        const TreeSrv = new Nodes(CanvasSrv)
        const MouseSrv = new Mouse(CanvasSrv, TickerSrv, TreeSrv)
        const app = this
        CanvasSrv.element(canvas)
        this.Ticker = TickerSrv
        this.Canvas = CanvasSrv
        this.Mouse = MouseSrv
        this.Tree = TreeSrv

        //Ceating Root Group
        new Group('NODE_TREE_DEFAULT_ROOT', this)

        this.Text = class NodasText extends Text {
            constructor(id:string, str?:string) {
                super(id,app);
                if(str) this.style('str', str)
            }
        }
        this.Area = class NodasArea extends Area {
            constructor(id:string, path?:NdPath) {
                super(id, app);
                if(path) this.style('path', path)
            }
        }
        this.Rectangle = class NodasRectangle extends Rectangle{
            constructor(id:string, size?:NdNumericArray2d) {
                super(id,app);
                if(size) this.style('size', size)
            }
        }
        this.Line = class NodasLine extends Line {
            constructor(id:string, path?:NdPath) {
                super(id, app);
                if(path) this.style('path', path)
            }
        }
        this.Sprite = class NodasSprite extends Sprite {
            constructor(id:string, url?:NdURLStr | NdUrlSpriteStr) {
                super(id, app);
                if(url) this.style('src', url)
            }
        }
        this.Circle = class NodasCircle extends Circle {
            constructor(id:string, radius?:number) {
                super(id, app);
                if(radius) this.style('radius', radius)
            }
        }
        this.Group = class NodasGroup extends Group {
            constructor(id:string, children?:GroupChildren) {
                super(id, app);
                if (children) this.append(children)
            }
        }

    }
}
export const Fonts: typeof NodasFonts = NodasFonts
export const Resources: typeof NodasResources = NodasResources
export const NodasImage = NdImage
export const NodasSprite = NdSprite