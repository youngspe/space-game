'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Input }            from './input';

const X = 0; const Y = 1;

export class Hud {
    public constructor(entities: EntityContainer<Entity>) {
        this._cursorDisplay = {
            position: [0, 0],
            render: {
                color: '#808080',
                alpha: 0.3,
                radius: 3,
                shape: 'hexagon',
                lineWidth: 0.125,
                maxBlur: 1,
                glow: 1,
            },
        };
        entities.addEntity(this._cursorDisplay);
    }

    public step(input: Input) {
        if (input.cursor) {
            this._cursorDisplay.position = [input.cursor[X], input.cursor[Y]];
        }
    }

    private _cursorDisplay: Entity;
}