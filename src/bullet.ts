import { Point } from './geo';

export interface Bullet {
    position: Point;
    velocity: Point;
    damage: number;
    isDead?: boolean;
}