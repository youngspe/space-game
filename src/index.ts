/// <reference path="../typings/node/node.d.ts" />
'use strict';
import { Entity }   from './entity';
import { Game }     from './game';
import { Key }      from './input';

let mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;

let game = new Game();
game.renderer.setCanvas(mainCanvas);

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

game.entities.addEntity({
    position: { x: 0, y: 0 },
    physics: {
        velocity: { x: 0, y: 0 },
        radius: 1,
        drag: 1,
        theta: 0,
        omega: 0,
        mass: 1,
        bounce: 0.96,
    },
    render: {
        color: '#00A0FF',
        alpha: 1,
        shape: 'hexagon',
        radius: 1.2,
        lineWidth: 0.25,
    },
    player: {},
    ship: {
        accel: 600,
        hp: 10,
        maxHp: 10,
    },
});

game.entities.addEntity({
    position: { x: 10, y: 0 },
    physics: {
        velocity: { x: 0, y: 0 },
        radius: 1,
        drag: 0.25,
        theta: 0,
        omega: 0,
        mass: 1,
        bounce: 0.96,
    },
    render: {
        color: '#FF8000',
        alpha: 1,
        shape: 'circle',
        radius: 1,
        lineWidth: 0.5,
    },
    enemy: {},
    ship: {
        accel: 200,
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
        game.input.keyDown(key);
    }
});

window.addEventListener('keyup', (e: KeyboardEvent) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.input.keyUp(key);
    }
});

window.addEventListener('mousemove', (e: MouseEvent) => {
    let rect = mainCanvas.getBoundingClientRect();
    let p = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    game.input.cursor = game.renderer.screenToWorld(p);
});

window.addEventListener('mousedown', (e: MouseEvent) => {
    game.input.keyDown(Key.Fire);
});

window.addEventListener('mouseup', (e: MouseEvent) => {
    game.input.keyUp(Key.Fire);
});

let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.renderer.render(renderTime - lastRenderTime);

    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});
