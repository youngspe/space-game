'use strict';
import { BulletComponent }      from './bulletController';
import { EnemyComponent }       from './enemies';
import { GunnerComponent }      from './gunnerController';
import { HealthComponent }      from './healthController';
import { ParticleComponent }    from './particleController';
import { PhysicsComponent }     from './physics';
import { PlayerComponent }      from './playerController';
import { Point }                from './geo';
import { RenderComponent }      from './renderer';
import { ShipComponent }        from './shipController';

export interface Entity {
    id?: number;
    
    render?: RenderComponent;
    
    position?: Point;
    
    physics?: PhysicsComponent;
    
    player?: PlayerComponent;
    
    ship?: ShipComponent;
    
    enemy?: EnemyComponent;
    
    bullet?: BulletComponent;
    
    particle?: ParticleComponent;
    
    health?: HealthComponent;
    
    gunner?: GunnerComponent;
    
    scoring?: {
        value: number,
    };
    
    isDead?: boolean;
}