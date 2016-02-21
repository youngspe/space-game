'use strict';
import { Entity }           from '../entity';
import { EnemyController }  from './enemyController';
import { Point }            from '../geo';
import { Matrix }           from '../geo';
import * as geo             from '../geo';

const X = 0; const Y = 1;

export interface EnemyBehavior {
    mode: EnemyBehavior.Mode,
    data: EnemyBehavior.BehaviorData,
}

export module EnemyBehavior {
    export enum Mode {
        Follow,
        Circle,
    }

    export interface BehaviorData { }

    export interface FollowData extends BehaviorData { }

    export enum CircleDirection {
        Clockwise,
        Counter,
    }

    export interface CircleData extends BehaviorData {
        radius: number,
        direction: CircleDirection,
    }

    export interface BehaviorFunction {
        (entity: Entity, behavior: EnemyBehavior, system: EnemyController): void;
    }

    const circleMatrices: { [i: number]: Matrix } = {
        // -30 degrees
        [CircleDirection.Clockwise]: [
            [geo.COS_30, geo.SIN_30],
            [-geo.SIN_30, geo.COS_30],
        ],
        // 30 degrees
        [CircleDirection.Counter]: [
            [geo.COS_30, -geo.SIN_30],
            [geo.SIN_30, geo.COS_30],
        ],
    }

    const behaviorMap: { [i: number]: BehaviorFunction } = {
        [Mode.Follow]: (e, behavior, sys) => {
            let player = sys.deps.playerController.player;

            if (player) {
                let dir = Point.normalize(
                    Point.subtract(player.position, e.position)
                );

                e.ship.direction = dir;
            } else {
                e.ship.direction = null;
            }
        },

        [Mode.Circle]: (e, behavior, sys) => {
            let player = sys.deps.playerController.player;
            let data = behavior.data as CircleData;

            if (player) {
                // Find the normalized direction from player to enemy
                let normal = Point.normalize(
                    Point.subtract(e.position, player.position)
                );

                let target = Matrix.pointMul(
                    circleMatrices[data.direction],
                    normal
                );

                target[X] = target[X] * data.radius + player.position[X];
                target[Y] = target[Y] * data.radius + player.position[Y];

                let dir = Point.normalize(
                    Point.subtract(target, e.position)
                );

                e.ship.direction = dir;
            } else {
                e.ship.direction = null;
            }
        },
    }

    export function getBehaviorFunction(mode: Mode): BehaviorFunction {
        return behaviorMap[mode];
    }
}
