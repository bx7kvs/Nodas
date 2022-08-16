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
import {GroupChildren, NdNodeGetter} from './Nodas/Nodes/@types/types.js';
import Text from './Nodas/Nodes/Text';
import NodasFonts from './Nodas/Services/NodasFonts';

export default class Nodas {
    readonly Ticker = new Ticker()
    readonly Canvas: Canvas
    readonly Tree: Nodes
    readonly Mouse: Mouse
    protected readonly Config = new Config()
    public readonly area: NdNodeGetter<Area>
    public readonly rect: NdNodeGetter<Rectangle>
    public readonly text: NdNodeGetter<Text>
    public readonly sprite: NdNodeGetter<Sprite>
    public readonly circle: NdNodeGetter<Circle>
    public readonly line: NdNodeGetter<Line>
    public readonly group: (id: string, children?: GroupChildren) => Group

    constructor(canvas: HTMLCanvasElement | string) {
        const TickerSrv = new Ticker()
        const CanvasSrv = new Canvas(TickerSrv)
        const TreeSrv = new Nodes(CanvasSrv)
        const MouseSrv = new Mouse(CanvasSrv, TickerSrv, TreeSrv)
        CanvasSrv.element(canvas)
        this.Ticker = TickerSrv
        this.Canvas = CanvasSrv
        this.Mouse = MouseSrv
        this.Tree = TreeSrv

        //Ceating Root Group
        new Group('NODE_TREE_DEFAULT_ROOT', this)

        this.area = (id) => new Area(id, this)
        this.circle = (id) => new Circle(id, this)
        this.rect = (id) => new Rectangle(id,this)
        this.line = (id) => new Line(id,this)
        this.sprite = (id) => new Sprite(id,this)
        this.text = (id) => new Text(id,this)
        this.group = (id: string, children?: GroupChildren) => {
            const group = new Group(id, this)
            if (children) group.append(children)
            return group
        }

    }
}
export const Fonts: typeof NodasFonts = NodasFonts