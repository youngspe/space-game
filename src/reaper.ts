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
    public killEntity(entity: Entity, killer?: Entity): void {
        entity.isDead = true;
        this._toKill.add(entity);
        this.entityKilled.emit({ entity: entity, killer: killer });
    }
    
    /**
     * Removes dead entities.
     */
    public reap(): void {
        for (let e of this._toKill) {
            if (e.isDead) {
                this.deps.entities.removeEntity(e);
            }
        }
        this._toKill.clear();
    }
    
    /**
     * Occurs when an entity is killed.
     */
    public entityKilled = new Event<Reaper.EntityKilledArgs, void>();

    private _toKill = new Set<Entity>();
}

export module Reaper {
    export class Dependencies extends System.Dependencies {
        entities: EntityContainer<Entity> = null;
    }

    export interface EntityKilledArgs {
        entity: Entity,
        killer: Entity,
    }
}