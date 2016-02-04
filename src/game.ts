'use strict';
import { BulletController }     from './bulletController';
import { EnemyController }      from './enemyController';
import { Entity }               from './entity';
import { EntityContainer }      from './entityContainer';
import { Event }                from './event';
import { Hud }                  from './hud';
import { Input }                from './input';
import { Physics }              from './physics';
import { ParticleController }   from './particleController';
import { PlayerController }     from './playerController';
import { Renderer }             from './renderer';
import { ShipController }       from './shipController';

export class BaseGame<E extends { id?: number }> {
    public entities = new EntityContainer<E>();
    
    private _nextId = 0;
}

export class Game extends BaseGame<Entity> {
    public physics = new Physics(this.entities);
    public renderer = new Renderer(this.entities);
    public playerController = new PlayerController(this.entities);
    public shipController = new ShipController(this.entities);
    public enemyController = new EnemyController(this.entities);
    public bulletController = new BulletController(this.entities);
    public particleControler = new ParticleController(this.entities);
    public hud = new Hud(this.entities);
    public input = new Input();
    
    public step(elapsedMs: number) {
        this.playerController.step(elapsedMs, this.input);
        this.enemyController.step(elapsedMs, this.playerController.player);
        this.shipController.step(elapsedMs);
        this.bulletController.step(elapsedMs, this.physics.intersections);
        this.particleControler.step(elapsedMs);
        this.physics.step(elapsedMs);
        this.hud.step(this.input);
        this.input.postStep();
    }
}