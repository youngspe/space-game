'use strict';
import { Entity }               from './entity';
import { EntityContainer }      from './entityContainer';
import { Game }                 from './game';
import { Point }                from './geo';
import { ParticleComponent }    from './particleController';

export interface ShipComponent {
    direction?: Point;
    accel: number;
    hp: number;
    maxHp: number;
    exhaust?: {
        rate: number,
        mass: number,
        radius: number,
    };
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
                continue;
            }
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction.x * dvAmount;
                let dvy = e.ship.direction.y * dvAmount;

                e.physics.velocity.x += dvx;
                e.physics.velocity.y += dvy;
                
                // exhaust:
                if (e.ship.exhaust) {
                    let exhaust = e.ship.exhaust;
                    let probableAmount = exhaust.rate * seconds;
                    let actualAmount: number;
                    if (probableAmount < 1) {
                        actualAmount = Math.random() < probableAmount ? 1 : 0;
                    } else {
                        actualAmount = Math.ceil(Math.random() * probableAmount * 2);
                    }

                    let pSpeed = e.ship.accel * e.physics.mass / exhaust.mass / exhaust.rate;

                    for (let i = 0; i < actualAmount; ++i) {
                        let speedFactor = Math.random() * 0.5 + 0.75;
                        let pvx = (e.ship.direction.x * -pSpeed * speedFactor) + e.physics.velocity.x;
                        let pvy = (e.ship.direction.y * -pSpeed * speedFactor) + e.physics.velocity.y;

                        let px = e.position.x - e.ship.direction.x * e.physics.radius * 1.2;
                        let py = e.position.y - e.ship.direction.y * e.physics.radius * 1.2;

                        this._entities.addEntity(ParticleComponent.createParticle(
                            { x: px, y: py },
                            { x: pvx, y: pvy },
                            e.render.color,
                            exhaust.mass,
                            exhaust.radius,
                            0.3
                        ));
                    }
                }
            }
        }
    }

    private _entities: EntityContainer<Entity>;
    private _ships = new Set<Entity>();
}