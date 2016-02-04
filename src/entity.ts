'use strict';
import { BulletComponent }      from './bulletController';
import { EnemyComponent }       from './enemyController';
import { ParticleComponent }    from './particleController';
import { PhysicsComponent }     from './physics';
import { Point }                from './geo';
import { RenderComponent }      from './renderer';
import { ShipComponent }        from './shipController';

export interface Entity {
    id?: number;
    
    render?: RenderComponent;
    
    position?: Point;
    
    physics?: PhysicsComponent;
    
    player?: {};
    
    ship?: ShipComponent;
    
    enemy?: EnemyComponent;
    
    bullet?: BulletComponent;
    
    particle?: ParticleComponent;
}