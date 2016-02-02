'use strict';
import { Entity }               from './entity';
import { EntityContainer }      from './entityContainer';
import { Game }                 from './game';
import { Point }                from './geo';
import { SIN_30, COS_30 }       from './geo';
import { Input, Key, KeyState } from './input';


export class PlayerController {
    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        })
    }

    public step(elapsedMs: number, input: Input) {
        if (this.player == null) {
            return;
        }

        let dvx = 0;
        let dvy = 0;

        if (KeyState.isDown(input.getKey(Key.Up))) dvy -= 1;
        if (KeyState.isDown(input.getKey(Key.Down))) dvy += 1;

        if (KeyState.isDown(input.getKey(Key.UpLeft))) { dvx -= COS_30; dvy -= SIN_30; }
        if (KeyState.isDown(input.getKey(Key.UpRight))) { dvx += COS_30; dvy -= SIN_30; }

        if (KeyState.isDown(input.getKey(Key.DownLeft))) { dvx -= COS_30; dvy += SIN_30; }
        if (KeyState.isDown(input.getKey(Key.DownRight))) { dvx += COS_30; dvy += SIN_30; }

        let len = Math.sqrt(dvx ** 2 + dvy ** 2);
        if (len <= 0.05) {
            // either zero or there's a rounding error.
            this.player.ship.direction = null;
            return;
        }
        dvx /= len;
        dvy /= len;

        this.player.ship.direction = { x: dvx, y: dvy };
    }

    public player: Entity = null;
}