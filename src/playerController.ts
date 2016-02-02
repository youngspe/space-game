'use strict';
import { Bullet }               from './bullet';
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
        this._entities = entities;
    }

    public step(elapsedMs: number, input: Input) {
        let seconds = elapsedMs / 1000;
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
        } else {
            dvx /= len;
            dvy /= len;
        }

        this.player.ship.direction = { x: dvx, y: dvy };
        
        // Bullets:
        if (this._bulletTimeLeft <= 0 && KeyState.isDown(input.getKey(Key.Fire))) {
            let normal = Point.subtract(input.cursor, this.player.position);
            let len = Point.length(normal);
            normal.x /= len; normal.y /= len;
            
            let newPos = Point.clone(this.player.position);
            newPos.x += normal.x * this.player.physics.radius * 1.5;
            newPos.y += normal.y * this.player.physics.radius * 1.5;
            
            let newVel = Point.clone(this.player.physics.velocity);
            newVel.x += normal.x * 200;
            newVel.y += normal.y * 200;
            
            let newBullet = Bullet.create(newPos, newVel);
            this._entities.addEntity(newBullet);
            
            this._bulletTimeLeft += this.bulletTime;
        }
        
        if (this._bulletTimeLeft > 0) {
            this._bulletTimeLeft -= seconds;
        }
    }

    public player: Entity = null;
    public bulletTime = 0.1;
    
    private _bulletTimeLeft = 0;
    private _entities: EntityContainer<Entity>;
}