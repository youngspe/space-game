'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Event }            from './event';
import { System }           from './system';

export class Reaper implements System {
    public deps = new Reaper.Dependencies();
    
    public init() { }
    
    /**
     * Marks an entity as dead.
     * The entity will be removed when reap() is called.
     * @param entity The entity to kill.
     */
    public killEntity(entity: Entity): void {
        entity.isDead = true;
        this._toKill.add(entity);
        this.entityKilled.emit(entity);
    }
    
    /**
     * Removes dead entities.
     */
    public reap(): void {
        for (let e of this._toKill) {
            this.deps.entities.removeEntity(e);
        }
        this._toKill.clear();
    }
    
    public entityKilled = new Event<Entity, void>();

    private _toKill = new Set<Entity>();
}

export module Reaper {
    export class Dependencies extends System.Dependencies {
        entities: EntityContainer<Entity> = null;
    }
}