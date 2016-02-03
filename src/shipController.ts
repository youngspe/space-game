'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';

export interface ShipComponent {
    direction?: Point;
    accel: number;
    hp: number;
    maxHp: number;
}

export class ShipController {
    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => { if (e.ship) this._ships.add(e); });
        entities.entityRemoved.listen(e => { this._ships.delete(e); });
        this._entities = entities;
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        for (let e of this._ships) {
            if (e.ship.hp <= 0) {
                this._entities.removeEntity(e);
            }
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction.x * dvAmount;
                let dvy = e.ship.direction.y * dvAmount;

                e.physics.velocity.x += dvx;
                e.physics.velocity.y += dvy;
            }
        }
    }

    private _entities: EntityContainer<Entity>;
    private _ships = new Set<Entity>();
}