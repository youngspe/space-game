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
import { System }               from './system';
import { WaveGenerator }        from './waveGenerator';

export abstract class BaseGame<E extends { id?: number }> {
    public systems: BaseGame.Systems;
    
    public init() {
        System.initSystems(this.systems);
    }
}

export module BaseGame {
    export class Systems extends System.Dependencies {
        public entities = new EntityContainer();
    }
}

export class Game extends BaseGame<Entity> {
    public systems = new Game.Systems();
    
    public input = new Input();
    
    public step(elapsedMs: number) {
        this.systems.waveGenerator.step(elapsedMs, this.systems.enemyController.enemies);

        this.systems.playerController.step(elapsedMs, this.input);
        this.systems.enemyController.step(elapsedMs, this.systems.playerController.player);
        this.systems.shipController.step(elapsedMs);
        this.systems.bulletController.step(elapsedMs, this.systems.physics.intersections);
        this.systems.particleControler.step(elapsedMs);

        this.systems.entities.reap();
        this.systems.physics.step(elapsedMs);
        this.systems.hud.step(this.systems.playerController.player, this.input);

        this.input.postStep();
    }
}

export module Game {
    export class Systems extends BaseGame.Systems {
        public physics = new Physics();
        public renderer = new Renderer();
        public playerController = new PlayerController();
        public shipController = new ShipController();
        public enemyController = new EnemyController();
        public bulletController = new BulletController();
        public particleControler = new ParticleController();
        public waveGenerator = new WaveGenerator();
        public hud = new Hud();
    }
}