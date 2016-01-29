'use strict';
import { Entity }   from './entity';
import { Game }     from './game';

const worldDrag = 8;
export class Physics {
    public constructor(game: Game) {
        game.entityAdded.listen(e => { if (e.physics) this._entities.add(e); });
        game.entityRemoved.listen(e => { this._entities.delete(e); });
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        for (let entity of this._entities) {
            let phys = entity.physics;
            let pos = phys.position;
            let vel = phys.velocity;
            pos.x += vel.x * seconds;
            pos.y += vel.y * seconds;
            
            let dragCoeff = Math.pow(Math.E, -worldDrag * phys.drag * seconds);
            vel.x *= dragCoeff;
            vel.y *= dragCoeff;
            
            phys.theta += phys.omega * seconds;
        }
    }

    private _entities = new Set<Entity>();
}