'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Input }            from './input';

export class Hud {
    public constructor(entities: EntityContainer<Entity>) {
        this._cursorDisplay = {
            position: { x: 0, y: 0 },
            render: {
                color: '#808080',
                alpha: 0.3,
                radius: 3,
                shape: 'hexagon',
                lineWidth: 0.125,
            },
        };
        entities.addEntity(this._cursorDisplay);
    }
    
    public step(input: Input) {
        if (input.cursor) {
            this._cursorDisplay.position = { x: input.cursor.x, y: input.cursor.y };
        }
    }
    
    private _cursorDisplay: Entity;
}