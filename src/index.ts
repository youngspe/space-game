/// <reference path="../typings/node/node.d.ts" />
'use strict';
import { Entity }   from './entity';
import { Game }     from './game';
import { Key }      from './input';

let mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;

let game = new Game();
game.renderer.setCanvas(mainCanvas);

let lastStepTime = performance.now();
setTimeout(function step() {
    try {
        let stepTime = performance.now();
        game.step(stepTime - lastStepTime);
        lastStepTime = stepTime;
    } catch (err) {
        console.log(err);
    }
    setTimeout(step, 30);
}, 30);

game.addEntity({
    physics: {
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: 1,
        drag: 1,
        theta: 0,
        omega: 0,
    },
    render: {
        color: 'blue',
        shape: 'hexagon',
    },
    player: {},
    ship: {
        accel: 600,
    },
});

game.addEntity({
    physics: {
        position: { x: 10, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: 1,
        drag: 1,
        theta: 0,
        omega: 0,
    },
    render: {
        color: 'green',
        shape: 'circle',
    },
    enemy: {},
    ship: {
        accel: 200,
    },
});

let keyMap: { [s: string]: Key } = {
    81: Key.UpLeft,         // Q
    87: Key.Up,             // W
    69: Key.UpRight,        // E
    65: Key.DownLeft,       // A
    83: Key.Down,           // S
    68: Key.DownRight,      // D
}

document.addEventListener('keydown', (e: any) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.input.keyDown(key);
    }
});

document.addEventListener('keyup', (e: any) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.input.keyUp(key);
    }
});

let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.renderer.render(renderTime - lastRenderTime);

    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});