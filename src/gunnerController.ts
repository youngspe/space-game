'use strict';
import { BulletComponent }  from './bulletController';
import { BulletController } from './bulletController';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Point }            from './geo';
import { DamageGroup }      from './healthController';
import { System }           from './system';

const X = 0; const Y = 1;

export class GunnerComponent {
    rate: number;
    direction: Point;
    timeLeft: number;
    damage: number;
    damageGroup: DamageGroup;
    bulletSpeed: number;
}

const BULLET_LIFESPAN = 4;

export class GunnerController implements System {
    public deps = new BulletController.Dependencies();

    public init() {
        this.deps.entities.entityAdded.listen(e => { if (e.gunner) this._gunners.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._gunners.delete(e); });
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;

        for (let e of this._gunners) {
            if (e.gunner.direction && e.gunner.timeLeft <= 0) {

                let pos = e.position;
                let dir = e.gunner.direction;

                let vel: Point = [0, 0];
                let rad = 0;

                if (e.physics) {
                    vel = e.physics.velocity;
                    rad = e.physics.radius;
                }

                let newPos = Point.clone(pos);
                newPos[X] += dir[X] * rad * 1.5;
                newPos[Y] += dir[Y] * rad * 1.5;

                let newVel = Point.clone(vel);
                newVel[X] += dir[X] * e.gunner.bulletSpeed;
                newVel[Y] += dir[Y] * e.gunner.bulletSpeed;

                e.gunner.timeLeft = 1 / e.gunner.rate;
                this.deps.entities.addEntity(
                    BulletComponent.createBullet({
                        damage: e.gunner.damage,
                        damageGroup: e.gunner.damageGroup,
                        pos: newPos,
                        vel: newVel,
                        source: e,
                        lifespan: BULLET_LIFESPAN,
                    })
                );
            }

            e.gunner.timeLeft = Math.max(0, e.gunner.timeLeft - seconds);
        }
    }

    private _gunners = new Set<Entity>();
}

export module GunnerController {
    export class Dependencies extends System.Dependencies {
        entities: EntityContainer<Entity> = null;
        bulletController: BulletController = null;
    }
}