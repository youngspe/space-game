'use strict';
import { BulletComponent }      from './bulletController';
import { Entity }               from './entity';
import { EntityContainer }      from './entityContainer';
import { GunnerController }     from './gunnerController';
import { Point }                from './geo';
import { SIN_30, COS_30 }       from './geo';
import { DamageGroup }          from './healthController';
import { Input, Key, KeyState } from './input';
import { Reaper }               from './reaper';
import { System }               from './system';

const X = 0; const Y = 1;

export interface PlayerComponent { }

export class PlayerController implements System {
    public deps = new PlayerController.Dependencies();

    public init() {
        this.deps.entities.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        });
        this.deps.entities.entityRemoved.listen(e => {
            if (e == this.player) {
                this.player = null;
            }
        });

        this.deps.reaper.entityKilled.listen(args => {
            if (args.killer.player && args.entity.scoring) {
                this.score += args.entity.scoring.value;
            }
        });
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        if (this.player == null) {
            return;
        }

        let dvx = 0;
        let dvy = 0;

        if (KeyState.isDown(this.deps.input.getKey(Key.Up))) dvy -= 1;
        if (KeyState.isDown(this.deps.input.getKey(Key.Down))) dvy += 1;

        if (KeyState.isDown(this.deps.input.getKey(Key.UpLeft))) { dvx -= COS_30; dvy -= SIN_30; }
        if (KeyState.isDown(this.deps.input.getKey(Key.UpRight))) { dvx += COS_30; dvy -= SIN_30; }

        if (KeyState.isDown(this.deps.input.getKey(Key.DownLeft))) { dvx -= COS_30; dvy += SIN_30; }
        if (KeyState.isDown(this.deps.input.getKey(Key.DownRight))) { dvx += COS_30; dvy += SIN_30; }

        let len = Math.sqrt(dvx ** 2 + dvy ** 2);
        if (len <= 0.05) {
            // either zero or there's a rounding error.
            this.player.ship.direction = null;
        } else {
            dvx /= len;
            dvy /= len;
            this.player.ship.direction = [dvx, dvy];
        }
        
        // Bullets:
        if (KeyState.isDown(this.deps.input.getKey(Key.Fire))) {
            let normal = Point.normalize(
                Point.subtract(this.deps.input.cursor, this.player.position)
            );
            this.player.gunner.direction = normal;
        } else {
            this.player.gunner.direction = null;
        }

        if (this._bulletTimeLeft > 0) {
            this._bulletTimeLeft -= seconds;
        }
    }

    public player: Entity = null;
    public score = 0;

    private _bulletTimeLeft = 0;
}

export module PlayerController {
    export class Dependencies extends System.Dependencies {
        input: Input = null;
        reaper: Reaper = null;
        entities: EntityContainer<Entity> = null;
    }
}