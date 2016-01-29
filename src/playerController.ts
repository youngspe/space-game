'use strict';
import { Entity }               from './entity';
import { Game }                 from './game';
import { GeoPoint }             from './geo';
import { SIN_30, COS_30 }       from './geo';
import { Input, Key, KeyState } from './input';


export class PlayerController {
    public constructor(game: Game) {
        game.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        })
    }

    public step(elapsedMs: number, input: Input) {
        let phys = this.player.physics;
        let seconds = elapsedMs / 1000;
        let accel = 600; // 1 unit/s^2
        let dvAmount = accel * seconds;

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
            return;
        }
        dvx *= dvAmount / len;
        dvy *= dvAmount / len;

        phys.velocity.x += dvx;
        phys.velocity.y += dvy;
    }

    public player: Entity;
}