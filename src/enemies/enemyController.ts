'use strict';
import { Entity }           from '../entity';
import { EntityContainer }  from '../entityContainer';
import { Game }             from '../game';
import { Point }            from '../geo';
import { PlayerController } from '../playerController';
import { System }           from '../system';

import { EnemyBehavior }   from './enemyBehavior';
import { EnemyComponent }   from './enemyComponent';

const X = 0; const Y = 1;

export class EnemyController implements System {
    public deps = new EnemyController.Dependencies();

    public init() {
        this.deps.entities.entityAdded.listen(e => { if (e.enemy) this.enemies.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this.enemies.delete(e); });
    }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;

        let player = this.deps.playerController.player;

        for (let e of this.enemies) {
            if (e.isDead) {
                continue;
            }

            EnemyBehavior.getBehaviorFunction(e.enemy.mode)(e, this);
        }
    }

    public enemies = new Set<Entity>();
}

export module EnemyController {
    export class Dependencies extends System.Dependencies {
        playerController: PlayerController = null;
        entities: EntityContainer<Entity> = null;
    }
}