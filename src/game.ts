'use strict';
import { Entity }           from './entity';
import { Event }            from './event';
import { Input }            from './input';
import { Physics }          from './physics';
import { PlayerController } from './playerController';
import { Renderer }         from './renderer';

export class BaseGame<E extends { id?: number }> {
    public entities = new Set<E>();

    public addEntity(entity: E): void {
        entity.id = ++this._nextId;
        this.entities.add(entity);
        this.entityAdded.emit(entity);
    }

    public removeEntity(entity: E): void {
        this.entities.delete(entity);
        this.entityRemoved.emit(entity)
    }

    public entityAdded = new Event<E, void>();
    public entityRemoved = new Event<E, void>();
    
    private _nextId = 0;
}

export class Game extends BaseGame<Entity> {
    public physics = new Physics(this);
    public renderer = new Renderer(this);
    public playerController = new PlayerController(this);
    public input = new Input();
    
    public step(elapsedMs: number) {
        this.playerController.step(elapsedMs, this.input);
        this.physics.step(elapsedMs);
        this.input.postStep();
    }
}