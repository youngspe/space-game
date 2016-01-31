'use strict';
import { Entity }   from './entity';
import { Game }     from './game';

export class ShipController {
    public constructor(game: Game) {
        game.entityAdded.listen(e => { if (e.ship) this._entities.add(e); });
        game.entityRemoved.listen(e => { this._entities.delete(e); });
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        for (let e of this._entities) {
            if (!e.ship.direction) {
                continue;
            }
            
            let dvAmount = e.ship.accel * seconds;
            let dvx = e.ship.direction.x * dvAmount;
            let dvy = e.ship.direction.y * dvAmount;
            
            e.physics.velocity.x += dvx;
            e.physics.velocity.y += dvy;
        }
    }

    private _entities = new Set<Entity>();
}