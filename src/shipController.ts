'use strict';
import { Entity }               from './entity';
import { EntityContainer }      from './entityContainer';
import { Game }                 from './game';
import { Point }                from './geo';
import { ParticleComponent }    from './particleController';
import { System }               from './system';

const X = 0; const Y = 1;

export interface ShipComponent {
    direction?: Point;
    accel: number;
    exhaust?: {
        rate: number,
        mass: number,
        radius: number,
    };
}

export class ShipController implements System {
    public deps = new ShipController.Dependencies();

    public init() {
        this.deps.entities.entityAdded.listen(e => { if (e.ship) this._ships.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._ships.delete(e); });
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        for (let e of this._ships) {
            if (e.isDead) {
                continue;
            }
            
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction[X] * dvAmount;
                let dvy = e.ship.direction[Y] * dvAmount;

                e.physics.velocity[X] += dvx;
                e.physics.velocity[Y] += dvy;
                
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
                        let pvx = (e.ship.direction[X] * -pSpeed * speedFactor) + e.physics.velocity[X];
                        let pvy = (e.ship.direction[Y] * -pSpeed * speedFactor) + e.physics.velocity[Y];

                        let px = e.position[X] - e.ship.direction[X] * e.physics.radius * 1.2;
                        let py = e.position[Y] - e.ship.direction[Y] * e.physics.radius * 1.2;

                        this.deps.entities.addEntity(ParticleComponent.createParticle(
                            [px, py],
                            [pvx, pvy],
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

    private _ships = new Set<Entity>();
}

export module ShipController {
    export class Dependencies extends System.Dependencies {
        entities: EntityContainer<Entity> = null;
    }
}
