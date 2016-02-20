(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
var BulletComponent;
(function (BulletComponent) {
    function createBullet(pos, vel, damage, lifespan, source) {
        return {
            physics: {
                velocity: vel,
                radius: 0.6,
                bounce: 1,
                drag: 0.125,
                theta: 0,
                omega: 0,
                mass: 0.5,
                collide: true,
            },
            position: pos,
            render: {
                color: '#40A0FF',
                alpha: 1,
                radius: 0.4,
                lineWidth: 0.1,
                shape: 'circle',
                maxBlur: 5,
                glow: 0,
            },
            bullet: {
                damage: damage,
                isAlive: true,
                source: source,
            },
            particle: {
                lifespan: lifespan,
                timeRemaining: lifespan,
                count: false,
            },
        };
    }
    BulletComponent.createBullet = createBullet;
})(BulletComponent = exports.BulletComponent || (exports.BulletComponent = {}));
class BulletController {
    constructor() {
        this.deps = new BulletController.Dependencies();
        this._bullets = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.bullet)
            this._bullets.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._bullets.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        let intersections = this.deps.physics.intersections;
        for (let b of this._bullets) {
            if (b.bullet.isAlive) {
                let inters = intersections.get(b);
                if (inters && inters.length > 0) {
                    for (let i of inters) {
                        let other = i.b;
                        if (other.health) {
                            this.deps.healthController.damageEntity(other, b.bullet.damage, b.bullet.source);
                            b.bullet.isAlive = false;
                            break;
                        }
                    }
                }
            }
            else {
                b.render.color = "#808080";
            }
        }
    }
}
exports.BulletController = BulletController;
(function (BulletController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.physics = null;
            this.entities = null;
            this.healthController = null;
        }
    }
    BulletController.Dependencies = Dependencies;
})(BulletController = exports.BulletController || (exports.BulletController = {}));

},{"./system":17}],2:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
var EnemyComponent;
(function (EnemyComponent) {
    function createFollower(pos, vel) {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 1.2,
                drag: 0.5,
                theta: 0,
                omega: 0,
                mass: 1,
                bounce: 0.96,
                collide: true,
            },
            render: {
                color: '#FF8000',
                alpha: 1,
                shape: 'circle',
                radius: 1.2,
                lineWidth: 0.5,
                maxBlur: 2,
                glow: 0,
            },
            enemy: {},
            ship: {
                accel: 100,
                exhaust: {
                    rate: 3,
                    mass: 1.5,
                    radius: 0.4,
                },
            },
            health: {
                hp: 10,
                maxHp: 10,
            },
            scoring: {
                value: 10,
            },
        };
        return e;
    }
    EnemyComponent.createFollower = createFollower;
    function createTank(pos, vel) {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 3,
                drag: 0.4,
                theta: 0,
                omega: 0,
                mass: 9,
                bounce: 0.96,
                collide: true,
            },
            render: {
                color: '#D00000',
                alpha: 1,
                shape: 'circle',
                radius: 3,
                lineWidth: 0.5,
                maxBlur: 2,
                glow: 1,
            },
            enemy: {},
            ship: {
                accel: 80,
                exhaust: {
                    rate: 4,
                    mass: 4,
                    radius: 0.8,
                },
            },
            health: {
                hp: 30,
                maxHp: 30,
            },
            scoring: {
                value: 20,
            },
        };
        return e;
    }
    EnemyComponent.createTank = createTank;
    function createSeeker(pos, vel) {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 1,
                drag: 0.25,
                theta: 0,
                omega: 0,
                mass: 0.8,
                bounce: 0.96,
                collide: true,
            },
            render: {
                color: '#80FF00',
                alpha: 1,
                shape: 'circle',
                radius: 0.9,
                lineWidth: 0.5,
                maxBlur: 3,
                glow: 0,
            },
            enemy: {},
            ship: {
                accel: 150,
                exhaust: {
                    rate: 5,
                    mass: 1,
                    radius: 0.4,
                },
            },
            health: {
                hp: 5,
                maxHp: 5,
            },
            scoring: {
                value: 5,
            },
        };
        return e;
    }
    EnemyComponent.createSeeker = createSeeker;
})(EnemyComponent = exports.EnemyComponent || (exports.EnemyComponent = {}));
class EnemyController {
    constructor() {
        this.deps = new EnemyController.Dependencies();
        this.enemies = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.enemy)
            this.enemies.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this.enemies.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        let player = this.deps.playerController.player;
        for (let e of this.enemies) {
            if (e.isDead) {
                continue;
            }
            if (player) {
                let dif = geo_1.Point.subtract(player.position, e.position);
                let len = geo_1.Point.length(dif);
                dif[X] /= len;
                dif[Y] /= len;
                e.ship.direction = dif;
            }
            else {
                e.ship.direction = null;
            }
        }
    }
}
exports.EnemyController = EnemyController;
(function (EnemyController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.playerController = null;
            this.entities = null;
        }
    }
    EnemyController.Dependencies = Dependencies;
})(EnemyController = exports.EnemyController || (exports.EnemyController = {}));

},{"./geo":6,"./system":17}],3:[function(require,module,exports){
'use strict';
var event_1 = require('./event');
class EntityContainer {
    constructor() {
        this.deps = {};
        /**
         * Occurs after an entity is added to the container.
         * arg: The entity that was added.
         */
        this.entityAdded = new event_1.Event();
        /**
         * Occurs after an entity is removed from the container.
         * arg: The entity that was removed.
         */
        this.entityRemoved = new event_1.Event();
        this._entities = new Set();
        this._nextId = 0;
        this._index = new Map();
    }
    init() { }
    /**
     * Adds an entity to the container.
     * @param entity The entity to add.
     */
    addEntity(entity) {
        entity.id = ++this._nextId;
        this._entities.add(entity);
        this._index.set(entity.id, entity);
        this.entityAdded.emit(entity);
    }
    /**
     * Removes an entity from the container.
     * @param entity The entity to remove.
     */
    removeEntity(entity) {
        this._entities.delete(entity);
        this._index.delete(entity.id);
        this.entityRemoved.emit(entity);
    }
    /**
     * Retrieves an entity with the given id.
     * @param id The id of the entity to retrieve.
     */
    getById(id) {
        return this._index.get(id);
    }
}
exports.EntityContainer = EntityContainer;

},{"./event":4}],4:[function(require,module,exports){
'use strict';
class Event {
    constructor() {
        this._listeners = [];
    }
    emit(value) {
        return this._listeners.map(l => l(value));
    }
    emitAsync(value) {
        let results = this.emit(value);
        return Promise.all(results.map(v => v && v.then ? v : Promise.resolve(v)));
    }
    listen(listener) {
        this._listeners.push(listener);
    }
}
exports.Event = Event;

},{}],5:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var enemyController_1 = require('./enemyController');
var entityContainer_1 = require('./entityContainer');
var healthController_1 = require('./healthController');
var hud_1 = require('./hud');
var input_1 = require('./input');
var physics_1 = require('./physics');
var particleController_1 = require('./particleController');
var playerController_1 = require('./playerController');
var reaper_1 = require('./reaper');
var renderer_1 = require('./renderer');
var shipController_1 = require('./shipController');
var system_1 = require('./system');
var waveGenerator_1 = require('./waveGenerator');
class BaseGame {
    init() {
        system_1.System.initSystems(this.systems);
    }
}
exports.BaseGame = BaseGame;
(function (BaseGame) {
    class Systems extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = new entityContainer_1.EntityContainer();
        }
    }
    BaseGame.Systems = Systems;
})(BaseGame = exports.BaseGame || (exports.BaseGame = {}));
class Game extends BaseGame {
    constructor(...args) {
        super(...args);
        this.systems = new Game.Systems();
    }
    step(elapsedMs) {
        this.systems.waveGenerator.step(elapsedMs);
        this.systems.playerController.step(elapsedMs);
        this.systems.enemyController.step(elapsedMs);
        this.systems.shipController.step(elapsedMs);
        this.systems.bulletController.step(elapsedMs);
        this.systems.particleControler.step(elapsedMs);
        this.systems.reaper.reap();
        this.systems.physics.step(elapsedMs);
        this.systems.hud.step(elapsedMs);
        this.systems.input.postStep();
    }
}
exports.Game = Game;
(function (Game) {
    class Systems extends BaseGame.Systems {
        constructor(...args) {
            super(...args);
            this.input = new input_1.Input();
            this.physics = new physics_1.Physics();
            this.renderer = new renderer_1.Renderer();
            this.playerController = new playerController_1.PlayerController();
            this.shipController = new shipController_1.ShipController();
            this.enemyController = new enemyController_1.EnemyController();
            this.bulletController = new bulletController_1.BulletController();
            this.particleControler = new particleController_1.ParticleController();
            this.healthController = new healthController_1.HealthController();
            this.waveGenerator = new waveGenerator_1.WaveGenerator();
            this.hud = new hud_1.Hud();
            this.reaper = new reaper_1.Reaper();
        }
    }
    Game.Systems = Systems;
})(Game = exports.Game || (exports.Game = {}));

},{"./bulletController":1,"./enemyController":2,"./entityContainer":3,"./healthController":7,"./hud":8,"./input":10,"./particleController":11,"./physics":12,"./playerController":13,"./reaper":14,"./renderer":15,"./shipController":16,"./system":17,"./waveGenerator":18}],6:[function(require,module,exports){
'use strict';
exports.SIN_30 = 0.5;
exports.COS_30 = 0.86603;
const X = 0;
const Y = 1;
var Point;
(function (Point) {
    function add(...points) {
        let p = [0, 0];
        for (let p1 of points) {
            p[X] += p1[X];
            p[Y] += p1[Y];
        }
        return p;
    }
    Point.add = add;
    function subtract(p1, p2) {
        return [p1[X] - p2[X], p1[Y] - p2[Y]];
    }
    Point.subtract = subtract;
    function length(p) {
        return Math.sqrt(lengthSquared(p));
    }
    Point.length = length;
    function lengthSquared(p) {
        return Math.pow(p[X], 2) + Math.pow(p[Y], 2);
    }
    Point.lengthSquared = lengthSquared;
    function dist(p1, p2) {
        return Math.sqrt(distSquared(p1, p2));
    }
    Point.dist = dist;
    function distSquared(p1, p2) {
        return Math.pow((p1[X] - p2[X]), 2) + Math.pow((p1[Y] - p2[Y]), 2);
    }
    Point.distSquared = distSquared;
    function dot(p1, p2) {
        return p1[X] * p2[X] + p1[Y] * p2[Y];
    }
    Point.dot = dot;
    function clone(p) {
        return [p[X], p[Y]];
    }
    Point.clone = clone;
    function normalize(p) {
        let len = length(p);
        return [p[X] / len, p[Y] / len];
    }
    Point.normalize = normalize;
    function zero() {
        return [0, 0];
    }
    Point.zero = zero;
    function plus(self, p) {
        self[X] += p[X];
        self[Y] += p[Y];
    }
    Point.plus = plus;
})(Point = exports.Point || (exports.Point = {}));
var geo;
(function (geo) {
    var math;
    (function (math) {
        function randBetween(min, max) {
            return Math.random() * (max - min) + min;
        }
        math.randBetween = randBetween;
        function randCircle(center, radius) {
            // Repeat until (x,y) is inside the unit circle.
            while (true) {
                let x = randBetween(-1, 1);
                let y = randBetween(-1, 1);
                if (Math.pow(x, 2) + Math.pow(y, 2) <= 1) {
                    return [
                        x * radius + center[X],
                        y * radius + center[Y],
                    ];
                }
            }
        }
        math.randCircle = randCircle;
        // Approx. using sum of 3 uniform random numbers.
        function randGauss(mean, dev) {
            return (Math.random() + Math.random() + Math.random() - 1.5) * 0.67 * dev + mean;
        }
        math.randGauss = randGauss;
        function randGauss2d(center, dev) {
            return [
                randGauss(center[X], dev),
                randGauss(center[Y], dev),
            ];
        }
        math.randGauss2d = randGauss2d;
        function lerp(min, max, x) {
            return x * (max - min) + min;
        }
        math.lerp = lerp;
        function clamp(min, x, max) {
            return Math.min(Math.max(min, x), max);
        }
        math.clamp = clamp;
    })(math = geo.math || (geo.math = {}));
})(geo = exports.geo || (exports.geo = {}));
exports.default = geo;

},{}],7:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
class HealthController {
    constructor() {
        this.deps = new HealthController.Dependencies();
        this._healthEntities = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.health)
            this._healthEntities.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._healthEntities.delete(e); });
    }
    damageEntity(entity, damage, source) {
        if (entity.health) {
            entity.health.hp -= damage;
            if (entity.health.hp <= 0) {
                this.deps.reaper.killEntity(entity, source);
            }
        }
    }
}
exports.HealthController = HealthController;
(function (HealthController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.reaper = null;
            this.entities = null;
        }
    }
    HealthController.Dependencies = Dependencies;
})(HealthController = exports.HealthController || (exports.HealthController = {}));

},{"./system":17}],8:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class Hud {
    constructor() {
        this.deps = new Hud.Dependencies();
    }
    init() { }
    step(elapsedMs) {
        if (this._cursorDisplay == null) {
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
            this.deps.entities.addEntity(this._cursorDisplay);
        }
        let cursor = this.deps.input.cursor;
        if (cursor) {
            this._cursorDisplay.position = geo_1.Point.clone(cursor);
        }
        if (this._displayController != null) {
            this.displayScore();
        }
    }
    displayScore() {
        let score = this.deps.playerController.score;
        this._displayController.score.setValue(score.toString());
    }
    setDisplayController(hdc) {
        this._displayController = hdc;
    }
}
exports.Hud = Hud;
(function (Hud) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
            this.playerController = null;
            this.input = null;
        }
    }
    Hud.Dependencies = Dependencies;
})(Hud = exports.Hud || (exports.Hud = {}));

},{"./geo":6,"./system":17}],9:[function(require,module,exports){
/// <reference path="../typings/node/node.d.ts" />
'use strict';
var game_1 = require('./game');
var input_1 = require('./input');
let mainCanvas = document.querySelector('#mainCanvas');
let game = new game_1.Game();
game.init();
game.systems.renderer.setCanvas(mainCanvas);
class ElementBinding {
    constructor(element, attribute) {
        attribute = attribute || 'innerText';
        this.element = element;
        this.attribute = attribute;
    }
    setValue(value) {
        this.element[this.attribute] = value;
    }
}
var hudDisplayController = {
    score: new ElementBinding(document.querySelector('#hud_score')),
};
game.systems.hud.setDisplayController(hudDisplayController);
let lastStepTime = performance.now();
let timescale = 1;
setTimeout(function step() {
    try {
        let stepTime = performance.now();
        game.step((stepTime - lastStepTime) * timescale);
        lastStepTime = stepTime;
    }
    catch (err) {
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
let keyMap = {
    81: input_1.Key.UpLeft,
    87: input_1.Key.Up,
    69: input_1.Key.UpRight,
    65: input_1.Key.DownLeft,
    83: input_1.Key.Down,
    68: input_1.Key.DownRight,
};
window.addEventListener('keydown', (e) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.systems.input.keyDown(key);
    }
});
window.addEventListener('keyup', (e) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.systems.input.keyUp(key);
    }
});
window.addEventListener('mousemove', (e) => {
    let rect = mainCanvas.getBoundingClientRect();
    let p = [
        e.clientX - rect.left,
        e.clientY - rect.top,
    ];
    game.systems.input.cursor = game.systems.renderer.screenToWorld(p);
});
window.addEventListener('mousedown', (e) => {
    game.systems.input.keyDown(input_1.Key.Fire);
});
window.addEventListener('mouseup', (e) => {
    game.systems.input.keyUp(input_1.Key.Fire);
});
let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.systems.renderer.render(renderTime - lastRenderTime);
    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});

},{"./game":5,"./input":10}],10:[function(require,module,exports){
'use strict';
(function (Key) {
    Key[Key["UpLeft"] = 0] = "UpLeft";
    Key[Key["Up"] = 1] = "Up";
    Key[Key["UpRight"] = 2] = "UpRight";
    Key[Key["DownLeft"] = 3] = "DownLeft";
    Key[Key["Down"] = 4] = "Down";
    Key[Key["DownRight"] = 5] = "DownRight";
    Key[Key["Fire"] = 6] = "Fire";
})(exports.Key || (exports.Key = {}));
var Key = exports.Key;
(function (KeyState) {
    KeyState[KeyState["Pressing"] = 0] = "Pressing";
    KeyState[KeyState["Down"] = 1] = "Down";
    KeyState[KeyState["Releasing"] = 2] = "Releasing";
    KeyState[KeyState["Up"] = 3] = "Up";
})(exports.KeyState || (exports.KeyState = {}));
var KeyState = exports.KeyState;
var KeyState;
(function (KeyState) {
    function isDown(state) {
        return state < 2;
    }
    KeyState.isDown = isDown;
})(KeyState = exports.KeyState || (exports.KeyState = {}));
class Input {
    constructor() {
        this.deps = {};
        this._toRelease = [];
        let keyCount = Object.keys(Key).length / 2;
        this._keys = new Array(keyCount);
        for (let i = 0; i < keyCount; ++i) {
            this._keys[i] = KeyState.Up;
        }
    }
    init() { }
    getKey(key) {
        return this._keys[key];
    }
    keyDown(key) {
        if (this._keys[key] != KeyState.Down) {
            this._keys[key] = KeyState.Pressing;
        }
    }
    keyUp(key) {
        this._toRelease.push(key);
    }
    postStep() {
        for (let i = 0; i < this._keys.length; ++i) {
            if (this._keys[i] == KeyState.Pressing) {
                this._keys[i] = KeyState.Down;
            }
            else if (this._keys[i] == KeyState.Releasing) {
                this._keys[i] = KeyState.Up;
            }
        }
        for (let key of this._toRelease) {
            if (this._keys[key] != KeyState.Up) {
                this._keys[key] = KeyState.Releasing;
            }
        }
        this._toRelease.length = 0;
    }
}
exports.Input = Input;

},{}],11:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
var ParticleComponent;
(function (ParticleComponent) {
    function createParticle(pos, vel, color, mass, radius, lifespan) {
        return {
            position: pos,
            physics: {
                velocity: vel,
                bounce: 0.96,
                drag: 0.5,
                mass: mass,
                omega: 0,
                theta: 0,
                radius: 0.25,
                collide: false,
            },
            render: {
                alpha: 1,
                color: color,
                lineWidth: 0.1,
                radius: radius,
                shape: 'circle',
                maxBlur: 1,
                glow: 0,
            },
            particle: {
                lifespan: lifespan,
                timeRemaining: lifespan,
                count: true,
            },
        };
    }
    ParticleComponent.createParticle = createParticle;
})(ParticleComponent = exports.ParticleComponent || (exports.ParticleComponent = {}));
class ParticleController {
    constructor() {
        this.deps = new ParticleController.Dependencies();
        this.maxParticles = 200;
        this._particleCount = 0;
        this._particles = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => {
            if (e.particle) {
                this._particles.add(e);
                if (e.particle.count) {
                    ++this._particleCount;
                    if (this._particleCount > this.maxParticles) {
                        let toDelete;
                        for (let e2 of this._particles) {
                            if (e2.particle.count) {
                                toDelete = e2;
                                break;
                            }
                        }
                        if (toDelete) {
                            this.deps.entities.removeEntity(toDelete);
                        }
                    }
                }
            }
        });
        this.deps.entities.entityRemoved.listen(e => {
            if (e.particle) {
                this._particles.delete(e);
                if (e.particle.count) {
                    --this._particleCount;
                }
            }
        });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._particles) {
            if (e.particle.timeRemaining <= 0) {
                this.deps.entities.removeEntity(e);
                continue;
            }
            e.render.alpha = e.particle.timeRemaining / e.particle.lifespan;
            e.particle.timeRemaining -= seconds;
        }
    }
}
exports.ParticleController = ParticleController;
(function (ParticleController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    ParticleController.Dependencies = Dependencies;
})(ParticleController = exports.ParticleController || (exports.ParticleController = {}));

},{"./system":17}],12:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
const WORLD_DRAG = 4;
class Physics {
    constructor() {
        this.deps = new Physics.Dependencies();
        this.iterations = 4;
        this.intersections = new Map();
        this._physObjects = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.physics)
            this._physObjects.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._physObjects.delete(e); });
    }
    step(elapsedMs) {
        this.intersections.clear();
        for (let i = 0; i < this.iterations; ++i) {
            let intersections = this.stepInternal(elapsedMs / this.iterations);
            for (let inter of intersections) {
                this.addIntersection(inter.a, inter.b);
                this.addIntersection(inter.b, inter.a);
            }
        }
    }
    addIntersection(a, b) {
        let inters = this.intersections.get(a);
        if (inters == undefined) {
            inters = [];
            this.intersections.set(a, inters);
        }
        inters.push({ a: a, b: b });
    }
    stepInternal(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let entity of this._physObjects) {
            let phys = entity.physics;
            let pos = entity.position;
            let vel = phys.velocity;
            pos[X] += vel[X] * seconds;
            pos[Y] += vel[Y] * seconds;
            let dragCoeff = Math.pow(Math.E, -WORLD_DRAG * phys.drag * seconds);
            vel[X] *= dragCoeff;
            vel[Y] *= dragCoeff;
            phys.theta += phys.omega * seconds;
        }
        let intersections = this.findIntersections();
        this.correctCollisions(intersections);
        return intersections;
    }
    findIntersections() {
        let intersections = [];
        var list = [];
        {
            for (let e of this._physObjects) {
                if (e.physics.collide) {
                    list.push(e);
                }
            }
        }
        // Sort by leftmost bound of circle.
        list.sort((a, b) => Math.sign((a.position[X] - a.physics.radius) - (b.position[X] - b.physics.radius)));
        // Sweep left-to-right through the entities.
        for (let i = 0; i < list.length; ++i) {
            let a = list[i];
            let rightEdge = a.position[X] + a.physics.radius;
            // Check only entities to the right of a;
            for (let j = i + 1; j < list.length; ++j) {
                let b = list[j];
                if (b.position[X] - b.physics.radius >= rightEdge) {
                    // No intersections are possible after this.
                    break;
                }
                let radSqr = Math.pow((a.physics.radius + b.physics.radius), 2);
                let distSqr = geo_1.Point.distSquared(a.position, b.position);
                if (distSqr < radSqr) {
                    intersections.push({ a: a, b: b });
                }
            }
        }
        return intersections;
    }
    correctCollisions(intersections) {
        let corrections = new Map();
        for (let i of intersections) {
            let a = i.a;
            let b = i.b;
            // Find the difference in position.
            let difP = geo_1.Point.subtract(b.position, a.position);
            let len = geo_1.Point.length(difP);
            // Normalize the difference.
            let normal = [difP[X] / len, difP[Y] / len];
            // Find the difference in velocity.
            let difV = geo_1.Point.subtract(b.physics.velocity, a.physics.velocity);
            let dot = geo_1.Point.dot(difV, normal);
            let bounce = a.physics.bounce * b.physics.bounce;
            let dv = [normal[X] * dot * bounce, normal[Y] * dot * bounce];
            let totalMass = a.physics.mass + b.physics.mass;
            a.physics.velocity[X] += dv[X] * b.physics.mass / totalMass;
            a.physics.velocity[Y] += dv[Y] * b.physics.mass / totalMass;
            b.physics.velocity[X] -= dv[X] * a.physics.mass / totalMass;
            b.physics.velocity[Y] -= dv[Y] * a.physics.mass / totalMass;
            // Displace the entities out of each other.
            let corA = corrections.get(a);
            if (corA == undefined) {
                corA = { d: [0, 0], mass: 0 };
                corrections.set(a, corA);
            }
            let corB = corrections.get(b);
            if (corB == undefined) {
                corB = { d: [0, 0], mass: 0 };
                corrections.set(b, corB);
            }
            let displace = (a.physics.radius + b.physics.radius) - len;
            let disX = normal[X] * displace;
            let disY = normal[Y] * displace;
            corA.d[X] -= disX * b.physics.mass;
            corA.d[Y] -= disY * b.physics.mass;
            corA.mass += totalMass;
            corB.d[X] += disX * a.physics.mass;
            corB.d[Y] += disY * a.physics.mass;
            corB.mass += totalMass;
        }
        for (let kvp of corrections) {
            let e = kvp[0];
            let cor = kvp[1];
            let dx = cor.d[X] / cor.mass * 1.05;
            let dy = cor.d[Y] / cor.mass * 1.05;
            e.position[X] += dx;
            e.position[Y] += dy;
        }
    }
}
exports.Physics = Physics;
(function (Physics) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    Physics.Dependencies = Dependencies;
})(Physics = exports.Physics || (exports.Physics = {}));

},{"./geo":6,"./system":17}],13:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var geo_1 = require('./geo');
var geo_2 = require('./geo');
var input_1 = require('./input');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class PlayerController {
    constructor() {
        this.deps = new PlayerController.Dependencies();
        this.player = null;
        this.bulletTime = 0.1;
        this.bulletLifespan = 4;
        this.bulletDamage = 6;
        this.score = 0;
        this._bulletTimeLeft = 0;
    }
    init() {
        this.deps.entities.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        });
        this.deps.entities.entityRemoved.listen(e => {
            if (e == this.player) {
                this.player = null;
            }
        });
        this.deps.reaper.entityKilled.listen(args => {
            if (args.killer.player && args.entity.scoring) {
                this.score += args.entity.scoring.value;
            }
        });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        if (this.player == null) {
            return;
        }
        let dvx = 0;
        let dvy = 0;
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.Up)))
            dvy -= 1;
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.Down)))
            dvy += 1;
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.UpLeft))) {
            dvx -= geo_2.COS_30;
            dvy -= geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.UpRight))) {
            dvx += geo_2.COS_30;
            dvy -= geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.DownLeft))) {
            dvx -= geo_2.COS_30;
            dvy += geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.DownRight))) {
            dvx += geo_2.COS_30;
            dvy += geo_2.SIN_30;
        }
        let len = Math.sqrt(Math.pow(dvx, 2) + Math.pow(dvy, 2));
        if (len <= 0.05) {
            // either zero or there's a rounding error.
            this.player.ship.direction = null;
        }
        else {
            dvx /= len;
            dvy /= len;
            this.player.ship.direction = [dvx, dvy];
        }
        // Bullets:
        if (this._bulletTimeLeft <= 0 && input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.Fire))) {
            let normal = geo_1.Point.subtract(this.deps.input.cursor, this.player.position);
            let len = geo_1.Point.length(normal);
            normal[X] /= len;
            normal[Y] /= len;
            let newPos = geo_1.Point.clone(this.player.position);
            newPos[X] += normal[X] * this.player.physics.radius * 1.5;
            newPos[Y] += normal[Y] * this.player.physics.radius * 1.5;
            let newVel = geo_1.Point.clone(this.player.physics.velocity);
            newVel[X] += normal[X] * 200;
            newVel[Y] += normal[Y] * 200;
            let newBullet = bulletController_1.BulletComponent.createBullet(newPos, newVel, this.bulletDamage, this.bulletLifespan, this.player);
            this.deps.entities.addEntity(newBullet);
            this._bulletTimeLeft += this.bulletTime;
        }
        if (this._bulletTimeLeft > 0) {
            this._bulletTimeLeft -= seconds;
        }
    }
}
exports.PlayerController = PlayerController;
(function (PlayerController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.input = null;
            this.reaper = null;
            this.entities = null;
        }
    }
    PlayerController.Dependencies = Dependencies;
})(PlayerController = exports.PlayerController || (exports.PlayerController = {}));

},{"./bulletController":1,"./geo":6,"./input":10,"./system":17}],14:[function(require,module,exports){
'use strict';
var event_1 = require('./event');
var system_1 = require('./system');
class Reaper {
    constructor() {
        this.deps = new Reaper.Dependencies();
        /**
         * Occurs when an entity is killed.
         */
        this.entityKilled = new event_1.Event();
        this._toKill = new Set();
    }
    init() { }
    /**
     * Marks an entity as dead.
     * The entity will be removed when reap() is called.
     * @param entity The entity to kill.
     */
    killEntity(entity, killer) {
        entity.isDead = true;
        this._toKill.add(entity);
        this.entityKilled.emit({ entity: entity, killer: killer });
    }
    /**
     * Removes dead entities.
     */
    reap() {
        for (let e of this._toKill) {
            if (e.isDead) {
                this.deps.entities.removeEntity(e);
            }
        }
        this._toKill.clear();
    }
}
exports.Reaper = Reaper;
(function (Reaper) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    Reaper.Dependencies = Dependencies;
})(Reaper = exports.Reaper || (exports.Reaper = {}));

},{"./event":4,"./system":17}],15:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var geo_2 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class Style {
}
const VIEW_HEIGHT = 75;
class Renderer {
    constructor() {
        this.deps = new Renderer.Dependencies();
        this.shapeFns = {
            'circle': (ctx) => {
                ctx.beginPath();
                ctx.arc(0, 0, 1, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            },
            'hexagon': (ctx) => {
                ctx.beginPath();
                ctx.moveTo(0, -1);
                ctx.lineTo(+geo_2.COS_30, -geo_2.SIN_30);
                ctx.lineTo(+geo_2.COS_30, +geo_2.SIN_30);
                ctx.lineTo(0, 1);
                ctx.lineTo(-geo_2.COS_30, +geo_2.SIN_30);
                ctx.lineTo(-geo_2.COS_30, -geo_2.SIN_30);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        };
        this.dpiScale = 1;
        this.glow = 10;
        this.camera = { pos: [0, 0], zoom: 1 };
        this._renderObjects = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.render)
            this._renderObjects.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._renderObjects.delete(e); });
    }
    setCanvas(canvas) {
        this._context = canvas.getContext('2d');
    }
    render(elapsedMs) {
        let seconds = elapsedMs / 1000;
        let ctx = this._context;
        let canvas = ctx.canvas;
        canvas.width = canvas.clientWidth * this.dpiScale;
        canvas.height = canvas.clientHeight * this.dpiScale;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.setTransform();
        for (let entity of this._renderObjects) {
            if (entity.physics) {
                const MAX_BLUR_COUNT = 5;
                let dir = geo_1.Point.normalize(entity.physics.velocity);
                let speed = geo_1.Point.length(entity.physics.velocity);
                let blurCount = Math.floor(speed * seconds / entity.render.radius + 1);
                blurCount = Math.min(blurCount, MAX_BLUR_COUNT, entity.render.maxBlur);
                for (let i = 0; i < blurCount; ++i) {
                    let pos = geo_1.Point.add(entity.position, [
                        -entity.physics.velocity[X] * seconds * i / blurCount,
                        -entity.physics.velocity[Y] * seconds * i / blurCount,
                    ]);
                    this.renderEntity(entity, pos, Math.sqrt(1.0 / blurCount), {
                        dir: dir,
                        factor: speed * seconds / (blurCount + 1) / entity.render.radius + 1,
                    });
                }
            }
            else {
                this.renderEntity(entity, entity.position, 1, null);
            }
        }
    }
    renderEntity(e, pos, alpha, stretch) {
        let ctx = this._context;
        ctx.save();
        let radius = e.render.radius;
        ctx.translate(pos[X], pos[Y]);
        ctx.scale(radius, radius);
        if (stretch) {
            this.stretch(stretch.dir, stretch.factor);
        }
        if (e.physics) {
            ctx.rotate(e.physics.theta);
        }
        let style = {
            fill: 'transparent',
            stroke: e.render.color,
            lineWidth: e.render.lineWidth / e.render.radius,
            alpha: e.render.alpha * alpha,
            glow: e.render.glow,
        };
        this.setStyle(style);
        this.shapeFns[e.render.shape](ctx);
        ctx.restore();
    }
    stretch(dir, factor) {
        let ab = [1, 0];
        let abDot = geo_1.Point.dot(ab, dir);
        let abAmount = abDot * (factor - 1);
        ab[X] += dir[X] * abAmount;
        ab[Y] += dir[Y] * abAmount;
        let bc = [0, 1];
        let bcDot = geo_1.Point.dot(bc, dir);
        let bcAmount = bcDot * (factor - 1);
        bc[X] += dir[X] * bcAmount;
        bc[Y] += dir[Y] * bcAmount;
        this._context.transform(ab[X], ab[Y], bc[X], bc[Y], 0, 0);
    }
    setTransform() {
        let ctx = this._context;
        let scale = this.camera.zoom * ctx.canvas.height / VIEW_HEIGHT;
        let dx = -this.camera.pos[X] * scale + ctx.canvas.width / 2;
        let dy = -this.camera.pos[Y] * scale + ctx.canvas.height / 2;
        ctx.setTransform(scale, 0, 0, scale, dx, dy);
    }
    drawCircle(center, radius, style) {
        let ctx = this._context;
        this.setStyle(style);
        ctx.beginPath();
        ctx.arc(center[X], center[Y], radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    setStyle(style) {
        let ctx = this._context;
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.lineWidth;
        ctx.globalAlpha = style.alpha;
        if (style.glow > 0) {
            ctx.shadowColor = style.stroke;
            ctx.shadowBlur = 10 * style.glow;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }
    screenToWorld(p) {
        let ctx = this._context;
        let x = p[X];
        let y = p[Y];
        x -= ctx.canvas.clientWidth / 2;
        y -= ctx.canvas.clientHeight / 2;
        let fac = VIEW_HEIGHT / ctx.canvas.clientHeight;
        x *= fac;
        y *= fac;
        return [x, y];
    }
}
exports.Renderer = Renderer;
(function (Renderer) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    Renderer.Dependencies = Dependencies;
})(Renderer = exports.Renderer || (exports.Renderer = {}));

},{"./geo":6,"./system":17}],16:[function(require,module,exports){
'use strict';
var particleController_1 = require('./particleController');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class ShipController {
    constructor() {
        this.deps = new ShipController.Dependencies();
        this._ships = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.ship)
            this._ships.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._ships.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._ships) {
            if (e.isDead) {
                continue;
            }
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction[X] * dvAmount;
                let dvy = e.ship.direction[Y] * dvAmount;
                e.physics.velocity[X] += dvx;
                e.physics.velocity[Y] += dvy;
                // exhaust:
                if (e.ship.exhaust) {
                    let exhaust = e.ship.exhaust;
                    let probableAmount = exhaust.rate * seconds;
                    let actualAmount;
                    if (probableAmount < 1) {
                        actualAmount = Math.random() < probableAmount ? 1 : 0;
                    }
                    else {
                        actualAmount = Math.ceil(Math.random() * probableAmount * 2);
                    }
                    let pSpeed = e.ship.accel * e.physics.mass / exhaust.mass / exhaust.rate;
                    for (let i = 0; i < actualAmount; ++i) {
                        let speedFactor = Math.random() * 0.5 + 0.75;
                        let pvx = (e.ship.direction[X] * -pSpeed * speedFactor) + e.physics.velocity[X];
                        let pvy = (e.ship.direction[Y] * -pSpeed * speedFactor) + e.physics.velocity[Y];
                        let px = e.position[X] - e.ship.direction[X] * e.physics.radius * 1.2;
                        let py = e.position[Y] - e.ship.direction[Y] * e.physics.radius * 1.2;
                        this.deps.entities.addEntity(particleController_1.ParticleComponent.createParticle([px, py], [pvx, pvy], e.render.color, exhaust.mass, exhaust.radius, 0.3));
                    }
                }
            }
        }
    }
}
exports.ShipController = ShipController;
(function (ShipController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    ShipController.Dependencies = Dependencies;
})(ShipController = exports.ShipController || (exports.ShipController = {}));

},{"./particleController":11,"./system":17}],17:[function(require,module,exports){
'use strict';
var System;
(function (System) {
    class Dependencies {
    }
    System.Dependencies = Dependencies;
    /**
     * Topologically sort the systems based on their dependencies.
     */
    function initOrder(sysObject) {
        let systems = new Set();
        for (let name in sysObject) {
            systems.add(name);
        }
        let order = [];
        while (systems.size > 0) {
            let nextItem = null;
            for (let name of systems) {
                let sys = sysObject[name];
                if (dependsOnSet(sys.deps, systems) === false) {
                    // sys doesn't depend on anything still in systems;
                    // it must be the next in the order.
                    nextItem = [name, sys];
                    break;
                }
            }
            if (nextItem == null) {
                // Cyclic dependency?
                return null;
            }
            systems.delete(nextItem[0]);
            order.push(nextItem);
        }
        return order;
    }
    System.initOrder = initOrder;
    function dependsOnSet(deps, systems) {
        for (let name in deps) {
            if (systems.has(name)) {
                return true;
            }
        }
        return false;
    }
    function initSystems(sysObject) {
        let order = initOrder(sysObject);
        if (order == null) {
            // Tsort has failed. Abort.
            return false;
        }
        for (let pair of order) {
            let sys = pair[1];
            // Fill in the dependencies.
            for (let name in sys.deps) {
                sys.deps[name] = sysObject[name];
            }
            sys.init();
        }
        return true;
    }
    System.initSystems = initSystems;
})(System = exports.System || (exports.System = {}));

},{}],18:[function(require,module,exports){
'use strict';
var enemyController_1 = require('./enemyController');
var geo_1 = require('./geo');
var system_1 = require('./system');
const WAVE_PERIOD = 3;
const GEN_RADIUS = 200;
class WaveGenerator {
    constructor() {
        this.deps = new WaveGenerator.Dependencies();
    }
    init() {
        this.reset();
    }
    reset() {
        this._waveTime = WAVE_PERIOD;
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        if (this._waveTime < 0) {
            if (this.deps.enemyController.enemies.size <= 10) {
                this.generateWave();
            }
            this._waveTime += WAVE_PERIOD;
        }
        this._waveTime -= seconds;
    }
    generateWave() {
        let followers = 12;
        let tanks = 2;
        let seekers = 8;
        for (let i = 0; i < followers; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemyController_1.EnemyComponent.createFollower(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < tanks; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemyController_1.EnemyComponent.createTank(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < seekers; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemyController_1.EnemyComponent.createSeeker(p, geo_1.Point.zero()));
        }
    }
}
exports.WaveGenerator = WaveGenerator;
(function (WaveGenerator) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.enemyController = null;
            this.entities = null;
        }
    }
    WaveGenerator.Dependencies = Dependencies;
})(WaveGenerator = exports.WaveGenerator || (exports.WaveGenerator = {}));

},{"./enemyController":2,"./geo":6,"./system":17}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnVsbGV0Q29udHJvbGxlci5qcyIsImJpbi9lbmVteUNvbnRyb2xsZXIuanMiLCJiaW4vZW50aXR5Q29udGFpbmVyLmpzIiwiYmluL2V2ZW50LmpzIiwiYmluL2dhbWUuanMiLCJiaW4vZ2VvLmpzIiwiYmluL2hlYWx0aENvbnRyb2xsZXIuanMiLCJiaW4vaHVkLmpzIiwiYmluL2luZGV4LmpzIiwiYmluL2lucHV0LmpzIiwiYmluL3BhcnRpY2xlQ29udHJvbGxlci5qcyIsImJpbi9waHlzaWNzLmpzIiwiYmluL3BsYXllckNvbnRyb2xsZXIuanMiLCJiaW4vcmVhcGVyLmpzIiwiYmluL3JlbmRlcmVyLmpzIiwiYmluL3NoaXBDb250cm9sbGVyLmpzIiwiYmluL3N5c3RlbS5qcyIsImJpbi93YXZlR2VuZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbnZhciBCdWxsZXRDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoQnVsbGV0Q29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVCdWxsZXQocG9zLCB2ZWwsIGRhbWFnZSwgbGlmZXNwYW4sIHNvdXJjZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDAuNixcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMSxcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuMTI1LFxyXG4gICAgICAgICAgICAgICAgdGhldGE6IDAsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIG1hc3M6IDAuNSxcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjNDBBMEZGJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjQsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuMSxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDUsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBidWxsZXQ6IHtcclxuICAgICAgICAgICAgICAgIGRhbWFnZTogZGFtYWdlLFxyXG4gICAgICAgICAgICAgICAgaXNBbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogc291cmNlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwYXJ0aWNsZToge1xyXG4gICAgICAgICAgICAgICAgbGlmZXNwYW46IGxpZmVzcGFuLFxyXG4gICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZzogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICBjb3VudDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIEJ1bGxldENvbXBvbmVudC5jcmVhdGVCdWxsZXQgPSBjcmVhdGVCdWxsZXQ7XHJcbn0pKEJ1bGxldENvbXBvbmVudCA9IGV4cG9ydHMuQnVsbGV0Q29tcG9uZW50IHx8IChleHBvcnRzLkJ1bGxldENvbXBvbmVudCA9IHt9KSk7XHJcbmNsYXNzIEJ1bGxldENvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IEJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5fYnVsbGV0cyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuYnVsbGV0KVxyXG4gICAgICAgICAgICB0aGlzLl9idWxsZXRzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9idWxsZXRzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHRoaXMuZGVwcy5waHlzaWNzLmludGVyc2VjdGlvbnM7XHJcbiAgICAgICAgZm9yIChsZXQgYiBvZiB0aGlzLl9idWxsZXRzKSB7XHJcbiAgICAgICAgICAgIGlmIChiLmJ1bGxldC5pc0FsaXZlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW50ZXJzID0gaW50ZXJzZWN0aW9ucy5nZXQoYik7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzICYmIGludGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSBvZiBpbnRlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG90aGVyID0gaS5iO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXIuaGVhbHRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcHMuaGVhbHRoQ29udHJvbGxlci5kYW1hZ2VFbnRpdHkob3RoZXIsIGIuYnVsbGV0LmRhbWFnZSwgYi5idWxsZXQuc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIuYnVsbGV0LmlzQWxpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYi5yZW5kZXIuY29sb3IgPSBcIiM4MDgwODBcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSBCdWxsZXRDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKEJ1bGxldENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aENvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShCdWxsZXRDb250cm9sbGVyID0gZXhwb3J0cy5CdWxsZXRDb250cm9sbGVyIHx8IChleHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWxsZXRDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG52YXIgRW5lbXlDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoRW5lbXlDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZvbGxvd2VyKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNGRjgwMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMixcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuZW15OiB7fSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDEwMCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEuNSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhlYWx0aDoge1xyXG4gICAgICAgICAgICAgICAgaHA6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDEwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY29yaW5nOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogMTAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuICAgIEVuZW15Q29tcG9uZW50LmNyZWF0ZUZvbGxvd2VyID0gY3JlYXRlRm9sbG93ZXI7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVUYW5rKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDMsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjQsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogOSxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjRDAwMDAwJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAzLFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAyLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHt9LFxyXG4gICAgICAgICAgICBzaGlwOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlbDogODAsXHJcbiAgICAgICAgICAgICAgICBleGhhdXN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmF0ZTogNCxcclxuICAgICAgICAgICAgICAgICAgICBtYXNzOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMC44LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGVhbHRoOiB7XHJcbiAgICAgICAgICAgICAgICBocDogMzAsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogMzAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjb3Jpbmc6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAyMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBlO1xyXG4gICAgfVxyXG4gICAgRW5lbXlDb21wb25lbnQuY3JlYXRlVGFuayA9IGNyZWF0ZVRhbms7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVTZWVrZXIocG9zLCB2ZWwpIHtcclxuICAgICAgICBsZXQgZSA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHZlbCxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMSxcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuMjUsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogMC44LFxyXG4gICAgICAgICAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM4MEZGMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDAuOSxcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMyxcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuZW15OiB7fSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDE1MCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiA1LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAwLjQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoZWFsdGg6IHtcclxuICAgICAgICAgICAgICAgIGhwOiA1LFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjb3Jpbmc6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiA1LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVTZWVrZXIgPSBjcmVhdGVTZWVrZXI7XHJcbn0pKEVuZW15Q29tcG9uZW50ID0gZXhwb3J0cy5FbmVteUNvbXBvbmVudCB8fCAoZXhwb3J0cy5FbmVteUNvbXBvbmVudCA9IHt9KSk7XHJcbmNsYXNzIEVuZW15Q29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgRW5lbXlDb250cm9sbGVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuZW5lbXkpXHJcbiAgICAgICAgICAgIHRoaXMuZW5lbWllcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5lbmVtaWVzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBsZXQgcGxheWVyID0gdGhpcy5kZXBzLnBsYXllckNvbnRyb2xsZXIucGxheWVyO1xyXG4gICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5lbmVtaWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmlzRGVhZCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZiA9IGdlb18xLlBvaW50LnN1YnRyYWN0KHBsYXllci5wb3NpdGlvbiwgZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpZik7XHJcbiAgICAgICAgICAgICAgICBkaWZbWF0gLz0gbGVuO1xyXG4gICAgICAgICAgICAgICAgZGlmW1ldIC89IGxlbjtcclxuICAgICAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBkaWY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkVuZW15Q29udHJvbGxlciA9IEVuZW15Q29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChFbmVteUNvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEVuZW15Q29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKEVuZW15Q29udHJvbGxlciA9IGV4cG9ydHMuRW5lbXlDb250cm9sbGVyIHx8IChleHBvcnRzLkVuZW15Q29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuZW15Q29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBldmVudF8xID0gcmVxdWlyZSgnLi9ldmVudCcpO1xyXG5jbGFzcyBFbnRpdHlDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0ge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2NjdXJzIGFmdGVyIGFuIGVudGl0eSBpcyBhZGRlZCB0byB0aGUgY29udGFpbmVyLlxyXG4gICAgICAgICAqIGFyZzogVGhlIGVudGl0eSB0aGF0IHdhcyBhZGRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVudGl0eUFkZGVkID0gbmV3IGV2ZW50XzEuRXZlbnQoKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPY2N1cnMgYWZ0ZXIgYW4gZW50aXR5IGlzIHJlbW92ZWQgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICAgICAqIGFyZzogVGhlIGVudGl0eSB0aGF0IHdhcyByZW1vdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZW50aXR5UmVtb3ZlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV4dElkID0gMDtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7IH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBlbnRpdHkgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAqIEBwYXJhbSBlbnRpdHkgVGhlIGVudGl0eSB0byBhZGQuXHJcbiAgICAgKi9cclxuICAgIGFkZEVudGl0eShlbnRpdHkpIHtcclxuICAgICAgICBlbnRpdHkuaWQgPSArK3RoaXMuX25leHRJZDtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGQoZW50aXR5KTtcclxuICAgICAgICB0aGlzLl9pbmRleC5zZXQoZW50aXR5LmlkLCBlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5QWRkZWQuZW1pdChlbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGVudGl0eSBmcm9tIHRoZSBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0gZW50aXR5IFRoZSBlbnRpdHkgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbnRpdHkoZW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMuZGVsZXRlKGVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5faW5kZXguZGVsZXRlKGVudGl0eS5pZCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlSZW1vdmVkLmVtaXQoZW50aXR5KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cclxuICAgICAqIEBwYXJhbSBpZCBUaGUgaWQgb2YgdGhlIGVudGl0eSB0byByZXRyaWV2ZS5cclxuICAgICAqL1xyXG4gICAgZ2V0QnlJZChpZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleC5nZXQoaWQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRW50aXR5Q29udGFpbmVyID0gRW50aXR5Q29udGFpbmVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbnRpdHlDb250YWluZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG5jbGFzcyBFdmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBbXTtcclxuICAgIH1cclxuICAgIGVtaXQodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGlzdGVuZXJzLm1hcChsID0+IGwodmFsdWUpKTtcclxuICAgIH1cclxuICAgIGVtaXRBc3luYyh2YWx1ZSkge1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gdGhpcy5lbWl0KHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cy5tYXAodiA9PiB2ICYmIHYudGhlbiA/IHYgOiBQcm9taXNlLnJlc29sdmUodikpKTtcclxuICAgIH1cclxuICAgIGxpc3RlbihsaXN0ZW5lcikge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkV2ZW50ID0gRXZlbnQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGJ1bGxldENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vYnVsbGV0Q29udHJvbGxlcicpO1xyXG52YXIgZW5lbXlDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2VuZW15Q29udHJvbGxlcicpO1xyXG52YXIgZW50aXR5Q29udGFpbmVyXzEgPSByZXF1aXJlKCcuL2VudGl0eUNvbnRhaW5lcicpO1xyXG52YXIgaGVhbHRoQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9oZWFsdGhDb250cm9sbGVyJyk7XHJcbnZhciBodWRfMSA9IHJlcXVpcmUoJy4vaHVkJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG52YXIgcGh5c2ljc18xID0gcmVxdWlyZSgnLi9waHlzaWNzJyk7XHJcbnZhciBwYXJ0aWNsZUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vcGFydGljbGVDb250cm9sbGVyJyk7XHJcbnZhciBwbGF5ZXJDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL3BsYXllckNvbnRyb2xsZXInKTtcclxudmFyIHJlYXBlcl8xID0gcmVxdWlyZSgnLi9yZWFwZXInKTtcclxudmFyIHJlbmRlcmVyXzEgPSByZXF1aXJlKCcuL3JlbmRlcmVyJyk7XHJcbnZhciBzaGlwQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9zaGlwQ29udHJvbGxlcicpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG52YXIgd2F2ZUdlbmVyYXRvcl8xID0gcmVxdWlyZSgnLi93YXZlR2VuZXJhdG9yJyk7XHJcbmNsYXNzIEJhc2VHYW1lIHtcclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgc3lzdGVtXzEuU3lzdGVtLmluaXRTeXN0ZW1zKHRoaXMuc3lzdGVtcyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5CYXNlR2FtZSA9IEJhc2VHYW1lO1xyXG4oZnVuY3Rpb24gKEJhc2VHYW1lKSB7XHJcbiAgICBjbGFzcyBTeXN0ZW1zIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG5ldyBlbnRpdHlDb250YWluZXJfMS5FbnRpdHlDb250YWluZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBCYXNlR2FtZS5TeXN0ZW1zID0gU3lzdGVtcztcclxufSkoQmFzZUdhbWUgPSBleHBvcnRzLkJhc2VHYW1lIHx8IChleHBvcnRzLkJhc2VHYW1lID0ge30pKTtcclxuY2xhc3MgR2FtZSBleHRlbmRzIEJhc2VHYW1lIHtcclxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMgPSBuZXcgR2FtZS5TeXN0ZW1zKCk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy53YXZlR2VuZXJhdG9yLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucGxheWVyQ29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmVuZW15Q29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLnNoaXBDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuYnVsbGV0Q29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLnBhcnRpY2xlQ29udHJvbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucmVhcGVyLnJlYXAoKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucGh5c2ljcy5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmh1ZC5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmlucHV0LnBvc3RTdGVwKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5HYW1lID0gR2FtZTtcclxuKGZ1bmN0aW9uIChHYW1lKSB7XHJcbiAgICBjbGFzcyBTeXN0ZW1zIGV4dGVuZHMgQmFzZUdhbWUuU3lzdGVtcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBpbnB1dF8xLklucHV0KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG5ldyBwaHlzaWNzXzEuUGh5c2ljcygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IHJlbmRlcmVyXzEuUmVuZGVyZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyID0gbmV3IHBsYXllckNvbnRyb2xsZXJfMS5QbGF5ZXJDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpcENvbnRyb2xsZXIgPSBuZXcgc2hpcENvbnRyb2xsZXJfMS5TaGlwQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW15Q29udHJvbGxlciA9IG5ldyBlbmVteUNvbnRyb2xsZXJfMS5FbmVteUNvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRDb250cm9sbGVyID0gbmV3IGJ1bGxldENvbnRyb2xsZXJfMS5CdWxsZXRDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVDb250cm9sZXIgPSBuZXcgcGFydGljbGVDb250cm9sbGVyXzEuUGFydGljbGVDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoQ29udHJvbGxlciA9IG5ldyBoZWFsdGhDb250cm9sbGVyXzEuSGVhbHRoQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLndhdmVHZW5lcmF0b3IgPSBuZXcgd2F2ZUdlbmVyYXRvcl8xLldhdmVHZW5lcmF0b3IoKTtcclxuICAgICAgICAgICAgdGhpcy5odWQgPSBuZXcgaHVkXzEuSHVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhcGVyID0gbmV3IHJlYXBlcl8xLlJlYXBlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEdhbWUuU3lzdGVtcyA9IFN5c3RlbXM7XHJcbn0pKEdhbWUgPSBleHBvcnRzLkdhbWUgfHwgKGV4cG9ydHMuR2FtZSA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdhbWUuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG5leHBvcnRzLlNJTl8zMCA9IDAuNTtcclxuZXhwb3J0cy5DT1NfMzAgPSAwLjg2NjAzO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbnZhciBQb2ludDtcclxuKGZ1bmN0aW9uIChQb2ludCkge1xyXG4gICAgZnVuY3Rpb24gYWRkKC4uLnBvaW50cykge1xyXG4gICAgICAgIGxldCBwID0gWzAsIDBdO1xyXG4gICAgICAgIGZvciAobGV0IHAxIG9mIHBvaW50cykge1xyXG4gICAgICAgICAgICBwW1hdICs9IHAxW1hdO1xyXG4gICAgICAgICAgICBwW1ldICs9IHAxW1ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcDtcclxuICAgIH1cclxuICAgIFBvaW50LmFkZCA9IGFkZDtcclxuICAgIGZ1bmN0aW9uIHN1YnRyYWN0KHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBbcDFbWF0gLSBwMltYXSwgcDFbWV0gLSBwMltZXV07XHJcbiAgICB9XHJcbiAgICBQb2ludC5zdWJ0cmFjdCA9IHN1YnRyYWN0O1xyXG4gICAgZnVuY3Rpb24gbGVuZ3RoKHApIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KGxlbmd0aFNxdWFyZWQocCkpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgZnVuY3Rpb24gbGVuZ3RoU3F1YXJlZChwKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHBbWF0sIDIpICsgTWF0aC5wb3cocFtZXSwgMik7XHJcbiAgICB9XHJcbiAgICBQb2ludC5sZW5ndGhTcXVhcmVkID0gbGVuZ3RoU3F1YXJlZDtcclxuICAgIGZ1bmN0aW9uIGRpc3QocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChkaXN0U3F1YXJlZChwMSwgcDIpKTtcclxuICAgIH1cclxuICAgIFBvaW50LmRpc3QgPSBkaXN0O1xyXG4gICAgZnVuY3Rpb24gZGlzdFNxdWFyZWQocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KChwMVtYXSAtIHAyW1hdKSwgMikgKyBNYXRoLnBvdygocDFbWV0gLSBwMltZXSksIDIpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuZGlzdFNxdWFyZWQgPSBkaXN0U3F1YXJlZDtcclxuICAgIGZ1bmN0aW9uIGRvdChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4gcDFbWF0gKiBwMltYXSArIHAxW1ldICogcDJbWV07XHJcbiAgICB9XHJcbiAgICBQb2ludC5kb3QgPSBkb3Q7XHJcbiAgICBmdW5jdGlvbiBjbG9uZShwKSB7XHJcbiAgICAgICAgcmV0dXJuIFtwW1hdLCBwW1ldXTtcclxuICAgIH1cclxuICAgIFBvaW50LmNsb25lID0gY2xvbmU7XHJcbiAgICBmdW5jdGlvbiBub3JtYWxpemUocCkge1xyXG4gICAgICAgIGxldCBsZW4gPSBsZW5ndGgocCk7XHJcbiAgICAgICAgcmV0dXJuIFtwW1hdIC8gbGVuLCBwW1ldIC8gbGVuXTtcclxuICAgIH1cclxuICAgIFBvaW50Lm5vcm1hbGl6ZSA9IG5vcm1hbGl6ZTtcclxuICAgIGZ1bmN0aW9uIHplcm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIFswLCAwXTtcclxuICAgIH1cclxuICAgIFBvaW50Lnplcm8gPSB6ZXJvO1xyXG4gICAgZnVuY3Rpb24gcGx1cyhzZWxmLCBwKSB7XHJcbiAgICAgICAgc2VsZltYXSArPSBwW1hdO1xyXG4gICAgICAgIHNlbGZbWV0gKz0gcFtZXTtcclxuICAgIH1cclxuICAgIFBvaW50LnBsdXMgPSBwbHVzO1xyXG59KShQb2ludCA9IGV4cG9ydHMuUG9pbnQgfHwgKGV4cG9ydHMuUG9pbnQgPSB7fSkpO1xyXG52YXIgZ2VvO1xyXG4oZnVuY3Rpb24gKGdlbykge1xyXG4gICAgdmFyIG1hdGg7XHJcbiAgICAoZnVuY3Rpb24gKG1hdGgpIHtcclxuICAgICAgICBmdW5jdGlvbiByYW5kQmV0d2VlbihtaW4sIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLnJhbmRCZXR3ZWVuID0gcmFuZEJldHdlZW47XHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZENpcmNsZShjZW50ZXIsIHJhZGl1cykge1xyXG4gICAgICAgICAgICAvLyBSZXBlYXQgdW50aWwgKHgseSkgaXMgaW5zaWRlIHRoZSB1bml0IGNpcmNsZS5cclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gcmFuZEJldHdlZW4oLTEsIDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSByYW5kQmV0d2VlbigtMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5wb3coeCwgMikgKyBNYXRoLnBvdyh5LCAyKSA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeCAqIHJhZGl1cyArIGNlbnRlcltYXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeSAqIHJhZGl1cyArIGNlbnRlcltZXSxcclxuICAgICAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGgucmFuZENpcmNsZSA9IHJhbmRDaXJjbGU7XHJcbiAgICAgICAgLy8gQXBwcm94LiB1c2luZyBzdW0gb2YgMyB1bmlmb3JtIHJhbmRvbSBudW1iZXJzLlxyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRHYXVzcyhtZWFuLCBkZXYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKSArIE1hdGgucmFuZG9tKCkgLSAxLjUpICogMC42NyAqIGRldiArIG1lYW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGgucmFuZEdhdXNzID0gcmFuZEdhdXNzO1xyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRHYXVzczJkKGNlbnRlciwgZGV2KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICByYW5kR2F1c3MoY2VudGVyW1hdLCBkZXYpLFxyXG4gICAgICAgICAgICAgICAgcmFuZEdhdXNzKGNlbnRlcltZXSwgZGV2KSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kR2F1c3MyZCA9IHJhbmRHYXVzczJkO1xyXG4gICAgICAgIGZ1bmN0aW9uIGxlcnAobWluLCBtYXgsIHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHggKiAobWF4IC0gbWluKSArIG1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5sZXJwID0gbGVycDtcclxuICAgICAgICBmdW5jdGlvbiBjbGFtcChtaW4sIHgsIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCB4KSwgbWF4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5jbGFtcCA9IGNsYW1wO1xyXG4gICAgfSkobWF0aCA9IGdlby5tYXRoIHx8IChnZW8ubWF0aCA9IHt9KSk7XHJcbn0pKGdlbyA9IGV4cG9ydHMuZ2VvIHx8IChleHBvcnRzLmdlbyA9IHt9KSk7XHJcbmV4cG9ydHMuZGVmYXVsdCA9IGdlbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2VvLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY2xhc3MgSGVhbHRoQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgSGVhbHRoQ29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLl9oZWFsdGhFbnRpdGllcyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuaGVhbHRoKVxyXG4gICAgICAgICAgICB0aGlzLl9oZWFsdGhFbnRpdGllcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5faGVhbHRoRW50aXRpZXMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIGRhbWFnZUVudGl0eShlbnRpdHksIGRhbWFnZSwgc291cmNlKSB7XHJcbiAgICAgICAgaWYgKGVudGl0eS5oZWFsdGgpIHtcclxuICAgICAgICAgICAgZW50aXR5LmhlYWx0aC5ocCAtPSBkYW1hZ2U7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkuaGVhbHRoLmhwIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5yZWFwZXIua2lsbEVudGl0eShlbnRpdHksIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5IZWFsdGhDb250cm9sbGVyID0gSGVhbHRoQ29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChIZWFsdGhDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYXBlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEhlYWx0aENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShIZWFsdGhDb250cm9sbGVyID0gZXhwb3J0cy5IZWFsdGhDb250cm9sbGVyIHx8IChleHBvcnRzLkhlYWx0aENvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oZWFsdGhDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBIdWQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IEh1ZC5EZXBlbmRlbmNpZXMoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7IH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cnNvckRpc3BsYXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJzb3JEaXNwbGF5ID0ge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFswLCAwXSxcclxuICAgICAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzgwODA4MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxwaGE6IDAuMyxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hhcGU6ICdoZXhhZ29uJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuMTI1LFxyXG4gICAgICAgICAgICAgICAgICAgIG1heEJsdXI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZ2xvdzogMSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkodGhpcy5fY3Vyc29yRGlzcGxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjdXJzb3IgPSB0aGlzLmRlcHMuaW5wdXQuY3Vyc29yO1xyXG4gICAgICAgIGlmIChjdXJzb3IpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3Vyc29yRGlzcGxheS5wb3NpdGlvbiA9IGdlb18xLlBvaW50LmNsb25lKGN1cnNvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9kaXNwbGF5Q29udHJvbGxlciAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNjb3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGlzcGxheVNjb3JlKCkge1xyXG4gICAgICAgIGxldCBzY29yZSA9IHRoaXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnNjb3JlO1xyXG4gICAgICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVyLnNjb3JlLnNldFZhbHVlKHNjb3JlLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgc2V0RGlzcGxheUNvbnRyb2xsZXIoaGRjKSB7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXIgPSBoZGM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5IdWQgPSBIdWQ7XHJcbihmdW5jdGlvbiAoSHVkKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgSHVkLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoSHVkID0gZXhwb3J0cy5IdWQgfHwgKGV4cG9ydHMuSHVkID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHVkLmpzLm1hcCIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL25vZGUvbm9kZS5kLnRzXCIgLz5cclxuJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2FtZV8xID0gcmVxdWlyZSgnLi9nYW1lJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG5sZXQgbWFpbkNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQ2FudmFzJyk7XHJcbmxldCBnYW1lID0gbmV3IGdhbWVfMS5HYW1lKCk7XHJcbmdhbWUuaW5pdCgpO1xyXG5nYW1lLnN5c3RlbXMucmVuZGVyZXIuc2V0Q2FudmFzKG1haW5DYW52YXMpO1xyXG5jbGFzcyBFbGVtZW50QmluZGluZyB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBhdHRyaWJ1dGUpIHtcclxuICAgICAgICBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGUgfHwgJ2lubmVyVGV4dCc7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZSA9IGF0dHJpYnV0ZTtcclxuICAgIH1cclxuICAgIHNldFZhbHVlKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMuYXR0cmlidXRlXSA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcbnZhciBodWREaXNwbGF5Q29udHJvbGxlciA9IHtcclxuICAgIHNjb3JlOiBuZXcgRWxlbWVudEJpbmRpbmcoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2h1ZF9zY29yZScpKSxcclxufTtcclxuZ2FtZS5zeXN0ZW1zLmh1ZC5zZXREaXNwbGF5Q29udHJvbGxlcihodWREaXNwbGF5Q29udHJvbGxlcik7XHJcbmxldCBsYXN0U3RlcFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxubGV0IHRpbWVzY2FsZSA9IDE7XHJcbnNldFRpbWVvdXQoZnVuY3Rpb24gc3RlcCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHN0ZXBUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgZ2FtZS5zdGVwKChzdGVwVGltZSAtIGxhc3RTdGVwVGltZSkgKiB0aW1lc2NhbGUpO1xyXG4gICAgICAgIGxhc3RTdGVwVGltZSA9IHN0ZXBUaW1lO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICB9XHJcbiAgICBzZXRUaW1lb3V0KHN0ZXAsIDMwKTtcclxufSwgMzApO1xyXG5nYW1lLnN5c3RlbXMuZW50aXRpZXMuYWRkRW50aXR5KHtcclxuICAgIHBvc2l0aW9uOiBbMCwgMF0sXHJcbiAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgdmVsb2NpdHk6IFswLCAwXSxcclxuICAgICAgICByYWRpdXM6IDEsXHJcbiAgICAgICAgZHJhZzogMixcclxuICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJlbmRlcjoge1xyXG4gICAgICAgIGNvbG9yOiAnIzAwQTBGRicsXHJcbiAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgc2hhcGU6ICdoZXhhZ29uJyxcclxuICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICBsaW5lV2lkdGg6IDAuMjUsXHJcbiAgICAgICAgbWF4Qmx1cjogMyxcclxuICAgICAgICBnbG93OiAxLFxyXG4gICAgfSxcclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNjb3JlOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXA6IHtcclxuICAgICAgICBhY2NlbDogNjAwLFxyXG4gICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgcmF0ZTogODAsXHJcbiAgICAgICAgICAgIG1hc3M6IDAuNixcclxuICAgICAgICAgICAgcmFkaXVzOiAwLjMsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBoZWFsdGg6IHtcclxuICAgICAgICBocDogMTAsXHJcbiAgICAgICAgbWF4SHA6IDEwLFxyXG4gICAgfSxcclxufSk7XHJcbmxldCBrZXlNYXAgPSB7XHJcbiAgICA4MTogaW5wdXRfMS5LZXkuVXBMZWZ0LFxyXG4gICAgODc6IGlucHV0XzEuS2V5LlVwLFxyXG4gICAgNjk6IGlucHV0XzEuS2V5LlVwUmlnaHQsXHJcbiAgICA2NTogaW5wdXRfMS5LZXkuRG93bkxlZnQsXHJcbiAgICA4MzogaW5wdXRfMS5LZXkuRG93bixcclxuICAgIDY4OiBpbnB1dF8xLktleS5Eb3duUmlnaHQsXHJcbn07XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgIGxldCBrZXkgPSBrZXlNYXBbZS5rZXlDb2RlXTtcclxuICAgIGlmIChrZXkgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmtleURvd24oa2V5KTtcclxuICAgIH1cclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XHJcbiAgICBsZXQga2V5ID0ga2V5TWFwW2Uua2V5Q29kZV07XHJcbiAgICBpZiAoa2V5ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdhbWUuc3lzdGVtcy5pbnB1dC5rZXlVcChrZXkpO1xyXG4gICAgfVxyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICBsZXQgcmVjdCA9IG1haW5DYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgcCA9IFtcclxuICAgICAgICBlLmNsaWVudFggLSByZWN0LmxlZnQsXHJcbiAgICAgICAgZS5jbGllbnRZIC0gcmVjdC50b3AsXHJcbiAgICBdO1xyXG4gICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmN1cnNvciA9IGdhbWUuc3lzdGVtcy5yZW5kZXJlci5zY3JlZW5Ub1dvcmxkKHApO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XHJcbiAgICBnYW1lLnN5c3RlbXMuaW5wdXQua2V5RG93bihpbnB1dF8xLktleS5GaXJlKTtcclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcclxuICAgIGdhbWUuc3lzdGVtcy5pbnB1dC5rZXlVcChpbnB1dF8xLktleS5GaXJlKTtcclxufSk7XHJcbmxldCBsYXN0UmVuZGVyVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgbGV0IHJlbmRlclRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIGdhbWUuc3lzdGVtcy5yZW5kZXJlci5yZW5kZXIocmVuZGVyVGltZSAtIGxhc3RSZW5kZXJUaW1lKTtcclxuICAgIGxhc3RSZW5kZXJUaW1lID0gcmVuZGVyVGltZTtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG4oZnVuY3Rpb24gKEtleSkge1xyXG4gICAgS2V5W0tleVtcIlVwTGVmdFwiXSA9IDBdID0gXCJVcExlZnRcIjtcclxuICAgIEtleVtLZXlbXCJVcFwiXSA9IDFdID0gXCJVcFwiO1xyXG4gICAgS2V5W0tleVtcIlVwUmlnaHRcIl0gPSAyXSA9IFwiVXBSaWdodFwiO1xyXG4gICAgS2V5W0tleVtcIkRvd25MZWZ0XCJdID0gM10gPSBcIkRvd25MZWZ0XCI7XHJcbiAgICBLZXlbS2V5W1wiRG93blwiXSA9IDRdID0gXCJEb3duXCI7XHJcbiAgICBLZXlbS2V5W1wiRG93blJpZ2h0XCJdID0gNV0gPSBcIkRvd25SaWdodFwiO1xyXG4gICAgS2V5W0tleVtcIkZpcmVcIl0gPSA2XSA9IFwiRmlyZVwiO1xyXG59KShleHBvcnRzLktleSB8fCAoZXhwb3J0cy5LZXkgPSB7fSkpO1xyXG52YXIgS2V5ID0gZXhwb3J0cy5LZXk7XHJcbihmdW5jdGlvbiAoS2V5U3RhdGUpIHtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiUHJlc3NpbmdcIl0gPSAwXSA9IFwiUHJlc3NpbmdcIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XHJcbiAgICBLZXlTdGF0ZVtLZXlTdGF0ZVtcIlJlbGVhc2luZ1wiXSA9IDJdID0gXCJSZWxlYXNpbmdcIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiVXBcIl0gPSAzXSA9IFwiVXBcIjtcclxufSkoZXhwb3J0cy5LZXlTdGF0ZSB8fCAoZXhwb3J0cy5LZXlTdGF0ZSA9IHt9KSk7XHJcbnZhciBLZXlTdGF0ZSA9IGV4cG9ydHMuS2V5U3RhdGU7XHJcbnZhciBLZXlTdGF0ZTtcclxuKGZ1bmN0aW9uIChLZXlTdGF0ZSkge1xyXG4gICAgZnVuY3Rpb24gaXNEb3duKHN0YXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlIDwgMjtcclxuICAgIH1cclxuICAgIEtleVN0YXRlLmlzRG93biA9IGlzRG93bjtcclxufSkoS2V5U3RhdGUgPSBleHBvcnRzLktleVN0YXRlIHx8IChleHBvcnRzLktleVN0YXRlID0ge30pKTtcclxuY2xhc3MgSW5wdXQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0ge307XHJcbiAgICAgICAgdGhpcy5fdG9SZWxlYXNlID0gW107XHJcbiAgICAgICAgbGV0IGtleUNvdW50ID0gT2JqZWN0LmtleXMoS2V5KS5sZW5ndGggLyAyO1xyXG4gICAgICAgIHRoaXMuX2tleXMgPSBuZXcgQXJyYXkoa2V5Q291bnQpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuVXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaW5pdCgpIHsgfVxyXG4gICAgZ2V0S2V5KGtleSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXlzW2tleV07XHJcbiAgICB9XHJcbiAgICBrZXlEb3duKGtleSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9rZXlzW2tleV0gIT0gS2V5U3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlzW2tleV0gPSBLZXlTdGF0ZS5QcmVzc2luZztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBrZXlVcChrZXkpIHtcclxuICAgICAgICB0aGlzLl90b1JlbGVhc2UucHVzaChrZXkpO1xyXG4gICAgfVxyXG4gICAgcG9zdFN0ZXAoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9rZXlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9rZXlzW2ldID09IEtleVN0YXRlLlByZXNzaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuRG93bjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9rZXlzW2ldID09IEtleVN0YXRlLlJlbGVhc2luZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5c1tpXSA9IEtleVN0YXRlLlVwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiB0aGlzLl90b1JlbGVhc2UpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2tleXNba2V5XSAhPSBLZXlTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5c1trZXldID0gS2V5U3RhdGUuUmVsZWFzaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RvUmVsZWFzZS5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuSW5wdXQgPSBJbnB1dDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5wdXQuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG52YXIgUGFydGljbGVDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoUGFydGljbGVDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVBhcnRpY2xlKHBvcywgdmVsLCBjb2xvciwgbWFzcywgcmFkaXVzLCBsaWZlc3Bhbikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiBtYXNzLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC4yNSxcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IGZhbHNlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDEsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwYXJ0aWNsZToge1xyXG4gICAgICAgICAgICAgICAgbGlmZXNwYW46IGxpZmVzcGFuLFxyXG4gICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZzogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICBjb3VudDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgUGFydGljbGVDb21wb25lbnQuY3JlYXRlUGFydGljbGUgPSBjcmVhdGVQYXJ0aWNsZTtcclxufSkoUGFydGljbGVDb21wb25lbnQgPSBleHBvcnRzLlBhcnRpY2xlQ29tcG9uZW50IHx8IChleHBvcnRzLlBhcnRpY2xlQ29tcG9uZW50ID0ge30pKTtcclxuY2xhc3MgUGFydGljbGVDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBQYXJ0aWNsZUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAyMDA7XHJcbiAgICAgICAgdGhpcy5fcGFydGljbGVDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGFydGljbGVzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFydGljbGVzLmFkZChlKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKyt0aGlzLl9wYXJ0aWNsZUNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wYXJ0aWNsZUNvdW50ID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRvRGVsZXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlMiBvZiB0aGlzLl9wYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlMi5wYXJ0aWNsZS5jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvRGVsZXRlID0gZTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMucmVtb3ZlRW50aXR5KHRvRGVsZXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHtcclxuICAgICAgICAgICAgaWYgKGUucGFydGljbGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BhcnRpY2xlcy5kZWxldGUoZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZS5jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC0tdGhpcy5fcGFydGljbGVDb3VudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLl9wYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgaWYgKGUucGFydGljbGUudGltZVJlbWFpbmluZyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMucmVtb3ZlRW50aXR5KGUpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5yZW5kZXIuYWxwaGEgPSBlLnBhcnRpY2xlLnRpbWVSZW1haW5pbmcgLyBlLnBhcnRpY2xlLmxpZmVzcGFuO1xyXG4gICAgICAgICAgICBlLnBhcnRpY2xlLnRpbWVSZW1haW5pbmcgLT0gc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5QYXJ0aWNsZUNvbnRyb2xsZXIgPSBQYXJ0aWNsZUNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoUGFydGljbGVDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBQYXJ0aWNsZUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShQYXJ0aWNsZUNvbnRyb2xsZXIgPSBleHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciB8fCAoZXhwb3J0cy5QYXJ0aWNsZUNvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0aWNsZUNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNvbnN0IFdPUkxEX0RSQUcgPSA0O1xyXG5jbGFzcyBQaHlzaWNzIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBQaHlzaWNzLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMuaXRlcmF0aW9ucyA9IDQ7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX3BoeXNPYmplY3RzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5waHlzaWNzKVxyXG4gICAgICAgICAgICB0aGlzLl9waHlzT2JqZWN0cy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fcGh5c09iamVjdHMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zLmNsZWFyKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZXJhdGlvbnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHRoaXMuc3RlcEludGVybmFsKGVsYXBzZWRNcyAvIHRoaXMuaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGludGVyIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkSW50ZXJzZWN0aW9uKGludGVyLmEsIGludGVyLmIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbnRlcnNlY3Rpb24oaW50ZXIuYiwgaW50ZXIuYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRJbnRlcnNlY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGxldCBpbnRlcnMgPSB0aGlzLmludGVyc2VjdGlvbnMuZ2V0KGEpO1xyXG4gICAgICAgIGlmIChpbnRlcnMgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGludGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuc2V0KGEsIGludGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGludGVycy5wdXNoKHsgYTogYSwgYjogYiB9KTtcclxuICAgIH1cclxuICAgIHN0ZXBJbnRlcm5hbChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX3BoeXNPYmplY3RzKSB7XHJcbiAgICAgICAgICAgIGxldCBwaHlzID0gZW50aXR5LnBoeXNpY3M7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBlbnRpdHkucG9zaXRpb247XHJcbiAgICAgICAgICAgIGxldCB2ZWwgPSBwaHlzLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBwb3NbWF0gKz0gdmVsW1hdICogc2Vjb25kcztcclxuICAgICAgICAgICAgcG9zW1ldICs9IHZlbFtZXSAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgIGxldCBkcmFnQ29lZmYgPSBNYXRoLnBvdyhNYXRoLkUsIC1XT1JMRF9EUkFHICogcGh5cy5kcmFnICogc2Vjb25kcyk7XHJcbiAgICAgICAgICAgIHZlbFtYXSAqPSBkcmFnQ29lZmY7XHJcbiAgICAgICAgICAgIHZlbFtZXSAqPSBkcmFnQ29lZmY7XHJcbiAgICAgICAgICAgIHBoeXMudGhldGEgKz0gcGh5cy5vbWVnYSAqIHNlY29uZHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gdGhpcy5maW5kSW50ZXJzZWN0aW9ucygpO1xyXG4gICAgICAgIHRoaXMuY29ycmVjdENvbGxpc2lvbnMoaW50ZXJzZWN0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XHJcbiAgICB9XHJcbiAgICBmaW5kSW50ZXJzZWN0aW9ucygpIHtcclxuICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIHZhciBsaXN0ID0gW107XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3BoeXNPYmplY3RzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5waHlzaWNzLmNvbGxpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU29ydCBieSBsZWZ0bW9zdCBib3VuZCBvZiBjaXJjbGUuXHJcbiAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiBNYXRoLnNpZ24oKGEucG9zaXRpb25bWF0gLSBhLnBoeXNpY3MucmFkaXVzKSAtIChiLnBvc2l0aW9uW1hdIC0gYi5waHlzaWNzLnJhZGl1cykpKTtcclxuICAgICAgICAvLyBTd2VlcCBsZWZ0LXRvLXJpZ2h0IHRocm91Z2ggdGhlIGVudGl0aWVzLlxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgYSA9IGxpc3RbaV07XHJcbiAgICAgICAgICAgIGxldCByaWdodEVkZ2UgPSBhLnBvc2l0aW9uW1hdICsgYS5waHlzaWNzLnJhZGl1cztcclxuICAgICAgICAgICAgLy8gQ2hlY2sgb25seSBlbnRpdGllcyB0byB0aGUgcmlnaHQgb2YgYTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgbGlzdC5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGIgPSBsaXN0W2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGIucG9zaXRpb25bWF0gLSBiLnBoeXNpY3MucmFkaXVzID49IHJpZ2h0RWRnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGludGVyc2VjdGlvbnMgYXJlIHBvc3NpYmxlIGFmdGVyIHRoaXMuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFkU3FyID0gTWF0aC5wb3coKGEucGh5c2ljcy5yYWRpdXMgKyBiLnBoeXNpY3MucmFkaXVzKSwgMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlzdFNxciA9IGdlb18xLlBvaW50LmRpc3RTcXVhcmVkKGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3RTcXIgPCByYWRTcXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goeyBhOiBhLCBiOiBiIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xyXG4gICAgfVxyXG4gICAgY29ycmVjdENvbGxpc2lvbnMoaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgIGxldCBjb3JyZWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuICAgICAgICBmb3IgKGxldCBpIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGEgPSBpLmE7XHJcbiAgICAgICAgICAgIGxldCBiID0gaS5iO1xyXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBkaWZmZXJlbmNlIGluIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBsZXQgZGlmUCA9IGdlb18xLlBvaW50LnN1YnRyYWN0KGIucG9zaXRpb24sIGEucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpZlApO1xyXG4gICAgICAgICAgICAvLyBOb3JtYWxpemUgdGhlIGRpZmZlcmVuY2UuXHJcbiAgICAgICAgICAgIGxldCBub3JtYWwgPSBbZGlmUFtYXSAvIGxlbiwgZGlmUFtZXSAvIGxlbl07XHJcbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGRpZmZlcmVuY2UgaW4gdmVsb2NpdHkuXHJcbiAgICAgICAgICAgIGxldCBkaWZWID0gZ2VvXzEuUG9pbnQuc3VidHJhY3QoYi5waHlzaWNzLnZlbG9jaXR5LCBhLnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICBsZXQgZG90ID0gZ2VvXzEuUG9pbnQuZG90KGRpZlYsIG5vcm1hbCk7XHJcbiAgICAgICAgICAgIGxldCBib3VuY2UgPSBhLnBoeXNpY3MuYm91bmNlICogYi5waHlzaWNzLmJvdW5jZTtcclxuICAgICAgICAgICAgbGV0IGR2ID0gW25vcm1hbFtYXSAqIGRvdCAqIGJvdW5jZSwgbm9ybWFsW1ldICogZG90ICogYm91bmNlXTtcclxuICAgICAgICAgICAgbGV0IHRvdGFsTWFzcyA9IGEucGh5c2ljcy5tYXNzICsgYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGEucGh5c2ljcy52ZWxvY2l0eVtYXSArPSBkdltYXSAqIGIucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBhLnBoeXNpY3MudmVsb2NpdHlbWV0gKz0gZHZbWV0gKiBiLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgYi5waHlzaWNzLnZlbG9jaXR5W1hdIC09IGR2W1hdICogYS5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGIucGh5c2ljcy52ZWxvY2l0eVtZXSAtPSBkdltZXSAqIGEucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICAvLyBEaXNwbGFjZSB0aGUgZW50aXRpZXMgb3V0IG9mIGVhY2ggb3RoZXIuXHJcbiAgICAgICAgICAgIGxldCBjb3JBID0gY29ycmVjdGlvbnMuZ2V0KGEpO1xyXG4gICAgICAgICAgICBpZiAoY29yQSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvckEgPSB7IGQ6IFswLCAwXSwgbWFzczogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbnMuc2V0KGEsIGNvckEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBjb3JCID0gY29ycmVjdGlvbnMuZ2V0KGIpO1xyXG4gICAgICAgICAgICBpZiAoY29yQiA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvckIgPSB7IGQ6IFswLCAwXSwgbWFzczogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbnMuc2V0KGIsIGNvckIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBkaXNwbGFjZSA9IChhLnBoeXNpY3MucmFkaXVzICsgYi5waHlzaWNzLnJhZGl1cykgLSBsZW47XHJcbiAgICAgICAgICAgIGxldCBkaXNYID0gbm9ybWFsW1hdICogZGlzcGxhY2U7XHJcbiAgICAgICAgICAgIGxldCBkaXNZID0gbm9ybWFsW1ldICogZGlzcGxhY2U7XHJcbiAgICAgICAgICAgIGNvckEuZFtYXSAtPSBkaXNYICogYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckEuZFtZXSAtPSBkaXNZICogYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckEubWFzcyArPSB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGNvckIuZFtYXSArPSBkaXNYICogYS5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckIuZFtZXSArPSBkaXNZICogYS5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckIubWFzcyArPSB0b3RhbE1hc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGt2cCBvZiBjb3JyZWN0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGt2cFswXTtcclxuICAgICAgICAgICAgbGV0IGNvciA9IGt2cFsxXTtcclxuICAgICAgICAgICAgbGV0IGR4ID0gY29yLmRbWF0gLyBjb3IubWFzcyAqIDEuMDU7XHJcbiAgICAgICAgICAgIGxldCBkeSA9IGNvci5kW1ldIC8gY29yLm1hc3MgKiAxLjA1O1xyXG4gICAgICAgICAgICBlLnBvc2l0aW9uW1hdICs9IGR4O1xyXG4gICAgICAgICAgICBlLnBvc2l0aW9uW1ldICs9IGR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBoeXNpY3MgPSBQaHlzaWNzO1xyXG4oZnVuY3Rpb24gKFBoeXNpY3MpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFBoeXNpY3MuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShQaHlzaWNzID0gZXhwb3J0cy5QaHlzaWNzIHx8IChleHBvcnRzLlBoeXNpY3MgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waHlzaWNzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGJ1bGxldENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vYnVsbGV0Q29udHJvbGxlcicpO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgZ2VvXzIgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgaW5wdXRfMSA9IHJlcXVpcmUoJy4vaW5wdXQnKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBQbGF5ZXJDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBQbGF5ZXJDb250cm9sbGVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLmJ1bGxldFRpbWUgPSAwLjE7XHJcbiAgICAgICAgdGhpcy5idWxsZXRMaWZlc3BhbiA9IDQ7XHJcbiAgICAgICAgdGhpcy5idWxsZXREYW1hZ2UgPSA2O1xyXG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgICAgIHRoaXMuX2J1bGxldFRpbWVMZWZ0ID0gMDtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHtcclxuICAgICAgICAgICAgaWYgKGUucGxheWVyICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyID0gZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHtcclxuICAgICAgICAgICAgaWYgKGUgPT0gdGhpcy5wbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5yZWFwZXIuZW50aXR5S2lsbGVkLmxpc3RlbihhcmdzID0+IHtcclxuICAgICAgICAgICAgaWYgKGFyZ3Mua2lsbGVyLnBsYXllciAmJiBhcmdzLmVudGl0eS5zY29yaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3JlICs9IGFyZ3MuZW50aXR5LnNjb3JpbmcudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGlmICh0aGlzLnBsYXllciA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGR2eCA9IDA7XHJcbiAgICAgICAgbGV0IGR2eSA9IDA7XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKHRoaXMuZGVwcy5pbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuVXApKSlcclxuICAgICAgICAgICAgZHZ5IC09IDE7XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKHRoaXMuZGVwcy5pbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRG93bikpKVxyXG4gICAgICAgICAgICBkdnkgKz0gMTtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5VcExlZnQpKSkge1xyXG4gICAgICAgICAgICBkdnggLT0gZ2VvXzIuQ09TXzMwO1xyXG4gICAgICAgICAgICBkdnkgLT0gZ2VvXzIuU0lOXzMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5VcFJpZ2h0KSkpIHtcclxuICAgICAgICAgICAgZHZ4ICs9IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5IC09IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKHRoaXMuZGVwcy5pbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRG93bkxlZnQpKSkge1xyXG4gICAgICAgICAgICBkdnggLT0gZ2VvXzIuQ09TXzMwO1xyXG4gICAgICAgICAgICBkdnkgKz0gZ2VvXzIuU0lOXzMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duUmlnaHQpKSkge1xyXG4gICAgICAgICAgICBkdnggKz0gZ2VvXzIuQ09TXzMwO1xyXG4gICAgICAgICAgICBkdnkgKz0gZ2VvXzIuU0lOXzMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbGVuID0gTWF0aC5zcXJ0KE1hdGgucG93KGR2eCwgMikgKyBNYXRoLnBvdyhkdnksIDIpKTtcclxuICAgICAgICBpZiAobGVuIDw9IDAuMDUpIHtcclxuICAgICAgICAgICAgLy8gZWl0aGVyIHplcm8gb3IgdGhlcmUncyBhIHJvdW5kaW5nIGVycm9yLlxyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5zaGlwLmRpcmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkdnggLz0gbGVuO1xyXG4gICAgICAgICAgICBkdnkgLz0gbGVuO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5zaGlwLmRpcmVjdGlvbiA9IFtkdngsIGR2eV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEJ1bGxldHM6XHJcbiAgICAgICAgaWYgKHRoaXMuX2J1bGxldFRpbWVMZWZ0IDw9IDAgJiYgaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5GaXJlKSkpIHtcclxuICAgICAgICAgICAgbGV0IG5vcm1hbCA9IGdlb18xLlBvaW50LnN1YnRyYWN0KHRoaXMuZGVwcy5pbnB1dC5jdXJzb3IsIHRoaXMucGxheWVyLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGdlb18xLlBvaW50Lmxlbmd0aChub3JtYWwpO1xyXG4gICAgICAgICAgICBub3JtYWxbWF0gLz0gbGVuO1xyXG4gICAgICAgICAgICBub3JtYWxbWV0gLz0gbGVuO1xyXG4gICAgICAgICAgICBsZXQgbmV3UG9zID0gZ2VvXzEuUG9pbnQuY2xvbmUodGhpcy5wbGF5ZXIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBuZXdQb3NbWF0gKz0gbm9ybWFsW1hdICogdGhpcy5wbGF5ZXIucGh5c2ljcy5yYWRpdXMgKiAxLjU7XHJcbiAgICAgICAgICAgIG5ld1Bvc1tZXSArPSBub3JtYWxbWV0gKiB0aGlzLnBsYXllci5waHlzaWNzLnJhZGl1cyAqIDEuNTtcclxuICAgICAgICAgICAgbGV0IG5ld1ZlbCA9IGdlb18xLlBvaW50LmNsb25lKHRoaXMucGxheWVyLnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICBuZXdWZWxbWF0gKz0gbm9ybWFsW1hdICogMjAwO1xyXG4gICAgICAgICAgICBuZXdWZWxbWV0gKz0gbm9ybWFsW1ldICogMjAwO1xyXG4gICAgICAgICAgICBsZXQgbmV3QnVsbGV0ID0gYnVsbGV0Q29udHJvbGxlcl8xLkJ1bGxldENvbXBvbmVudC5jcmVhdGVCdWxsZXQobmV3UG9zLCBuZXdWZWwsIHRoaXMuYnVsbGV0RGFtYWdlLCB0aGlzLmJ1bGxldExpZmVzcGFuLCB0aGlzLnBsYXllcik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkobmV3QnVsbGV0KTtcclxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgKz0gdGhpcy5idWxsZXRUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYnVsbGV0VGltZUxlZnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1bGxldFRpbWVMZWZ0IC09IHNlY29uZHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGxheWVyQ29udHJvbGxlciA9IFBsYXllckNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoUGxheWVyQ29udHJvbGxlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMucmVhcGVyID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUGxheWVyQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFBsYXllckNvbnRyb2xsZXIgPSBleHBvcnRzLlBsYXllckNvbnRyb2xsZXIgfHwgKGV4cG9ydHMuUGxheWVyQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBsYXllckNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZXZlbnRfMSA9IHJlcXVpcmUoJy4vZXZlbnQnKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY2xhc3MgUmVhcGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBSZWFwZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2NjdXJzIHdoZW4gYW4gZW50aXR5IGlzIGtpbGxlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVudGl0eUtpbGxlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5fdG9LaWxsID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJrcyBhbiBlbnRpdHkgYXMgZGVhZC5cclxuICAgICAqIFRoZSBlbnRpdHkgd2lsbCBiZSByZW1vdmVkIHdoZW4gcmVhcCgpIGlzIGNhbGxlZC5cclxuICAgICAqIEBwYXJhbSBlbnRpdHkgVGhlIGVudGl0eSB0byBraWxsLlxyXG4gICAgICovXHJcbiAgICBraWxsRW50aXR5KGVudGl0eSwga2lsbGVyKSB7XHJcbiAgICAgICAgZW50aXR5LmlzRGVhZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fdG9LaWxsLmFkZChlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5S2lsbGVkLmVtaXQoeyBlbnRpdHk6IGVudGl0eSwga2lsbGVyOiBraWxsZXIgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgZGVhZCBlbnRpdGllcy5cclxuICAgICAqL1xyXG4gICAgcmVhcCgpIHtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3RvS2lsbCkge1xyXG4gICAgICAgICAgICBpZiAoZS5pc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5yZW1vdmVFbnRpdHkoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdG9LaWxsLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5SZWFwZXIgPSBSZWFwZXI7XHJcbihmdW5jdGlvbiAoUmVhcGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBSZWFwZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShSZWFwZXIgPSBleHBvcnRzLlJlYXBlciB8fCAoZXhwb3J0cy5SZWFwZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWFwZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgZ2VvXzIgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNsYXNzIFN0eWxlIHtcclxufVxyXG5jb25zdCBWSUVXX0hFSUdIVCA9IDc1O1xyXG5jbGFzcyBSZW5kZXJlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgUmVuZGVyZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZUZucyA9IHtcclxuICAgICAgICAgICAgJ2NpcmNsZSc6IChjdHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5hcmMoMCwgMCwgMSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2hleGFnb24nOiAoY3R4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKDAsIC0xKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oK2dlb18yLkNPU18zMCwgLWdlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKCtnZW9fMi5DT1NfMzAsICtnZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygwLCAxKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oLWdlb18yLkNPU18zMCwgK2dlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKC1nZW9fMi5DT1NfMzAsIC1nZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5kcGlTY2FsZSA9IDE7XHJcbiAgICAgICAgdGhpcy5nbG93ID0gMTA7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSB7IHBvczogWzAsIDBdLCB6b29tOiAxIH07XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyT2JqZWN0cyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUucmVuZGVyKVxyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJPYmplY3RzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9yZW5kZXJPYmplY3RzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzZXRDYW52YXMoY2FudmFzKSB7XHJcbiAgICAgICAgdGhpcy5fY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgY2FudmFzID0gY3R4LmNhbnZhcztcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiB0aGlzLmRwaVNjYWxlO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogdGhpcy5kcGlTY2FsZTtcclxuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX3JlbmRlck9iamVjdHMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5waHlzaWNzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBNQVhfQkxVUl9DT1VOVCA9IDU7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gZ2VvXzEuUG9pbnQubm9ybWFsaXplKGVudGl0eS5waHlzaWNzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgICAgIGxldCBzcGVlZCA9IGdlb18xLlBvaW50Lmxlbmd0aChlbnRpdHkucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmx1ckNvdW50ID0gTWF0aC5mbG9vcihzcGVlZCAqIHNlY29uZHMgLyBlbnRpdHkucmVuZGVyLnJhZGl1cyArIDEpO1xyXG4gICAgICAgICAgICAgICAgYmx1ckNvdW50ID0gTWF0aC5taW4oYmx1ckNvdW50LCBNQVhfQkxVUl9DT1VOVCwgZW50aXR5LnJlbmRlci5tYXhCbHVyKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmx1ckNvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZ2VvXzEuUG9pbnQuYWRkKGVudGl0eS5wb3NpdGlvbiwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAtZW50aXR5LnBoeXNpY3MudmVsb2NpdHlbWF0gKiBzZWNvbmRzICogaSAvIGJsdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLWVudGl0eS5waHlzaWNzLnZlbG9jaXR5W1ldICogc2Vjb25kcyAqIGkgLyBibHVyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbnRpdHkoZW50aXR5LCBwb3MsIE1hdGguc3FydCgxLjAgLyBibHVyQ291bnQpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcjogZGlyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWN0b3I6IHNwZWVkICogc2Vjb25kcyAvIChibHVyQ291bnQgKyAxKSAvIGVudGl0eS5yZW5kZXIucmFkaXVzICsgMSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW50aXR5KGVudGl0eSwgZW50aXR5LnBvc2l0aW9uLCAxLCBudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbmRlckVudGl0eShlLCBwb3MsIGFscGhhLCBzdHJldGNoKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICBsZXQgcmFkaXVzID0gZS5yZW5kZXIucmFkaXVzO1xyXG4gICAgICAgIGN0eC50cmFuc2xhdGUocG9zW1hdLCBwb3NbWV0pO1xyXG4gICAgICAgIGN0eC5zY2FsZShyYWRpdXMsIHJhZGl1cyk7XHJcbiAgICAgICAgaWYgKHN0cmV0Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5zdHJldGNoKHN0cmV0Y2guZGlyLCBzdHJldGNoLmZhY3Rvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLnBoeXNpY3MpIHtcclxuICAgICAgICAgICAgY3R4LnJvdGF0ZShlLnBoeXNpY3MudGhldGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3R5bGUgPSB7XHJcbiAgICAgICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgIHN0cm9rZTogZS5yZW5kZXIuY29sb3IsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogZS5yZW5kZXIubGluZVdpZHRoIC8gZS5yZW5kZXIucmFkaXVzLFxyXG4gICAgICAgICAgICBhbHBoYTogZS5yZW5kZXIuYWxwaGEgKiBhbHBoYSxcclxuICAgICAgICAgICAgZ2xvdzogZS5yZW5kZXIuZ2xvdyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGUoc3R5bGUpO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGbnNbZS5yZW5kZXIuc2hhcGVdKGN0eCk7XHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIHN0cmV0Y2goZGlyLCBmYWN0b3IpIHtcclxuICAgICAgICBsZXQgYWIgPSBbMSwgMF07XHJcbiAgICAgICAgbGV0IGFiRG90ID0gZ2VvXzEuUG9pbnQuZG90KGFiLCBkaXIpO1xyXG4gICAgICAgIGxldCBhYkFtb3VudCA9IGFiRG90ICogKGZhY3RvciAtIDEpO1xyXG4gICAgICAgIGFiW1hdICs9IGRpcltYXSAqIGFiQW1vdW50O1xyXG4gICAgICAgIGFiW1ldICs9IGRpcltZXSAqIGFiQW1vdW50O1xyXG4gICAgICAgIGxldCBiYyA9IFswLCAxXTtcclxuICAgICAgICBsZXQgYmNEb3QgPSBnZW9fMS5Qb2ludC5kb3QoYmMsIGRpcik7XHJcbiAgICAgICAgbGV0IGJjQW1vdW50ID0gYmNEb3QgKiAoZmFjdG9yIC0gMSk7XHJcbiAgICAgICAgYmNbWF0gKz0gZGlyW1hdICogYmNBbW91bnQ7XHJcbiAgICAgICAgYmNbWV0gKz0gZGlyW1ldICogYmNBbW91bnQ7XHJcbiAgICAgICAgdGhpcy5fY29udGV4dC50cmFuc2Zvcm0oYWJbWF0sIGFiW1ldLCBiY1tYXSwgYmNbWV0sIDAsIDApO1xyXG4gICAgfVxyXG4gICAgc2V0VHJhbnNmb3JtKCkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGxldCBzY2FsZSA9IHRoaXMuY2FtZXJhLnpvb20gKiBjdHguY2FudmFzLmhlaWdodCAvIFZJRVdfSEVJR0hUO1xyXG4gICAgICAgIGxldCBkeCA9IC10aGlzLmNhbWVyYS5wb3NbWF0gKiBzY2FsZSArIGN0eC5jYW52YXMud2lkdGggLyAyO1xyXG4gICAgICAgIGxldCBkeSA9IC10aGlzLmNhbWVyYS5wb3NbWV0gKiBzY2FsZSArIGN0eC5jYW52YXMuaGVpZ2h0IC8gMjtcclxuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKHNjYWxlLCAwLCAwLCBzY2FsZSwgZHgsIGR5KTtcclxuICAgIH1cclxuICAgIGRyYXdDaXJjbGUoY2VudGVyLCByYWRpdXMsIHN0eWxlKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5zZXRTdHlsZShzdHlsZSk7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmMoY2VudGVyW1hdLCBjZW50ZXJbWV0sIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgc2V0U3R5bGUoc3R5bGUpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gc3R5bGUuZmlsbDtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHlsZS5zdHJva2U7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5hbHBoYTtcclxuICAgICAgICBpZiAoc3R5bGUuZ2xvdyA+IDApIHtcclxuICAgICAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gc3R5bGUuc3Ryb2tlO1xyXG4gICAgICAgICAgICBjdHguc2hhZG93Qmx1ciA9IDEwICogc3R5bGUuZ2xvdztcclxuICAgICAgICAgICAgY3R4LnNoYWRvd09mZnNldFggPSAwO1xyXG4gICAgICAgICAgICBjdHguc2hhZG93T2Zmc2V0WSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2NyZWVuVG9Xb3JsZChwKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgbGV0IHggPSBwW1hdO1xyXG4gICAgICAgIGxldCB5ID0gcFtZXTtcclxuICAgICAgICB4IC09IGN0eC5jYW52YXMuY2xpZW50V2lkdGggLyAyO1xyXG4gICAgICAgIHkgLT0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgLyAyO1xyXG4gICAgICAgIGxldCBmYWMgPSBWSUVXX0hFSUdIVCAvIGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHggKj0gZmFjO1xyXG4gICAgICAgIHkgKj0gZmFjO1xyXG4gICAgICAgIHJldHVybiBbeCwgeV07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5SZW5kZXJlciA9IFJlbmRlcmVyO1xyXG4oZnVuY3Rpb24gKFJlbmRlcmVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBSZW5kZXJlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFJlbmRlcmVyID0gZXhwb3J0cy5SZW5kZXJlciB8fCAoZXhwb3J0cy5SZW5kZXJlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlcmVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIHBhcnRpY2xlQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9wYXJ0aWNsZUNvbnRyb2xsZXInKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBTaGlwQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgU2hpcENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5fc2hpcHMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLnNoaXApXHJcbiAgICAgICAgICAgIHRoaXMuX3NoaXBzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9zaGlwcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLl9zaGlwcykge1xyXG4gICAgICAgICAgICBpZiAoZS5pc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlLnNoaXAuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZBbW91bnQgPSBlLnNoaXAuYWNjZWwgKiBzZWNvbmRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGR2eCA9IGUuc2hpcC5kaXJlY3Rpb25bWF0gKiBkdkFtb3VudDtcclxuICAgICAgICAgICAgICAgIGxldCBkdnkgPSBlLnNoaXAuZGlyZWN0aW9uW1ldICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHlbWF0gKz0gZHZ4O1xyXG4gICAgICAgICAgICAgICAgZS5waHlzaWNzLnZlbG9jaXR5W1ldICs9IGR2eTtcclxuICAgICAgICAgICAgICAgIC8vIGV4aGF1c3Q6XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5zaGlwLmV4aGF1c3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZXhoYXVzdCA9IGUuc2hpcC5leGhhdXN0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9iYWJsZUFtb3VudCA9IGV4aGF1c3QucmF0ZSAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHVhbEFtb3VudDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvYmFibGVBbW91bnQgPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEFtb3VudCA9IE1hdGgucmFuZG9tKCkgPCBwcm9iYWJsZUFtb3VudCA/IDEgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQW1vdW50ID0gTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiBwcm9iYWJsZUFtb3VudCAqIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcFNwZWVkID0gZS5zaGlwLmFjY2VsICogZS5waHlzaWNzLm1hc3MgLyBleGhhdXN0Lm1hc3MgLyBleGhhdXN0LnJhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3R1YWxBbW91bnQ7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3BlZWRGYWN0b3IgPSBNYXRoLnJhbmRvbSgpICogMC41ICsgMC43NTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB2eCA9IChlLnNoaXAuZGlyZWN0aW9uW1hdICogLXBTcGVlZCAqIHNwZWVkRmFjdG9yKSArIGUucGh5c2ljcy52ZWxvY2l0eVtYXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB2eSA9IChlLnNoaXAuZGlyZWN0aW9uW1ldICogLXBTcGVlZCAqIHNwZWVkRmFjdG9yKSArIGUucGh5c2ljcy52ZWxvY2l0eVtZXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB4ID0gZS5wb3NpdGlvbltYXSAtIGUuc2hpcC5kaXJlY3Rpb25bWF0gKiBlLnBoeXNpY3MucmFkaXVzICogMS4yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHkgPSBlLnBvc2l0aW9uW1ldIC0gZS5zaGlwLmRpcmVjdGlvbltZXSAqIGUucGh5c2ljcy5yYWRpdXMgKiAxLjI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkocGFydGljbGVDb250cm9sbGVyXzEuUGFydGljbGVDb21wb25lbnQuY3JlYXRlUGFydGljbGUoW3B4LCBweV0sIFtwdngsIHB2eV0sIGUucmVuZGVyLmNvbG9yLCBleGhhdXN0Lm1hc3MsIGV4aGF1c3QucmFkaXVzLCAwLjMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5TaGlwQ29udHJvbGxlciA9IFNoaXBDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKFNoaXBDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBTaGlwQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFNoaXBDb250cm9sbGVyID0gZXhwb3J0cy5TaGlwQ29udHJvbGxlciB8fCAoZXhwb3J0cy5TaGlwQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNoaXBDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIFN5c3RlbTtcclxuKGZ1bmN0aW9uIChTeXN0ZW0pIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyB7XHJcbiAgICB9XHJcbiAgICBTeXN0ZW0uRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUb3BvbG9naWNhbGx5IHNvcnQgdGhlIHN5c3RlbXMgYmFzZWQgb24gdGhlaXIgZGVwZW5kZW5jaWVzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0T3JkZXIoc3lzT2JqZWN0KSB7XHJcbiAgICAgICAgbGV0IHN5c3RlbXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBzeXNPYmplY3QpIHtcclxuICAgICAgICAgICAgc3lzdGVtcy5hZGQobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvcmRlciA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChzeXN0ZW1zLnNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0SXRlbSA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgb2Ygc3lzdGVtcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN5cyA9IHN5c09iamVjdFtuYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXBlbmRzT25TZXQoc3lzLmRlcHMsIHN5c3RlbXMpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHN5cyBkb2Vzbid0IGRlcGVuZCBvbiBhbnl0aGluZyBzdGlsbCBpbiBzeXN0ZW1zO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IG11c3QgYmUgdGhlIG5leHQgaW4gdGhlIG9yZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgIG5leHRJdGVtID0gW25hbWUsIHN5c107XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5leHRJdGVtID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIEN5Y2xpYyBkZXBlbmRlbmN5P1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3lzdGVtcy5kZWxldGUobmV4dEl0ZW1bMF0pO1xyXG4gICAgICAgICAgICBvcmRlci5wdXNoKG5leHRJdGVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9yZGVyO1xyXG4gICAgfVxyXG4gICAgU3lzdGVtLmluaXRPcmRlciA9IGluaXRPcmRlcjtcclxuICAgIGZ1bmN0aW9uIGRlcGVuZHNPblNldChkZXBzLCBzeXN0ZW1zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBkZXBzKSB7XHJcbiAgICAgICAgICAgIGlmIChzeXN0ZW1zLmhhcyhuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5pdFN5c3RlbXMoc3lzT2JqZWN0KSB7XHJcbiAgICAgICAgbGV0IG9yZGVyID0gaW5pdE9yZGVyKHN5c09iamVjdCk7XHJcbiAgICAgICAgaWYgKG9yZGVyID09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gVHNvcnQgaGFzIGZhaWxlZC4gQWJvcnQuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgcGFpciBvZiBvcmRlcikge1xyXG4gICAgICAgICAgICBsZXQgc3lzID0gcGFpclsxXTtcclxuICAgICAgICAgICAgLy8gRmlsbCBpbiB0aGUgZGVwZW5kZW5jaWVzLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lIGluIHN5cy5kZXBzKSB7XHJcbiAgICAgICAgICAgICAgICBzeXMuZGVwc1tuYW1lXSA9IHN5c09iamVjdFtuYW1lXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzeXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFN5c3RlbS5pbml0U3lzdGVtcyA9IGluaXRTeXN0ZW1zO1xyXG59KShTeXN0ZW0gPSBleHBvcnRzLlN5c3RlbSB8fCAoZXhwb3J0cy5TeXN0ZW0gPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zeXN0ZW0uanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZW5lbXlDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2VuZW15Q29udHJvbGxlcicpO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBXQVZFX1BFUklPRCA9IDM7XHJcbmNvbnN0IEdFTl9SQURJVVMgPSAyMDA7XHJcbmNsYXNzIFdhdmVHZW5lcmF0b3Ige1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFdhdmVHZW5lcmF0b3IuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuX3dhdmVUaW1lID0gV0FWRV9QRVJJT0Q7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBpZiAodGhpcy5fd2F2ZVRpbWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlcHMuZW5lbXlDb250cm9sbGVyLmVuZW1pZXMuc2l6ZSA8PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVdhdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl93YXZlVGltZSArPSBXQVZFX1BFUklPRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2F2ZVRpbWUgLT0gc2Vjb25kcztcclxuICAgIH1cclxuICAgIGdlbmVyYXRlV2F2ZSgpIHtcclxuICAgICAgICBsZXQgZm9sbG93ZXJzID0gMTI7XHJcbiAgICAgICAgbGV0IHRhbmtzID0gMjtcclxuICAgICAgICBsZXQgc2Vla2VycyA9IDg7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb2xsb3dlcnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgcCA9IGdlb18xLmdlby5tYXRoLnJhbmRDaXJjbGUoZ2VvXzEuUG9pbnQuemVybygpLCBHRU5fUkFESVVTKTtcclxuICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eShlbmVteUNvbnRyb2xsZXJfMS5FbmVteUNvbXBvbmVudC5jcmVhdGVGb2xsb3dlcihwLCBnZW9fMS5Qb2ludC56ZXJvKCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YW5rczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KGVuZW15Q29udHJvbGxlcl8xLkVuZW15Q29tcG9uZW50LmNyZWF0ZVRhbmsocCwgZ2VvXzEuUG9pbnQuemVybygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vla2VyczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KGVuZW15Q29udHJvbGxlcl8xLkVuZW15Q29tcG9uZW50LmNyZWF0ZVNlZWtlcihwLCBnZW9fMS5Qb2ludC56ZXJvKCkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5XYXZlR2VuZXJhdG9yID0gV2F2ZUdlbmVyYXRvcjtcclxuKGZ1bmN0aW9uIChXYXZlR2VuZXJhdG9yKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW15Q29udHJvbGxlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFdhdmVHZW5lcmF0b3IuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShXYXZlR2VuZXJhdG9yID0gZXhwb3J0cy5XYXZlR2VuZXJhdG9yIHx8IChleHBvcnRzLldhdmVHZW5lcmF0b3IgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD13YXZlR2VuZXJhdG9yLmpzLm1hcCJdfQ==
