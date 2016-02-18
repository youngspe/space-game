/// <reference path="../typings/node/node.d.ts" />
'use strict';
import { EnemyComponent }   from './enemyController';
import { Entity }           from './entity';
import { Game }             from './game';
import { Point }            from './geo';
import * as hud             from './hud';
import { Key }              from './input';

let mainCanvas = document.querySelector('#mainCanvas') as HTMLCanvasElement;

let game = new Game();

game.init();

game.systems.renderer.setCanvas(mainCanvas);

class ElementBinding implements hud.HudDisplayBinding {
    public constructor(element: Element, attribute?: string) {
        attribute = attribute || 'innerText';
        this.element = element as HTMLElement;
        this.attribute = attribute;
    }

    public setValue(value: string) {
        (this.element as { [s: string]: any })[this.attribute] = value;
    }

    public attribute: string;
    public element: HTMLElement;
}

var hudDisplayController: hud.HudDisplayController = {
    score: new ElementBinding(document.querySelector('#hud_score')),
}

game.systems.hud.setDisplayController(hudDisplayController);

let lastStepTime = performance.now();
let timescale = 1;

setTimeout(function step() {
    try {
        let stepTime = performance.now();
        game.step((stepTime - lastStepTime) * timescale);
        lastStepTime = stepTime;
    } catch (err) {
        console.log(err);
    }
    setTimeout(step, 30);
}, 30);

game.systems.entities.addEntity({
    position: [0, 0],
    physics: {
        velocity: [0, 0],
        radius: 1,
        drag: 2,
        theta: 0,
        omega: 0,
        mass: 1,
        bounce: 0.96,
        collide: true,
    },
    render: {
        color: '#00A0FF',
        alpha: 1,
        shape: 'hexagon',
        radius: 1.2,
        lineWidth: 0.25,
        maxBlur: 3,
        glow: 1,
    },
    player: {
        score: 0,
    },
    ship: {
        accel: 600,
        exhaust: {
            rate: 80,
            mass: 0.6,
            radius: 0.3,
        },
    },
    health: {
        hp: 10,
        maxHp: 10,
    },
});

let keyMap: { [i: number]: Key } = {
    81: Key.UpLeft,         // Q
    87: Key.Up,             // W
    69: Key.UpRight,        // E
    65: Key.DownLeft,       // A
    83: Key.Down,           // S
    68: Key.DownRight,      // D
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.systems.input.keyDown(key);
    }
});

window.addEventListener('keyup', (e: KeyboardEvent) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.systems.input.keyUp(key);
    }
});

window.addEventListener('mousemove', (e: MouseEvent) => {
    let rect = mainCanvas.getBoundingClientRect();
    let p: Point = [
        e.clientX - rect.left,
        e.clientY - rect.top,
    ];
    game.systems.input.cursor = game.systems.renderer.screenToWorld(p);
});

window.addEventListener('mousedown', (e: MouseEvent) => {
    game.systems.input.keyDown(Key.Fire);
});

window.addEventListener('mouseup', (e: MouseEvent) => {
    game.systems.input.keyUp(Key.Fire);
});

let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.systems.renderer.render(renderTime - lastRenderTime);

    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});
