'use strict';
import { EnemyComponent }   from './enemyController';
import { EnemyController }  from './enemyController';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { geo, Point }       from './geo';
import { System }           from './system';

const WAVE_PERIOD = 3;
const GEN_RADIUS = 200;

export class WaveGenerator implements System {
    public deps = new WaveGenerator.Dependencies();

    public constructor(entities: EntityContainer<Entity>) {
        this._entities = entities;
        this.reset();
    }

    public init() { }

    public reset() {
        this._waveTime = WAVE_PERIOD;
    }

    public step(elapsedMs: number, enemies: Set<Entity>) {
        let seconds = elapsedMs / 1000;
        if (this._waveTime < 0) {
            if (enemies.size <= 10) {
                this.generateWave();
            }

            this._waveTime += WAVE_PERIOD;
        }

        this._waveTime -= seconds;
    }

    private generateWave() {
        let followers = 12;
        let tanks = 2;
        let seekers = 8;


        for (let i = 0; i < followers; ++i) {
            let p = geo.math.randCircle(Point.zero(), GEN_RADIUS);
            this._entities.addEntity(EnemyComponent.createFollower(
                p, Point.zero()
            ));
        }

        for (let i = 0; i < tanks; ++i) {
            let p = geo.math.randCircle(Point.zero(), GEN_RADIUS);
            this._entities.addEntity(EnemyComponent.createTank(
                p, Point.zero()
            ));
        }

        for (let i = 0; i < seekers; ++i) {
            let p = geo.math.randCircle(Point.zero(), GEN_RADIUS);
            this._entities.addEntity(EnemyComponent.createSeeker(
                p, Point.zero()
            ));
        }
    }

    private _waveTime: number;
    private _entities: EntityContainer<Entity>;
}

export module WaveGenerator {
    export class Dependencies extends System.Dependencies {
        enemyController: EnemyController;
    }
}