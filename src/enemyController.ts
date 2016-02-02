'use strict';
import { Entity }   from './entity';
import { Game }     from './game';
import { Point }    from './geo';

export class EnemyController {
    public constructor(game: Game) {
        game.entityAdded.listen(e => { if (e.enemy) this._entities.add(e); });
        game.entityRemoved.listen(e => { this._entities.delete(e); });
    }

    public step(elapsedMs: number, player: Entity) {
        let seconds = elapsedMs / 1000;
        for (let e of this._entities) {
            let dif = Point.subtract(player.position, e.position);
            let len = Point.length(dif);
            dif.x /= len;
            dif.y /= len;
            e.ship.direction = dif;
        }
    }

    private _entities = new Set<Entity>();
}