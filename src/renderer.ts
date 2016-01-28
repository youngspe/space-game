'use strict';
import { Entity }   from './entity'
import { Game }     from './game';
import { Point }    from './geo';

class Style {
    fill: string;
    stroke: string;
    lineWidth: number;
}

const VIEW_HEIGHT = 100;

export class Renderer {
    public constructor(game: Game) {
        game.entityAdded.listen(e => { if (e.physics && e.render) this._entities.add(e); });
        game.entityRemoved.listen(e => { this._entities.delete(e); })
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this._context = canvas.getContext('2d');
    }

    public render(elapsedMs: number) {
        let ctx = this._context;
        let canvas = ctx.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.setTransform();

        for (let entity of this._entities) {
            this.drawCircle(
                entity.physics.position,
                entity.physics.radius,
                { fill: 'transparent', stroke: entity.render.color, lineWidth: 0.5 }
            );
        }
    }

    private setTransform() {
        let ctx = this._context;
        let scale = this.camera.zoom * ctx.canvas.height / VIEW_HEIGHT;

        let dx = -this.camera.pos.x * scale + ctx.canvas.width / 2;
        let dy = -this.camera.pos.y * scale + ctx.canvas.height / 2;

        ctx.setTransform(scale, 0, 0, scale, dx, dy);
    }

    private drawCircle(center: Point, radius: number, style: Style) {
        let ctx = this._context;
        this.setStyle(style);
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    private setStyle(style: Style) {
        let ctx = this._context;
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.lineWidth;
    }

    public camera = { pos: { x: 0, y: 0 }, zoom: 1 };

    private _context: CanvasRenderingContext2D;
    private _entities = new Set<Entity>();
}
