(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
var BulletComponent;
(function (BulletComponent) {
    function createBullet(options) {
        return {
            physics: {
                velocity: options.vel,
                radius: 0.6,
                bounce: 1,
                drag: 0.125,
                theta: 0,
                omega: 0,
                mass: 0.5,
                collide: true,
            },
            position: options.pos,
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
                damage: options.damage,
                isAlive: true,
                source: options.source,
            },
            particle: {
                lifespan: options.lifespan,
                timeRemaining: options.lifespan,
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

},{"./system":20}],2:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./enemies/enemyBehavior'));
__export(require('./enemies/enemyComponent'));
__export(require('./enemies/enemyController'));

},{"./enemies/enemyBehavior":3,"./enemies/enemyComponent":4,"./enemies/enemyController":5}],3:[function(require,module,exports){
'use strict';
var geo_1 = require('../geo');
var geo_2 = require('../geo');
var geo = require('../geo');
const X = 0;
const Y = 1;
(function (EnemyBehavior) {
    EnemyBehavior[EnemyBehavior["Follow"] = 0] = "Follow";
    EnemyBehavior[EnemyBehavior["Circle"] = 1] = "Circle";
})(exports.EnemyBehavior || (exports.EnemyBehavior = {}));
var EnemyBehavior = exports.EnemyBehavior;
var EnemyBehavior;
(function (EnemyBehavior) {
    (function (CircleDirection) {
        CircleDirection[CircleDirection["Clockwise"] = 0] = "Clockwise";
        CircleDirection[CircleDirection["Counter"] = 1] = "Counter";
    })(EnemyBehavior.CircleDirection || (EnemyBehavior.CircleDirection = {}));
    var CircleDirection = EnemyBehavior.CircleDirection;
    const circleMatrices = {
        // -30 degrees
        [CircleDirection.Clockwise]: [
            [geo.COS_30, geo.SIN_30],
            [-geo.SIN_30, geo.COS_30],
        ],
        // 30 degrees
        [CircleDirection.Counter]: [
            [geo.COS_30, -geo.SIN_30],
            [geo.SIN_30, geo.COS_30],
        ],
    };
    const behaviorMap = {
        [EnemyBehavior.Follow]: (e, sys) => {
            let player = sys.deps.playerController.player;
            if (player) {
                let dir = geo_1.Point.normalize(geo_1.Point.subtract(player.position, e.position));
                e.ship.direction = dir;
            }
            else {
                e.ship.direction = null;
            }
        },
        [EnemyBehavior.Circle]: (e, sys) => {
            let player = sys.deps.playerController.player;
            let data = e.enemy.data;
            if (player) {
                // Find the normalized direction from player to enemy
                let normal = geo_1.Point.normalize(geo_1.Point.subtract(e.position, player.position));
                let target = geo_2.Matrix.pointMul(circleMatrices[data.direction], normal);
                target[X] = target[X] * data.radius + player.position[X];
                target[Y] = target[Y] * data.radius + player.position[Y];
                let dir = geo_1.Point.normalize(geo_1.Point.subtract(target, e.position));
                e.ship.direction = dir;
            }
            else {
                e.ship.direction = null;
            }
        },
    };
    function getBehaviorFunction(mode) {
        return behaviorMap[mode];
    }
    EnemyBehavior.getBehaviorFunction = getBehaviorFunction;
})(EnemyBehavior = exports.EnemyBehavior || (exports.EnemyBehavior = {}));

},{"../geo":9}],4:[function(require,module,exports){
'use strict';
var enemyBehavior_1 = require('./enemyBehavior');
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
            enemy: {
                mode: enemyBehavior_1.EnemyBehavior.Circle,
                data: {
                    radius: 2,
                    direction: enemyBehavior_1.EnemyBehavior.CircleDirection.Counter,
                },
            },
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
            enemy: {
                mode: enemyBehavior_1.EnemyBehavior.Circle,
                data: {
                    radius: 15,
                    direction: enemyBehavior_1.EnemyBehavior.CircleDirection.Counter,
                },
            },
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
            enemy: {
                mode: enemyBehavior_1.EnemyBehavior.Circle,
                data: {
                    radius: 6,
                    direction: enemyBehavior_1.EnemyBehavior.CircleDirection.Clockwise,
                },
            },
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

},{"./enemyBehavior":3}],5:[function(require,module,exports){
'use strict';
var system_1 = require('../system');
var enemyBehavior_1 = require('./enemyBehavior');
const X = 0;
const Y = 1;
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
            enemyBehavior_1.EnemyBehavior.getBehaviorFunction(e.enemy.mode)(e, this);
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

},{"../system":20,"./enemyBehavior":3}],6:[function(require,module,exports){
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

},{"./event":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var enemies_1 = require('./enemies');
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
            this.enemyController = new enemies_1.EnemyController();
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

},{"./bulletController":1,"./enemies":2,"./entityContainer":6,"./healthController":10,"./hud":11,"./input":13,"./particleController":14,"./physics":15,"./playerController":16,"./reaper":17,"./renderer":18,"./shipController":19,"./system":20,"./waveGenerator":21}],9:[function(require,module,exports){
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
var Matrix;
(function (Matrix) {
    function mul(a, b) {
        let vecX = pointMul(a, [b[X][X], b[Y][X]]);
        let vecY = pointMul(a, [b[X][Y], b[Y][Y]]);
        return [
            [vecX[X], vecY[X]],
            [vecX[Y], vecY[Y]],
        ];
    }
    Matrix.mul = mul;
    function pointMul(a, b) {
        return [
            Point.dot(a[X], b),
            Point.dot(a[Y], b),
        ];
    }
    Matrix.pointMul = pointMul;
})(Matrix = exports.Matrix || (exports.Matrix = {}));
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

},{}],10:[function(require,module,exports){
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

},{"./system":20}],11:[function(require,module,exports){
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

},{"./geo":9,"./system":20}],12:[function(require,module,exports){
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

},{"./game":8,"./input":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./system":20}],15:[function(require,module,exports){
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

},{"./geo":9,"./system":20}],16:[function(require,module,exports){
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
            let newBullet = bulletController_1.BulletComponent.createBullet({
                source: this.player,
                pos: newPos,
                vel: newVel,
                damage: this.bulletDamage,
                lifespan: this.bulletLifespan,
            });
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

},{"./bulletController":1,"./geo":9,"./input":13,"./system":20}],17:[function(require,module,exports){
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

},{"./event":7,"./system":20}],18:[function(require,module,exports){
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

},{"./geo":9,"./system":20}],19:[function(require,module,exports){
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

},{"./particleController":14,"./system":20}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
'use strict';
var enemies_1 = require('./enemies');
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
            this.deps.entities.addEntity(enemies_1.EnemyComponent.createFollower(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < tanks; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemies_1.EnemyComponent.createTank(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < seekers; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemies_1.EnemyComponent.createSeeker(p, geo_1.Point.zero()));
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

},{"./enemies":2,"./geo":9,"./system":20}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnVsbGV0Q29udHJvbGxlci5qcyIsImJpbi9lbmVtaWVzLmpzIiwiYmluL2VuZW1pZXMvZW5lbXlCZWhhdmlvci5qcyIsImJpbi9lbmVtaWVzL2VuZW15Q29tcG9uZW50LmpzIiwiYmluL2VuZW1pZXMvZW5lbXlDb250cm9sbGVyLmpzIiwiYmluL2VudGl0eUNvbnRhaW5lci5qcyIsImJpbi9ldmVudC5qcyIsImJpbi9nYW1lLmpzIiwiYmluL2dlby5qcyIsImJpbi9oZWFsdGhDb250cm9sbGVyLmpzIiwiYmluL2h1ZC5qcyIsImJpbi9pbmRleC5qcyIsImJpbi9pbnB1dC5qcyIsImJpbi9wYXJ0aWNsZUNvbnRyb2xsZXIuanMiLCJiaW4vcGh5c2ljcy5qcyIsImJpbi9wbGF5ZXJDb250cm9sbGVyLmpzIiwiYmluL3JlYXBlci5qcyIsImJpbi9yZW5kZXJlci5qcyIsImJpbi9zaGlwQ29udHJvbGxlci5qcyIsImJpbi9zeXN0ZW0uanMiLCJiaW4vd2F2ZUdlbmVyYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbnZhciBCdWxsZXRDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoQnVsbGV0Q29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVCdWxsZXQob3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiBvcHRpb25zLnZlbCxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC42LFxyXG4gICAgICAgICAgICAgICAgYm91bmNlOiAxLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC4xMjUsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogMC41LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcG9zaXRpb246IG9wdGlvbnMucG9zLFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzQwQTBGRicsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC40LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiA1LFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYnVsbGV0OiB7XHJcbiAgICAgICAgICAgICAgICBkYW1hZ2U6IG9wdGlvbnMuZGFtYWdlLFxyXG4gICAgICAgICAgICAgICAgaXNBbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogb3B0aW9ucy5zb3VyY2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhcnRpY2xlOiB7XHJcbiAgICAgICAgICAgICAgICBsaWZlc3Bhbjogb3B0aW9ucy5saWZlc3BhbixcclxuICAgICAgICAgICAgICAgIHRpbWVSZW1haW5pbmc6IG9wdGlvbnMubGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICBjb3VudDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIEJ1bGxldENvbXBvbmVudC5jcmVhdGVCdWxsZXQgPSBjcmVhdGVCdWxsZXQ7XHJcbn0pKEJ1bGxldENvbXBvbmVudCA9IGV4cG9ydHMuQnVsbGV0Q29tcG9uZW50IHx8IChleHBvcnRzLkJ1bGxldENvbXBvbmVudCA9IHt9KSk7XHJcbmNsYXNzIEJ1bGxldENvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IEJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5fYnVsbGV0cyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuYnVsbGV0KVxyXG4gICAgICAgICAgICB0aGlzLl9idWxsZXRzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9idWxsZXRzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHRoaXMuZGVwcy5waHlzaWNzLmludGVyc2VjdGlvbnM7XHJcbiAgICAgICAgZm9yIChsZXQgYiBvZiB0aGlzLl9idWxsZXRzKSB7XHJcbiAgICAgICAgICAgIGlmIChiLmJ1bGxldC5pc0FsaXZlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW50ZXJzID0gaW50ZXJzZWN0aW9ucy5nZXQoYik7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzICYmIGludGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSBvZiBpbnRlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG90aGVyID0gaS5iO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXIuaGVhbHRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcHMuaGVhbHRoQ29udHJvbGxlci5kYW1hZ2VFbnRpdHkob3RoZXIsIGIuYnVsbGV0LmRhbWFnZSwgYi5idWxsZXQuc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIuYnVsbGV0LmlzQWxpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYi5yZW5kZXIuY29sb3IgPSBcIiM4MDgwODBcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSBCdWxsZXRDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKEJ1bGxldENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aENvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShCdWxsZXRDb250cm9sbGVyID0gZXhwb3J0cy5CdWxsZXRDb250cm9sbGVyIHx8IChleHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWxsZXRDb250cm9sbGVyLmpzLm1hcCIsImZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5fX2V4cG9ydChyZXF1aXJlKCcuL2VuZW1pZXMvZW5lbXlCZWhhdmlvcicpKTtcclxuX19leHBvcnQocmVxdWlyZSgnLi9lbmVtaWVzL2VuZW15Q29tcG9uZW50JykpO1xyXG5fX2V4cG9ydChyZXF1aXJlKCcuL2VuZW1pZXMvZW5lbXlDb250cm9sbGVyJykpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVtaWVzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4uL2dlbycpO1xyXG52YXIgZ2VvID0gcmVxdWlyZSgnLi4vZ2VvJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuKGZ1bmN0aW9uIChFbmVteUJlaGF2aW9yKSB7XHJcbiAgICBFbmVteUJlaGF2aW9yW0VuZW15QmVoYXZpb3JbXCJGb2xsb3dcIl0gPSAwXSA9IFwiRm9sbG93XCI7XHJcbiAgICBFbmVteUJlaGF2aW9yW0VuZW15QmVoYXZpb3JbXCJDaXJjbGVcIl0gPSAxXSA9IFwiQ2lyY2xlXCI7XHJcbn0pKGV4cG9ydHMuRW5lbXlCZWhhdmlvciB8fCAoZXhwb3J0cy5FbmVteUJlaGF2aW9yID0ge30pKTtcclxudmFyIEVuZW15QmVoYXZpb3IgPSBleHBvcnRzLkVuZW15QmVoYXZpb3I7XHJcbnZhciBFbmVteUJlaGF2aW9yO1xyXG4oZnVuY3Rpb24gKEVuZW15QmVoYXZpb3IpIHtcclxuICAgIChmdW5jdGlvbiAoQ2lyY2xlRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgQ2lyY2xlRGlyZWN0aW9uW0NpcmNsZURpcmVjdGlvbltcIkNsb2Nrd2lzZVwiXSA9IDBdID0gXCJDbG9ja3dpc2VcIjtcclxuICAgICAgICBDaXJjbGVEaXJlY3Rpb25bQ2lyY2xlRGlyZWN0aW9uW1wiQ291bnRlclwiXSA9IDFdID0gXCJDb3VudGVyXCI7XHJcbiAgICB9KShFbmVteUJlaGF2aW9yLkNpcmNsZURpcmVjdGlvbiB8fCAoRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24gPSB7fSkpO1xyXG4gICAgdmFyIENpcmNsZURpcmVjdGlvbiA9IEVuZW15QmVoYXZpb3IuQ2lyY2xlRGlyZWN0aW9uO1xyXG4gICAgY29uc3QgY2lyY2xlTWF0cmljZXMgPSB7XHJcbiAgICAgICAgLy8gLTMwIGRlZ3JlZXNcclxuICAgICAgICBbQ2lyY2xlRGlyZWN0aW9uLkNsb2Nrd2lzZV06IFtcclxuICAgICAgICAgICAgW2dlby5DT1NfMzAsIGdlby5TSU5fMzBdLFxyXG4gICAgICAgICAgICBbLWdlby5TSU5fMzAsIGdlby5DT1NfMzBdLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgLy8gMzAgZGVncmVlc1xyXG4gICAgICAgIFtDaXJjbGVEaXJlY3Rpb24uQ291bnRlcl06IFtcclxuICAgICAgICAgICAgW2dlby5DT1NfMzAsIC1nZW8uU0lOXzMwXSxcclxuICAgICAgICAgICAgW2dlby5TSU5fMzAsIGdlby5DT1NfMzBdLFxyXG4gICAgICAgIF0sXHJcbiAgICB9O1xyXG4gICAgY29uc3QgYmVoYXZpb3JNYXAgPSB7XHJcbiAgICAgICAgW0VuZW15QmVoYXZpb3IuRm9sbG93XTogKGUsIHN5cykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyID0gc3lzLmRlcHMucGxheWVyQ29udHJvbGxlci5wbGF5ZXI7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBnZW9fMS5Qb2ludC5ub3JtYWxpemUoZ2VvXzEuUG9pbnQuc3VidHJhY3QocGxheWVyLnBvc2l0aW9uLCBlLnBvc2l0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gZGlyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5zaGlwLmRpcmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFtFbmVteUJlaGF2aW9yLkNpcmNsZV06IChlLCBzeXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IHN5cy5kZXBzLnBsYXllckNvbnRyb2xsZXIucGxheWVyO1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGUuZW5lbXkuZGF0YTtcclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgbm9ybWFsaXplZCBkaXJlY3Rpb24gZnJvbSBwbGF5ZXIgdG8gZW5lbXlcclxuICAgICAgICAgICAgICAgIGxldCBub3JtYWwgPSBnZW9fMS5Qb2ludC5ub3JtYWxpemUoZ2VvXzEuUG9pbnQuc3VidHJhY3QoZS5wb3NpdGlvbiwgcGxheWVyLnBvc2l0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZ2VvXzIuTWF0cml4LnBvaW50TXVsKGNpcmNsZU1hdHJpY2VzW2RhdGEuZGlyZWN0aW9uXSwgbm9ybWFsKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldFtYXSA9IHRhcmdldFtYXSAqIGRhdGEucmFkaXVzICsgcGxheWVyLnBvc2l0aW9uW1hdO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W1ldID0gdGFyZ2V0W1ldICogZGF0YS5yYWRpdXMgKyBwbGF5ZXIucG9zaXRpb25bWV07XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gZ2VvXzEuUG9pbnQubm9ybWFsaXplKGdlb18xLlBvaW50LnN1YnRyYWN0KHRhcmdldCwgZS5wb3NpdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgZS5zaGlwLmRpcmVjdGlvbiA9IGRpcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBnZXRCZWhhdmlvckZ1bmN0aW9uKG1vZGUpIHtcclxuICAgICAgICByZXR1cm4gYmVoYXZpb3JNYXBbbW9kZV07XHJcbiAgICB9XHJcbiAgICBFbmVteUJlaGF2aW9yLmdldEJlaGF2aW9yRnVuY3Rpb24gPSBnZXRCZWhhdmlvckZ1bmN0aW9uO1xyXG59KShFbmVteUJlaGF2aW9yID0gZXhwb3J0cy5FbmVteUJlaGF2aW9yIHx8IChleHBvcnRzLkVuZW15QmVoYXZpb3IgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVteUJlaGF2aW9yLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGVuZW15QmVoYXZpb3JfMSA9IHJlcXVpcmUoJy4vZW5lbXlCZWhhdmlvcicpO1xyXG52YXIgRW5lbXlDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoRW5lbXlDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZvbGxvd2VyKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNGRjgwMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMixcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuZW15OiB7XHJcbiAgICAgICAgICAgICAgICBtb2RlOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZW5lbXlCZWhhdmlvcl8xLkVuZW15QmVoYXZpb3IuQ2lyY2xlRGlyZWN0aW9uLkNvdW50ZXIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGlwOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlbDogMTAwLFxyXG4gICAgICAgICAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGU6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogMS41LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMC40LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGVhbHRoOiB7XHJcbiAgICAgICAgICAgICAgICBocDogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogMTAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjb3Jpbmc6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAxMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBlO1xyXG4gICAgfVxyXG4gICAgRW5lbXlDb21wb25lbnQuY3JlYXRlRm9sbG93ZXIgPSBjcmVhdGVGb2xsb3dlcjtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRhbmsocG9zLCB2ZWwpIHtcclxuICAgICAgICBsZXQgZSA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHZlbCxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMyxcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNCxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiA5LFxyXG4gICAgICAgICAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNEMDAwMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDMsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDIsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAxLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbmVteToge1xyXG4gICAgICAgICAgICAgICAgbW9kZTogZW5lbXlCZWhhdmlvcl8xLkVuZW15QmVoYXZpb3IuQ2lyY2xlLFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24uQ291bnRlcixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoaXA6IHtcclxuICAgICAgICAgICAgICAgIGFjY2VsOiA4MCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoZWFsdGg6IHtcclxuICAgICAgICAgICAgICAgIGhwOiAzMCxcclxuICAgICAgICAgICAgICAgIG1heEhwOiAzMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NvcmluZzoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IDIwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVUYW5rID0gY3JlYXRlVGFuaztcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNlZWtlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC4yNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzgwRkYwMCcsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC45LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAzLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHtcclxuICAgICAgICAgICAgICAgIG1vZGU6IGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLkNpcmNsZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDYsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24uQ2xvY2t3aXNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDE1MCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiA1LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAwLjQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoZWFsdGg6IHtcclxuICAgICAgICAgICAgICAgIGhwOiA1LFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjb3Jpbmc6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiA1LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVTZWVrZXIgPSBjcmVhdGVTZWVrZXI7XHJcbn0pKEVuZW15Q29tcG9uZW50ID0gZXhwb3J0cy5FbmVteUNvbXBvbmVudCB8fCAoZXhwb3J0cy5FbmVteUNvbXBvbmVudCA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuZW15Q29tcG9uZW50LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi4vc3lzdGVtJyk7XHJcbnZhciBlbmVteUJlaGF2aW9yXzEgPSByZXF1aXJlKCcuL2VuZW15QmVoYXZpb3InKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBFbmVteUNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IEVuZW15Q29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLmVuZW1pZXMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLmVuZW15KVxyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuZW5lbWllcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgbGV0IHBsYXllciA9IHRoaXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnBsYXllcjtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuZW5lbWllcykge1xyXG4gICAgICAgICAgICBpZiAoZS5pc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLmdldEJlaGF2aW9yRnVuY3Rpb24oZS5lbmVteS5tb2RlKShlLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FbmVteUNvbnRyb2xsZXIgPSBFbmVteUNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoRW5lbXlDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShFbmVteUNvbnRyb2xsZXIgPSBleHBvcnRzLkVuZW15Q29udHJvbGxlciB8fCAoZXhwb3J0cy5FbmVteUNvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVteUNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZXZlbnRfMSA9IHJlcXVpcmUoJy4vZXZlbnQnKTtcclxuY2xhc3MgRW50aXR5Q29udGFpbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IHt9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9jY3VycyBhZnRlciBhbiBlbnRpdHkgaXMgYWRkZWQgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAgICAgKiBhcmc6IFRoZSBlbnRpdHkgdGhhdCB3YXMgYWRkZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbnRpdHlBZGRlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2NjdXJzIGFmdGVyIGFuIGVudGl0eSBpcyByZW1vdmVkIGZyb20gdGhlIGNvbnRhaW5lci5cclxuICAgICAgICAgKiBhcmc6IFRoZSBlbnRpdHkgdGhhdCB3YXMgcmVtb3ZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVudGl0eVJlbW92ZWQgPSBuZXcgZXZlbnRfMS5FdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuX25leHRJZCA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5kZXggPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkgeyB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gZW50aXR5IHRvIHRoZSBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0gZW50aXR5IFRoZSBlbnRpdHkgdG8gYWRkLlxyXG4gICAgICovXHJcbiAgICBhZGRFbnRpdHkoZW50aXR5KSB7XHJcbiAgICAgICAgZW50aXR5LmlkID0gKyt0aGlzLl9uZXh0SWQ7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMuYWRkKGVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5faW5kZXguc2V0KGVudGl0eS5pZCwgZW50aXR5KTtcclxuICAgICAgICB0aGlzLmVudGl0eUFkZGVkLmVtaXQoZW50aXR5KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBlbnRpdHkgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGVudGl0eSBUaGUgZW50aXR5IHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRW50aXR5KGVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzLmRlbGV0ZShlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuX2luZGV4LmRlbGV0ZShlbnRpdHkuaWQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5UmVtb3ZlZC5lbWl0KGVudGl0eSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBhbiBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXHJcbiAgICAgKiBAcGFyYW0gaWQgVGhlIGlkIG9mIHRoZSBlbnRpdHkgdG8gcmV0cmlldmUuXHJcbiAgICAgKi9cclxuICAgIGdldEJ5SWQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5kZXguZ2V0KGlkKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkVudGl0eUNvbnRhaW5lciA9IEVudGl0eUNvbnRhaW5lcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW50aXR5Q29udGFpbmVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuY2xhc3MgRXZlbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gW107XHJcbiAgICB9XHJcbiAgICBlbWl0KHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpc3RlbmVycy5tYXAobCA9PiBsKHZhbHVlKSk7XHJcbiAgICB9XHJcbiAgICBlbWl0QXN5bmModmFsdWUpIHtcclxuICAgICAgICBsZXQgcmVzdWx0cyA9IHRoaXMuZW1pdCh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdHMubWFwKHYgPT4gdiAmJiB2LnRoZW4gPyB2IDogUHJvbWlzZS5yZXNvbHZlKHYpKSk7XHJcbiAgICB9XHJcbiAgICBsaXN0ZW4obGlzdGVuZXIpIHtcclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FdmVudCA9IEV2ZW50O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldmVudC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBidWxsZXRDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2J1bGxldENvbnRyb2xsZXInKTtcclxudmFyIGVuZW1pZXNfMSA9IHJlcXVpcmUoJy4vZW5lbWllcycpO1xyXG52YXIgZW50aXR5Q29udGFpbmVyXzEgPSByZXF1aXJlKCcuL2VudGl0eUNvbnRhaW5lcicpO1xyXG52YXIgaGVhbHRoQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9oZWFsdGhDb250cm9sbGVyJyk7XHJcbnZhciBodWRfMSA9IHJlcXVpcmUoJy4vaHVkJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG52YXIgcGh5c2ljc18xID0gcmVxdWlyZSgnLi9waHlzaWNzJyk7XHJcbnZhciBwYXJ0aWNsZUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vcGFydGljbGVDb250cm9sbGVyJyk7XHJcbnZhciBwbGF5ZXJDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL3BsYXllckNvbnRyb2xsZXInKTtcclxudmFyIHJlYXBlcl8xID0gcmVxdWlyZSgnLi9yZWFwZXInKTtcclxudmFyIHJlbmRlcmVyXzEgPSByZXF1aXJlKCcuL3JlbmRlcmVyJyk7XHJcbnZhciBzaGlwQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9zaGlwQ29udHJvbGxlcicpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG52YXIgd2F2ZUdlbmVyYXRvcl8xID0gcmVxdWlyZSgnLi93YXZlR2VuZXJhdG9yJyk7XHJcbmNsYXNzIEJhc2VHYW1lIHtcclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgc3lzdGVtXzEuU3lzdGVtLmluaXRTeXN0ZW1zKHRoaXMuc3lzdGVtcyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5CYXNlR2FtZSA9IEJhc2VHYW1lO1xyXG4oZnVuY3Rpb24gKEJhc2VHYW1lKSB7XHJcbiAgICBjbGFzcyBTeXN0ZW1zIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG5ldyBlbnRpdHlDb250YWluZXJfMS5FbnRpdHlDb250YWluZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBCYXNlR2FtZS5TeXN0ZW1zID0gU3lzdGVtcztcclxufSkoQmFzZUdhbWUgPSBleHBvcnRzLkJhc2VHYW1lIHx8IChleHBvcnRzLkJhc2VHYW1lID0ge30pKTtcclxuY2xhc3MgR2FtZSBleHRlbmRzIEJhc2VHYW1lIHtcclxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMgPSBuZXcgR2FtZS5TeXN0ZW1zKCk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy53YXZlR2VuZXJhdG9yLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucGxheWVyQ29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmVuZW15Q29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLnNoaXBDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuYnVsbGV0Q29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLnBhcnRpY2xlQ29udHJvbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucmVhcGVyLnJlYXAoKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucGh5c2ljcy5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmh1ZC5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmlucHV0LnBvc3RTdGVwKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5HYW1lID0gR2FtZTtcclxuKGZ1bmN0aW9uIChHYW1lKSB7XHJcbiAgICBjbGFzcyBTeXN0ZW1zIGV4dGVuZHMgQmFzZUdhbWUuU3lzdGVtcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBpbnB1dF8xLklucHV0KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG5ldyBwaHlzaWNzXzEuUGh5c2ljcygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IHJlbmRlcmVyXzEuUmVuZGVyZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyID0gbmV3IHBsYXllckNvbnRyb2xsZXJfMS5QbGF5ZXJDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpcENvbnRyb2xsZXIgPSBuZXcgc2hpcENvbnRyb2xsZXJfMS5TaGlwQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW15Q29udHJvbGxlciA9IG5ldyBlbmVtaWVzXzEuRW5lbXlDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29udHJvbGxlciA9IG5ldyBidWxsZXRDb250cm9sbGVyXzEuQnVsbGV0Q29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlQ29udHJvbGVyID0gbmV3IHBhcnRpY2xlQ29udHJvbGxlcl8xLlBhcnRpY2xlQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aENvbnRyb2xsZXIgPSBuZXcgaGVhbHRoQ29udHJvbGxlcl8xLkhlYWx0aENvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy53YXZlR2VuZXJhdG9yID0gbmV3IHdhdmVHZW5lcmF0b3JfMS5XYXZlR2VuZXJhdG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHVkID0gbmV3IGh1ZF8xLkh1ZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYXBlciA9IG5ldyByZWFwZXJfMS5SZWFwZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBHYW1lLlN5c3RlbXMgPSBTeXN0ZW1zO1xyXG59KShHYW1lID0gZXhwb3J0cy5HYW1lIHx8IChleHBvcnRzLkdhbWUgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nYW1lLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuZXhwb3J0cy5TSU5fMzAgPSAwLjU7XHJcbmV4cG9ydHMuQ09TXzMwID0gMC44NjYwMztcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG52YXIgUG9pbnQ7XHJcbihmdW5jdGlvbiAoUG9pbnQpIHtcclxuICAgIGZ1bmN0aW9uIGFkZCguLi5wb2ludHMpIHtcclxuICAgICAgICBsZXQgcCA9IFswLCAwXTtcclxuICAgICAgICBmb3IgKGxldCBwMSBvZiBwb2ludHMpIHtcclxuICAgICAgICAgICAgcFtYXSArPSBwMVtYXTtcclxuICAgICAgICAgICAgcFtZXSArPSBwMVtZXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcbiAgICB9XHJcbiAgICBQb2ludC5hZGQgPSBhZGQ7XHJcbiAgICBmdW5jdGlvbiBzdWJ0cmFjdChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4gW3AxW1hdIC0gcDJbWF0sIHAxW1ldIC0gcDJbWV1dO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuc3VidHJhY3QgPSBzdWJ0cmFjdDtcclxuICAgIGZ1bmN0aW9uIGxlbmd0aChwKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChsZW5ndGhTcXVhcmVkKHApKTtcclxuICAgIH1cclxuICAgIFBvaW50Lmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIGZ1bmN0aW9uIGxlbmd0aFNxdWFyZWQocCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhwW1hdLCAyKSArIE1hdGgucG93KHBbWV0sIDIpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQubGVuZ3RoU3F1YXJlZCA9IGxlbmd0aFNxdWFyZWQ7XHJcbiAgICBmdW5jdGlvbiBkaXN0KHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGlzdFNxdWFyZWQocDEsIHAyKSk7XHJcbiAgICB9XHJcbiAgICBQb2ludC5kaXN0ID0gZGlzdDtcclxuICAgIGZ1bmN0aW9uIGRpc3RTcXVhcmVkKHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdygocDFbWF0gLSBwMltYXSksIDIpICsgTWF0aC5wb3coKHAxW1ldIC0gcDJbWV0pLCAyKTtcclxuICAgIH1cclxuICAgIFBvaW50LmRpc3RTcXVhcmVkID0gZGlzdFNxdWFyZWQ7XHJcbiAgICBmdW5jdGlvbiBkb3QocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHAxW1hdICogcDJbWF0gKyBwMVtZXSAqIHAyW1ldO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuZG90ID0gZG90O1xyXG4gICAgZnVuY3Rpb24gY2xvbmUocCkge1xyXG4gICAgICAgIHJldHVybiBbcFtYXSwgcFtZXV07XHJcbiAgICB9XHJcbiAgICBQb2ludC5jbG9uZSA9IGNsb25lO1xyXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplKHApIHtcclxuICAgICAgICBsZXQgbGVuID0gbGVuZ3RoKHApO1xyXG4gICAgICAgIHJldHVybiBbcFtYXSAvIGxlbiwgcFtZXSAvIGxlbl07XHJcbiAgICB9XHJcbiAgICBQb2ludC5ub3JtYWxpemUgPSBub3JtYWxpemU7XHJcbiAgICBmdW5jdGlvbiB6ZXJvKCkge1xyXG4gICAgICAgIHJldHVybiBbMCwgMF07XHJcbiAgICB9XHJcbiAgICBQb2ludC56ZXJvID0gemVybztcclxuICAgIGZ1bmN0aW9uIHBsdXMoc2VsZiwgcCkge1xyXG4gICAgICAgIHNlbGZbWF0gKz0gcFtYXTtcclxuICAgICAgICBzZWxmW1ldICs9IHBbWV07XHJcbiAgICB9XHJcbiAgICBQb2ludC5wbHVzID0gcGx1cztcclxufSkoUG9pbnQgPSBleHBvcnRzLlBvaW50IHx8IChleHBvcnRzLlBvaW50ID0ge30pKTtcclxudmFyIE1hdHJpeDtcclxuKGZ1bmN0aW9uIChNYXRyaXgpIHtcclxuICAgIGZ1bmN0aW9uIG11bChhLCBiKSB7XHJcbiAgICAgICAgbGV0IHZlY1ggPSBwb2ludE11bChhLCBbYltYXVtYXSwgYltZXVtYXV0pO1xyXG4gICAgICAgIGxldCB2ZWNZID0gcG9pbnRNdWwoYSwgW2JbWF1bWV0sIGJbWV1bWV1dKTtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBbdmVjWFtYXSwgdmVjWVtYXV0sXHJcbiAgICAgICAgICAgIFt2ZWNYW1ldLCB2ZWNZW1ldXSxcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgTWF0cml4Lm11bCA9IG11bDtcclxuICAgIGZ1bmN0aW9uIHBvaW50TXVsKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBQb2ludC5kb3QoYVtYXSwgYiksXHJcbiAgICAgICAgICAgIFBvaW50LmRvdChhW1ldLCBiKSxcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgTWF0cml4LnBvaW50TXVsID0gcG9pbnRNdWw7XHJcbn0pKE1hdHJpeCA9IGV4cG9ydHMuTWF0cml4IHx8IChleHBvcnRzLk1hdHJpeCA9IHt9KSk7XHJcbnZhciBnZW87XHJcbihmdW5jdGlvbiAoZ2VvKSB7XHJcbiAgICB2YXIgbWF0aDtcclxuICAgIChmdW5jdGlvbiAobWF0aCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRCZXR3ZWVuKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGgucmFuZEJldHdlZW4gPSByYW5kQmV0d2VlbjtcclxuICAgICAgICBmdW5jdGlvbiByYW5kQ2lyY2xlKGNlbnRlciwgcmFkaXVzKSB7XHJcbiAgICAgICAgICAgIC8vIFJlcGVhdCB1bnRpbCAoeCx5KSBpcyBpbnNpZGUgdGhlIHVuaXQgY2lyY2xlLlxyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSByYW5kQmV0d2VlbigtMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IHJhbmRCZXR3ZWVuKC0xLCAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLnBvdyh4LCAyKSArIE1hdGgucG93KHksIDIpIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4ICogcmFkaXVzICsgY2VudGVyW1hdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ICogcmFkaXVzICsgY2VudGVyW1ldLFxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kQ2lyY2xlID0gcmFuZENpcmNsZTtcclxuICAgICAgICAvLyBBcHByb3guIHVzaW5nIHN1bSBvZiAzIHVuaWZvcm0gcmFuZG9tIG51bWJlcnMuXHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEdhdXNzKG1lYW4sIGRldikge1xyXG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKyBNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKSAtIDEuNSkgKiAwLjY3ICogZGV2ICsgbWVhbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kR2F1c3MgPSByYW5kR2F1c3M7XHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEdhdXNzMmQoY2VudGVyLCBkZXYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHJhbmRHYXVzcyhjZW50ZXJbWF0sIGRldiksXHJcbiAgICAgICAgICAgICAgICByYW5kR2F1c3MoY2VudGVyW1ldLCBkZXYpLFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLnJhbmRHYXVzczJkID0gcmFuZEdhdXNzMmQ7XHJcbiAgICAgICAgZnVuY3Rpb24gbGVycChtaW4sIG1heCwgeCkge1xyXG4gICAgICAgICAgICByZXR1cm4geCAqIChtYXggLSBtaW4pICsgbWluO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLmxlcnAgPSBsZXJwO1xyXG4gICAgICAgIGZ1bmN0aW9uIGNsYW1wKG1pbiwgeCwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIHgpLCBtYXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLmNsYW1wID0gY2xhbXA7XHJcbiAgICB9KShtYXRoID0gZ2VvLm1hdGggfHwgKGdlby5tYXRoID0ge30pKTtcclxufSkoZ2VvID0gZXhwb3J0cy5nZW8gfHwgKGV4cG9ydHMuZ2VvID0ge30pKTtcclxuZXhwb3J0cy5kZWZhdWx0ID0gZ2VvO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW8uanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jbGFzcyBIZWFsdGhDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBIZWFsdGhDb250cm9sbGVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMuX2hlYWx0aEVudGl0aWVzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5oZWFsdGgpXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWx0aEVudGl0aWVzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9oZWFsdGhFbnRpdGllcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgZGFtYWdlRW50aXR5KGVudGl0eSwgZGFtYWdlLCBzb3VyY2UpIHtcclxuICAgICAgICBpZiAoZW50aXR5LmhlYWx0aCkge1xyXG4gICAgICAgICAgICBlbnRpdHkuaGVhbHRoLmhwIC09IGRhbWFnZTtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5oZWFsdGguaHAgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBzLnJlYXBlci5raWxsRW50aXR5KGVudGl0eSwgc291cmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkhlYWx0aENvbnRyb2xsZXIgPSBIZWFsdGhDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKEhlYWx0aENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhcGVyID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgSGVhbHRoQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKEhlYWx0aENvbnRyb2xsZXIgPSBleHBvcnRzLkhlYWx0aENvbnRyb2xsZXIgfHwgKGV4cG9ydHMuSGVhbHRoQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhlYWx0aENvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNsYXNzIEh1ZCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgSHVkLkRlcGVuZGVuY2llcygpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHsgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3Vyc29yRGlzcGxheSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnNvckRpc3BsYXkgPSB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogWzAsIDBdLFxyXG4gICAgICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjODA4MDgwJyxcclxuICAgICAgICAgICAgICAgICAgICBhbHBoYTogMC4zLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMyxcclxuICAgICAgICAgICAgICAgICAgICBzaGFwZTogJ2hleGFnb24nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC4xMjUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4Qmx1cjogMSxcclxuICAgICAgICAgICAgICAgICAgICBnbG93OiAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eSh0aGlzLl9jdXJzb3JEaXNwbGF5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGN1cnNvciA9IHRoaXMuZGVwcy5pbnB1dC5jdXJzb3I7XHJcbiAgICAgICAgaWYgKGN1cnNvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJzb3JEaXNwbGF5LnBvc2l0aW9uID0gZ2VvXzEuUG9pbnQuY2xvbmUoY3Vyc29yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2Rpc3BsYXlDb250cm9sbGVyICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5U2NvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkaXNwbGF5U2NvcmUoKSB7XHJcbiAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5kZXBzLnBsYXllckNvbnRyb2xsZXIuc2NvcmU7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXIuc2NvcmUuc2V0VmFsdWUoc2NvcmUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBzZXREaXNwbGF5Q29udHJvbGxlcihoZGMpIHtcclxuICAgICAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlciA9IGhkYztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkh1ZCA9IEh1ZDtcclxuKGZ1bmN0aW9uIChIdWQpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBIdWQuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShIdWQgPSBleHBvcnRzLkh1ZCB8fCAoZXhwb3J0cy5IdWQgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1odWQuanMubWFwIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3Mvbm9kZS9ub2RlLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcbnZhciBnYW1lXzEgPSByZXF1aXJlKCcuL2dhbWUnKTtcclxudmFyIGlucHV0XzEgPSByZXF1aXJlKCcuL2lucHV0Jyk7XHJcbmxldCBtYWluQ2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5DYW52YXMnKTtcclxubGV0IGdhbWUgPSBuZXcgZ2FtZV8xLkdhbWUoKTtcclxuZ2FtZS5pbml0KCk7XHJcbmdhbWUuc3lzdGVtcy5yZW5kZXJlci5zZXRDYW52YXMobWFpbkNhbnZhcyk7XHJcbmNsYXNzIEVsZW1lbnRCaW5kaW5nIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGF0dHJpYnV0ZSkge1xyXG4gICAgICAgIGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZSB8fCAnaW5uZXJUZXh0JztcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlID0gYXR0cmlidXRlO1xyXG4gICAgfVxyXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRbdGhpcy5hdHRyaWJ1dGVdID0gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxudmFyIGh1ZERpc3BsYXlDb250cm9sbGVyID0ge1xyXG4gICAgc2NvcmU6IG5ldyBFbGVtZW50QmluZGluZyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaHVkX3Njb3JlJykpLFxyXG59O1xyXG5nYW1lLnN5c3RlbXMuaHVkLnNldERpc3BsYXlDb250cm9sbGVyKGh1ZERpc3BsYXlDb250cm9sbGVyKTtcclxubGV0IGxhc3RTdGVwVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5sZXQgdGltZXNjYWxlID0gMTtcclxuc2V0VGltZW91dChmdW5jdGlvbiBzdGVwKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBsZXQgc3RlcFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBnYW1lLnN0ZXAoKHN0ZXBUaW1lIC0gbGFzdFN0ZXBUaW1lKSAqIHRpbWVzY2FsZSk7XHJcbiAgICAgICAgbGFzdFN0ZXBUaW1lID0gc3RlcFRpbWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH1cclxuICAgIHNldFRpbWVvdXQoc3RlcCwgMzApO1xyXG59LCAzMCk7XHJcbmdhbWUuc3lzdGVtcy5lbnRpdGllcy5hZGRFbnRpdHkoe1xyXG4gICAgcG9zaXRpb246IFswLCAwXSxcclxuICAgIHBoeXNpY3M6IHtcclxuICAgICAgICB2ZWxvY2l0eTogWzAsIDBdLFxyXG4gICAgICAgIHJhZGl1czogMSxcclxuICAgICAgICBkcmFnOiAyLFxyXG4gICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiB7XHJcbiAgICAgICAgY29sb3I6ICcjMDBBMEZGJyxcclxuICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICBzaGFwZTogJ2hleGFnb24nLFxyXG4gICAgICAgIHJhZGl1czogMS4yLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMC4yNSxcclxuICAgICAgICBtYXhCbHVyOiAzLFxyXG4gICAgICAgIGdsb3c6IDEsXHJcbiAgICB9LFxyXG4gICAgcGxheWVyOiB7XHJcbiAgICAgICAgc2NvcmU6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcDoge1xyXG4gICAgICAgIGFjY2VsOiA2MDAsXHJcbiAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICByYXRlOiA4MCxcclxuICAgICAgICAgICAgbWFzczogMC42LFxyXG4gICAgICAgICAgICByYWRpdXM6IDAuMyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGhlYWx0aDoge1xyXG4gICAgICAgIGhwOiAxMCxcclxuICAgICAgICBtYXhIcDogMTAsXHJcbiAgICB9LFxyXG59KTtcclxubGV0IGtleU1hcCA9IHtcclxuICAgIDgxOiBpbnB1dF8xLktleS5VcExlZnQsXHJcbiAgICA4NzogaW5wdXRfMS5LZXkuVXAsXHJcbiAgICA2OTogaW5wdXRfMS5LZXkuVXBSaWdodCxcclxuICAgIDY1OiBpbnB1dF8xLktleS5Eb3duTGVmdCxcclxuICAgIDgzOiBpbnB1dF8xLktleS5Eb3duLFxyXG4gICAgNjg6IGlucHV0XzEuS2V5LkRvd25SaWdodCxcclxufTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgbGV0IGtleSA9IGtleU1hcFtlLmtleUNvZGVdO1xyXG4gICAgaWYgKGtleSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICBnYW1lLnN5c3RlbXMuaW5wdXQua2V5RG93bihrZXkpO1xyXG4gICAgfVxyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcclxuICAgIGxldCBrZXkgPSBrZXlNYXBbZS5rZXlDb2RlXTtcclxuICAgIGlmIChrZXkgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmtleVVwKGtleSk7XHJcbiAgICB9XHJcbn0pO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgIGxldCByZWN0ID0gbWFpbkNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGxldCBwID0gW1xyXG4gICAgICAgIGUuY2xpZW50WCAtIHJlY3QubGVmdCxcclxuICAgICAgICBlLmNsaWVudFkgLSByZWN0LnRvcCxcclxuICAgIF07XHJcbiAgICBnYW1lLnN5c3RlbXMuaW5wdXQuY3Vyc29yID0gZ2FtZS5zeXN0ZW1zLnJlbmRlcmVyLnNjcmVlblRvV29ybGQocCk7XHJcbn0pO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcclxuICAgIGdhbWUuc3lzdGVtcy5pbnB1dC5rZXlEb3duKGlucHV0XzEuS2V5LkZpcmUpO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4ge1xyXG4gICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmtleVVwKGlucHV0XzEuS2V5LkZpcmUpO1xyXG59KTtcclxubGV0IGxhc3RSZW5kZXJUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBsZXQgcmVuZGVyVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgZ2FtZS5zeXN0ZW1zLnJlbmRlcmVyLnJlbmRlcihyZW5kZXJUaW1lIC0gbGFzdFJlbmRlclRpbWUpO1xyXG4gICAgbGFzdFJlbmRlclRpbWUgPSByZW5kZXJUaW1lO1xyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbihmdW5jdGlvbiAoS2V5KSB7XHJcbiAgICBLZXlbS2V5W1wiVXBMZWZ0XCJdID0gMF0gPSBcIlVwTGVmdFwiO1xyXG4gICAgS2V5W0tleVtcIlVwXCJdID0gMV0gPSBcIlVwXCI7XHJcbiAgICBLZXlbS2V5W1wiVXBSaWdodFwiXSA9IDJdID0gXCJVcFJpZ2h0XCI7XHJcbiAgICBLZXlbS2V5W1wiRG93bkxlZnRcIl0gPSAzXSA9IFwiRG93bkxlZnRcIjtcclxuICAgIEtleVtLZXlbXCJEb3duXCJdID0gNF0gPSBcIkRvd25cIjtcclxuICAgIEtleVtLZXlbXCJEb3duUmlnaHRcIl0gPSA1XSA9IFwiRG93blJpZ2h0XCI7XHJcbiAgICBLZXlbS2V5W1wiRmlyZVwiXSA9IDZdID0gXCJGaXJlXCI7XHJcbn0pKGV4cG9ydHMuS2V5IHx8IChleHBvcnRzLktleSA9IHt9KSk7XHJcbnZhciBLZXkgPSBleHBvcnRzLktleTtcclxuKGZ1bmN0aW9uIChLZXlTdGF0ZSkge1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJQcmVzc2luZ1wiXSA9IDBdID0gXCJQcmVzc2luZ1wiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiUmVsZWFzaW5nXCJdID0gMl0gPSBcIlJlbGVhc2luZ1wiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJVcFwiXSA9IDNdID0gXCJVcFwiO1xyXG59KShleHBvcnRzLktleVN0YXRlIHx8IChleHBvcnRzLktleVN0YXRlID0ge30pKTtcclxudmFyIEtleVN0YXRlID0gZXhwb3J0cy5LZXlTdGF0ZTtcclxudmFyIEtleVN0YXRlO1xyXG4oZnVuY3Rpb24gKEtleVN0YXRlKSB7XHJcbiAgICBmdW5jdGlvbiBpc0Rvd24oc3RhdGUpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGUgPCAyO1xyXG4gICAgfVxyXG4gICAgS2V5U3RhdGUuaXNEb3duID0gaXNEb3duO1xyXG59KShLZXlTdGF0ZSA9IGV4cG9ydHMuS2V5U3RhdGUgfHwgKGV4cG9ydHMuS2V5U3RhdGUgPSB7fSkpO1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSB7fTtcclxuICAgICAgICB0aGlzLl90b1JlbGVhc2UgPSBbXTtcclxuICAgICAgICBsZXQga2V5Q291bnQgPSBPYmplY3Qua2V5cyhLZXkpLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgdGhpcy5fa2V5cyA9IG5ldyBBcnJheShrZXlDb3VudCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5VcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbml0KCkgeyB9XHJcbiAgICBnZXRLZXkoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleXNba2V5XTtcclxuICAgIH1cclxuICAgIGtleURvd24oa2V5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2tleXNba2V5XSAhPSBLZXlTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleXNba2V5XSA9IEtleVN0YXRlLlByZXNzaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGtleVVwKGtleSkge1xyXG4gICAgICAgIHRoaXMuX3RvUmVsZWFzZS5wdXNoKGtleSk7XHJcbiAgICB9XHJcbiAgICBwb3N0U3RlcCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2tleXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2tleXNbaV0gPT0gS2V5U3RhdGUuUHJlc3NpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5Eb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2tleXNbaV0gPT0gS2V5U3RhdGUuUmVsZWFzaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuVXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHRoaXMuX3RvUmVsZWFzZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fa2V5c1trZXldICE9IEtleVN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2tleV0gPSBLZXlTdGF0ZS5SZWxlYXNpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdG9SZWxlYXNlLmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5JbnB1dCA9IElucHV0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnB1dC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbnZhciBQYXJ0aWNsZUNvbXBvbmVudDtcclxuKGZ1bmN0aW9uIChQYXJ0aWNsZUNvbXBvbmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlUGFydGljbGUocG9zLCB2ZWwsIGNvbG9yLCBtYXNzLCByYWRpdXMsIGxpZmVzcGFuKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHZlbCxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1hc3M6IG1hc3MsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjI1LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMSxcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhcnRpY2xlOiB7XHJcbiAgICAgICAgICAgICAgICBsaWZlc3BhbjogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nOiBsaWZlc3BhbixcclxuICAgICAgICAgICAgICAgIGNvdW50OiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBQYXJ0aWNsZUNvbXBvbmVudC5jcmVhdGVQYXJ0aWNsZSA9IGNyZWF0ZVBhcnRpY2xlO1xyXG59KShQYXJ0aWNsZUNvbXBvbmVudCA9IGV4cG9ydHMuUGFydGljbGVDb21wb25lbnQgfHwgKGV4cG9ydHMuUGFydGljbGVDb21wb25lbnQgPSB7fSkpO1xyXG5jbGFzcyBQYXJ0aWNsZUNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFBhcnRpY2xlQ29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLm1heFBhcnRpY2xlcyA9IDIwMDtcclxuICAgICAgICB0aGlzLl9wYXJ0aWNsZUNvdW50ID0gMDtcclxuICAgICAgICB0aGlzLl9wYXJ0aWNsZXMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0aWNsZXMuYWRkKGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGUucGFydGljbGUuY291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICArK3RoaXMuX3BhcnRpY2xlQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BhcnRpY2xlQ291bnQgPiB0aGlzLm1heFBhcnRpY2xlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdG9EZWxldGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGUyIG9mIHRoaXMuX3BhcnRpY2xlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUyLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9EZWxldGUgPSBlMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9EZWxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5yZW1vdmVFbnRpdHkodG9EZWxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFydGljbGVzLmRlbGV0ZShlKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLS10aGlzLl9wYXJ0aWNsZUNvdW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3BhcnRpY2xlcykge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZS50aW1lUmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5yZW1vdmVFbnRpdHkoZSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnJlbmRlci5hbHBoYSA9IGUucGFydGljbGUudGltZVJlbWFpbmluZyAvIGUucGFydGljbGUubGlmZXNwYW47XHJcbiAgICAgICAgICAgIGUucGFydGljbGUudGltZVJlbWFpbmluZyAtPSBzZWNvbmRzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciA9IFBhcnRpY2xlQ29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChQYXJ0aWNsZUNvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFBhcnRpY2xlQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFBhcnRpY2xlQ29udHJvbGxlciA9IGV4cG9ydHMuUGFydGljbGVDb250cm9sbGVyIHx8IChleHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnRpY2xlQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY29uc3QgV09STERfRFJBRyA9IDQ7XHJcbmNsYXNzIFBoeXNpY3Mge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFBoeXNpY3MuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gNDtcclxuICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5fcGh5c09iamVjdHMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLnBoeXNpY3MpXHJcbiAgICAgICAgICAgIHRoaXMuX3BoeXNPYmplY3RzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9waHlzT2JqZWN0cy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuY2xlYXIoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlcmF0aW9uczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gdGhpcy5zdGVwSW50ZXJuYWwoZWxhcHNlZE1zIC8gdGhpcy5pdGVyYXRpb25zKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaW50ZXIgb2YgaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbnRlcnNlY3Rpb24oaW50ZXIuYSwgaW50ZXIuYik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEludGVyc2VjdGlvbihpbnRlci5iLCBpbnRlci5hKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZEludGVyc2VjdGlvbihhLCBiKSB7XHJcbiAgICAgICAgbGV0IGludGVycyA9IHRoaXMuaW50ZXJzZWN0aW9ucy5nZXQoYSk7XHJcbiAgICAgICAgaWYgKGludGVycyA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaW50ZXJzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJzZWN0aW9ucy5zZXQoYSwgaW50ZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW50ZXJzLnB1c2goeyBhOiBhLCBiOiBiIH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcEludGVybmFsKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5fcGh5c09iamVjdHMpIHtcclxuICAgICAgICAgICAgbGV0IHBoeXMgPSBlbnRpdHkucGh5c2ljcztcclxuICAgICAgICAgICAgbGV0IHBvcyA9IGVudGl0eS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgbGV0IHZlbCA9IHBoeXMudmVsb2NpdHk7XHJcbiAgICAgICAgICAgIHBvc1tYXSArPSB2ZWxbWF0gKiBzZWNvbmRzO1xyXG4gICAgICAgICAgICBwb3NbWV0gKz0gdmVsW1ldICogc2Vjb25kcztcclxuICAgICAgICAgICAgbGV0IGRyYWdDb2VmZiA9IE1hdGgucG93KE1hdGguRSwgLVdPUkxEX0RSQUcgKiBwaHlzLmRyYWcgKiBzZWNvbmRzKTtcclxuICAgICAgICAgICAgdmVsW1hdICo9IGRyYWdDb2VmZjtcclxuICAgICAgICAgICAgdmVsW1ldICo9IGRyYWdDb2VmZjtcclxuICAgICAgICAgICAgcGh5cy50aGV0YSArPSBwaHlzLm9tZWdhICogc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSB0aGlzLmZpbmRJbnRlcnNlY3Rpb25zKCk7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0Q29sbGlzaW9ucyhpbnRlcnNlY3Rpb25zKTtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcclxuICAgIH1cclxuICAgIGZpbmRJbnRlcnNlY3Rpb25zKCkge1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fcGh5c09iamVjdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBoeXNpY3MuY29sbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTb3J0IGJ5IGxlZnRtb3N0IGJvdW5kIG9mIGNpcmNsZS5cclxuICAgICAgICBsaXN0LnNvcnQoKGEsIGIpID0+IE1hdGguc2lnbigoYS5wb3NpdGlvbltYXSAtIGEucGh5c2ljcy5yYWRpdXMpIC0gKGIucG9zaXRpb25bWF0gLSBiLnBoeXNpY3MucmFkaXVzKSkpO1xyXG4gICAgICAgIC8vIFN3ZWVwIGxlZnQtdG8tcmlnaHQgdGhyb3VnaCB0aGUgZW50aXRpZXMuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBhID0gbGlzdFtpXTtcclxuICAgICAgICAgICAgbGV0IHJpZ2h0RWRnZSA9IGEucG9zaXRpb25bWF0gKyBhLnBoeXNpY3MucmFkaXVzO1xyXG4gICAgICAgICAgICAvLyBDaGVjayBvbmx5IGVudGl0aWVzIHRvIHRoZSByaWdodCBvZiBhO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBsaXN0Lmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYiA9IGxpc3Rbal07XHJcbiAgICAgICAgICAgICAgICBpZiAoYi5wb3NpdGlvbltYXSAtIGIucGh5c2ljcy5yYWRpdXMgPj0gcmlnaHRFZGdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gaW50ZXJzZWN0aW9ucyBhcmUgcG9zc2libGUgYWZ0ZXIgdGhpcy5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCByYWRTcXIgPSBNYXRoLnBvdygoYS5waHlzaWNzLnJhZGl1cyArIGIucGh5c2ljcy5yYWRpdXMpLCAyKTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXN0U3FyID0gZ2VvXzEuUG9pbnQuZGlzdFNxdWFyZWQoYS5wb3NpdGlvbiwgYi5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzdFNxciA8IHJhZFNxcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbnMucHVzaCh7IGE6IGEsIGI6IGIgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XHJcbiAgICB9XHJcbiAgICBjb3JyZWN0Q29sbGlzaW9ucyhpbnRlcnNlY3Rpb25zKSB7XHJcbiAgICAgICAgbGV0IGNvcnJlY3Rpb25zID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgb2YgaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgYSA9IGkuYTtcclxuICAgICAgICAgICAgbGV0IGIgPSBpLmI7XHJcbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGRpZmZlcmVuY2UgaW4gcG9zaXRpb24uXHJcbiAgICAgICAgICAgIGxldCBkaWZQID0gZ2VvXzEuUG9pbnQuc3VidHJhY3QoYi5wb3NpdGlvbiwgYS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBnZW9fMS5Qb2ludC5sZW5ndGgoZGlmUCk7XHJcbiAgICAgICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgZGlmZmVyZW5jZS5cclxuICAgICAgICAgICAgbGV0IG5vcm1hbCA9IFtkaWZQW1hdIC8gbGVuLCBkaWZQW1ldIC8gbGVuXTtcclxuICAgICAgICAgICAgLy8gRmluZCB0aGUgZGlmZmVyZW5jZSBpbiB2ZWxvY2l0eS5cclxuICAgICAgICAgICAgbGV0IGRpZlYgPSBnZW9fMS5Qb2ludC5zdWJ0cmFjdChiLnBoeXNpY3MudmVsb2NpdHksIGEucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIGxldCBkb3QgPSBnZW9fMS5Qb2ludC5kb3QoZGlmViwgbm9ybWFsKTtcclxuICAgICAgICAgICAgbGV0IGJvdW5jZSA9IGEucGh5c2ljcy5ib3VuY2UgKiBiLnBoeXNpY3MuYm91bmNlO1xyXG4gICAgICAgICAgICBsZXQgZHYgPSBbbm9ybWFsW1hdICogZG90ICogYm91bmNlLCBub3JtYWxbWV0gKiBkb3QgKiBib3VuY2VdO1xyXG4gICAgICAgICAgICBsZXQgdG90YWxNYXNzID0gYS5waHlzaWNzLm1hc3MgKyBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgYS5waHlzaWNzLnZlbG9jaXR5W1hdICs9IGR2W1hdICogYi5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGEucGh5c2ljcy52ZWxvY2l0eVtZXSArPSBkdltZXSAqIGIucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBiLnBoeXNpY3MudmVsb2NpdHlbWF0gLT0gZHZbWF0gKiBhLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgYi5waHlzaWNzLnZlbG9jaXR5W1ldIC09IGR2W1ldICogYS5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIC8vIERpc3BsYWNlIHRoZSBlbnRpdGllcyBvdXQgb2YgZWFjaCBvdGhlci5cclxuICAgICAgICAgICAgbGV0IGNvckEgPSBjb3JyZWN0aW9ucy5nZXQoYSk7XHJcbiAgICAgICAgICAgIGlmIChjb3JBID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29yQSA9IHsgZDogWzAsIDBdLCBtYXNzOiAwIH07XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9ucy5zZXQoYSwgY29yQSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGNvckIgPSBjb3JyZWN0aW9ucy5nZXQoYik7XHJcbiAgICAgICAgICAgIGlmIChjb3JCID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29yQiA9IHsgZDogWzAsIDBdLCBtYXNzOiAwIH07XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9ucy5zZXQoYiwgY29yQik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGRpc3BsYWNlID0gKGEucGh5c2ljcy5yYWRpdXMgKyBiLnBoeXNpY3MucmFkaXVzKSAtIGxlbjtcclxuICAgICAgICAgICAgbGV0IGRpc1ggPSBub3JtYWxbWF0gKiBkaXNwbGFjZTtcclxuICAgICAgICAgICAgbGV0IGRpc1kgPSBub3JtYWxbWV0gKiBkaXNwbGFjZTtcclxuICAgICAgICAgICAgY29yQS5kW1hdIC09IGRpc1ggKiBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQS5kW1ldIC09IGRpc1kgKiBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQS5tYXNzICs9IHRvdGFsTWFzcztcclxuICAgICAgICAgICAgY29yQi5kW1hdICs9IGRpc1ggKiBhLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQi5kW1ldICs9IGRpc1kgKiBhLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQi5tYXNzICs9IHRvdGFsTWFzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga3ZwIG9mIGNvcnJlY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCBlID0ga3ZwWzBdO1xyXG4gICAgICAgICAgICBsZXQgY29yID0ga3ZwWzFdO1xyXG4gICAgICAgICAgICBsZXQgZHggPSBjb3IuZFtYXSAvIGNvci5tYXNzICogMS4wNTtcclxuICAgICAgICAgICAgbGV0IGR5ID0gY29yLmRbWV0gLyBjb3IubWFzcyAqIDEuMDU7XHJcbiAgICAgICAgICAgIGUucG9zaXRpb25bWF0gKz0gZHg7XHJcbiAgICAgICAgICAgIGUucG9zaXRpb25bWV0gKz0gZHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGh5c2ljcyA9IFBoeXNpY3M7XHJcbihmdW5jdGlvbiAoUGh5c2ljcykge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUGh5c2ljcy5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFBoeXNpY3MgPSBleHBvcnRzLlBoeXNpY3MgfHwgKGV4cG9ydHMuUGh5c2ljcyA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBoeXNpY3MuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgYnVsbGV0Q29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9idWxsZXRDb250cm9sbGVyJyk7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNsYXNzIFBsYXllckNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFBsYXllckNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYnVsbGV0VGltZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmJ1bGxldExpZmVzcGFuID0gNDtcclxuICAgICAgICB0aGlzLmJ1bGxldERhbWFnZSA9IDY7XHJcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgPSAwO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wbGF5ZXIgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZSA9PSB0aGlzLnBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLnJlYXBlci5lbnRpdHlLaWxsZWQubGlzdGVuKGFyZ3MgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYXJncy5raWxsZXIucGxheWVyICYmIGFyZ3MuZW50aXR5LnNjb3JpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gYXJncy5lbnRpdHkuc2NvcmluZy52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZHZ4ID0gMDtcclxuICAgICAgICBsZXQgZHZ5ID0gMDtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5VcCkpKVxyXG4gICAgICAgICAgICBkdnkgLT0gMTtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duKSkpXHJcbiAgICAgICAgICAgIGR2eSArPSAxO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwTGVmdCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCAtPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSAtPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwUmlnaHQpKSkge1xyXG4gICAgICAgICAgICBkdnggKz0gZ2VvXzIuQ09TXzMwO1xyXG4gICAgICAgICAgICBkdnkgLT0gZ2VvXzIuU0lOXzMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duTGVmdCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCAtPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSArPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkRvd25SaWdodCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCArPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSArPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoTWF0aC5wb3coZHZ4LCAyKSArIE1hdGgucG93KGR2eSwgMikpO1xyXG4gICAgICAgIGlmIChsZW4gPD0gMC4wNSkge1xyXG4gICAgICAgICAgICAvLyBlaXRoZXIgemVybyBvciB0aGVyZSdzIGEgcm91bmRpbmcgZXJyb3IuXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGR2eCAvPSBsZW47XHJcbiAgICAgICAgICAgIGR2eSAvPSBsZW47XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNoaXAuZGlyZWN0aW9uID0gW2R2eCwgZHZ5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQnVsbGV0czpcclxuICAgICAgICBpZiAodGhpcy5fYnVsbGV0VGltZUxlZnQgPD0gMCAmJiBpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkZpcmUpKSkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZ2VvXzEuUG9pbnQuc3VidHJhY3QodGhpcy5kZXBzLmlucHV0LmN1cnNvciwgdGhpcy5wbGF5ZXIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKG5vcm1hbCk7XHJcbiAgICAgICAgICAgIG5vcm1hbFtYXSAvPSBsZW47XHJcbiAgICAgICAgICAgIG5vcm1hbFtZXSAvPSBsZW47XHJcbiAgICAgICAgICAgIGxldCBuZXdQb3MgPSBnZW9fMS5Qb2ludC5jbG9uZSh0aGlzLnBsYXllci5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIG5ld1Bvc1tYXSArPSBub3JtYWxbWF0gKiB0aGlzLnBsYXllci5waHlzaWNzLnJhZGl1cyAqIDEuNTtcclxuICAgICAgICAgICAgbmV3UG9zW1ldICs9IG5vcm1hbFtZXSAqIHRoaXMucGxheWVyLnBoeXNpY3MucmFkaXVzICogMS41O1xyXG4gICAgICAgICAgICBsZXQgbmV3VmVsID0gZ2VvXzEuUG9pbnQuY2xvbmUodGhpcy5wbGF5ZXIucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIG5ld1ZlbFtYXSArPSBub3JtYWxbWF0gKiAyMDA7XHJcbiAgICAgICAgICAgIG5ld1ZlbFtZXSArPSBub3JtYWxbWV0gKiAyMDA7XHJcbiAgICAgICAgICAgIGxldCBuZXdCdWxsZXQgPSBidWxsZXRDb250cm9sbGVyXzEuQnVsbGV0Q29tcG9uZW50LmNyZWF0ZUJ1bGxldCh7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMucGxheWVyLFxyXG4gICAgICAgICAgICAgICAgcG9zOiBuZXdQb3MsXHJcbiAgICAgICAgICAgICAgICB2ZWw6IG5ld1ZlbCxcclxuICAgICAgICAgICAgICAgIGRhbWFnZTogdGhpcy5idWxsZXREYW1hZ2UsXHJcbiAgICAgICAgICAgICAgICBsaWZlc3BhbjogdGhpcy5idWxsZXRMaWZlc3BhbixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkobmV3QnVsbGV0KTtcclxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgKz0gdGhpcy5idWxsZXRUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYnVsbGV0VGltZUxlZnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1bGxldFRpbWVMZWZ0IC09IHNlY29uZHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGxheWVyQ29udHJvbGxlciA9IFBsYXllckNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoUGxheWVyQ29udHJvbGxlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMucmVhcGVyID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUGxheWVyQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFBsYXllckNvbnRyb2xsZXIgPSBleHBvcnRzLlBsYXllckNvbnRyb2xsZXIgfHwgKGV4cG9ydHMuUGxheWVyQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBsYXllckNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZXZlbnRfMSA9IHJlcXVpcmUoJy4vZXZlbnQnKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY2xhc3MgUmVhcGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBSZWFwZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2NjdXJzIHdoZW4gYW4gZW50aXR5IGlzIGtpbGxlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVudGl0eUtpbGxlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5fdG9LaWxsID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJrcyBhbiBlbnRpdHkgYXMgZGVhZC5cclxuICAgICAqIFRoZSBlbnRpdHkgd2lsbCBiZSByZW1vdmVkIHdoZW4gcmVhcCgpIGlzIGNhbGxlZC5cclxuICAgICAqIEBwYXJhbSBlbnRpdHkgVGhlIGVudGl0eSB0byBraWxsLlxyXG4gICAgICovXHJcbiAgICBraWxsRW50aXR5KGVudGl0eSwga2lsbGVyKSB7XHJcbiAgICAgICAgZW50aXR5LmlzRGVhZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fdG9LaWxsLmFkZChlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5S2lsbGVkLmVtaXQoeyBlbnRpdHk6IGVudGl0eSwga2lsbGVyOiBraWxsZXIgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgZGVhZCBlbnRpdGllcy5cclxuICAgICAqL1xyXG4gICAgcmVhcCgpIHtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3RvS2lsbCkge1xyXG4gICAgICAgICAgICBpZiAoZS5pc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5yZW1vdmVFbnRpdHkoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdG9LaWxsLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5SZWFwZXIgPSBSZWFwZXI7XHJcbihmdW5jdGlvbiAoUmVhcGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBSZWFwZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShSZWFwZXIgPSBleHBvcnRzLlJlYXBlciB8fCAoZXhwb3J0cy5SZWFwZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWFwZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgZ2VvXzIgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNsYXNzIFN0eWxlIHtcclxufVxyXG5jb25zdCBWSUVXX0hFSUdIVCA9IDc1O1xyXG5jbGFzcyBSZW5kZXJlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgUmVuZGVyZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5zaGFwZUZucyA9IHtcclxuICAgICAgICAgICAgJ2NpcmNsZSc6IChjdHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5hcmMoMCwgMCwgMSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2hleGFnb24nOiAoY3R4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKDAsIC0xKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oK2dlb18yLkNPU18zMCwgLWdlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKCtnZW9fMi5DT1NfMzAsICtnZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygwLCAxKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oLWdlb18yLkNPU18zMCwgK2dlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKC1nZW9fMi5DT1NfMzAsIC1nZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5kcGlTY2FsZSA9IDE7XHJcbiAgICAgICAgdGhpcy5nbG93ID0gMTA7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSB7IHBvczogWzAsIDBdLCB6b29tOiAxIH07XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyT2JqZWN0cyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUucmVuZGVyKVxyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJPYmplY3RzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9yZW5kZXJPYmplY3RzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzZXRDYW52YXMoY2FudmFzKSB7XHJcbiAgICAgICAgdGhpcy5fY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgY2FudmFzID0gY3R4LmNhbnZhcztcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiB0aGlzLmRwaVNjYWxlO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogdGhpcy5kcGlTY2FsZTtcclxuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX3JlbmRlck9iamVjdHMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5waHlzaWNzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBNQVhfQkxVUl9DT1VOVCA9IDU7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gZ2VvXzEuUG9pbnQubm9ybWFsaXplKGVudGl0eS5waHlzaWNzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgICAgIGxldCBzcGVlZCA9IGdlb18xLlBvaW50Lmxlbmd0aChlbnRpdHkucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmx1ckNvdW50ID0gTWF0aC5mbG9vcihzcGVlZCAqIHNlY29uZHMgLyBlbnRpdHkucmVuZGVyLnJhZGl1cyArIDEpO1xyXG4gICAgICAgICAgICAgICAgYmx1ckNvdW50ID0gTWF0aC5taW4oYmx1ckNvdW50LCBNQVhfQkxVUl9DT1VOVCwgZW50aXR5LnJlbmRlci5tYXhCbHVyKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmx1ckNvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZ2VvXzEuUG9pbnQuYWRkKGVudGl0eS5wb3NpdGlvbiwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAtZW50aXR5LnBoeXNpY3MudmVsb2NpdHlbWF0gKiBzZWNvbmRzICogaSAvIGJsdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLWVudGl0eS5waHlzaWNzLnZlbG9jaXR5W1ldICogc2Vjb25kcyAqIGkgLyBibHVyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbnRpdHkoZW50aXR5LCBwb3MsIE1hdGguc3FydCgxLjAgLyBibHVyQ291bnQpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcjogZGlyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWN0b3I6IHNwZWVkICogc2Vjb25kcyAvIChibHVyQ291bnQgKyAxKSAvIGVudGl0eS5yZW5kZXIucmFkaXVzICsgMSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW50aXR5KGVudGl0eSwgZW50aXR5LnBvc2l0aW9uLCAxLCBudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbmRlckVudGl0eShlLCBwb3MsIGFscGhhLCBzdHJldGNoKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICBsZXQgcmFkaXVzID0gZS5yZW5kZXIucmFkaXVzO1xyXG4gICAgICAgIGN0eC50cmFuc2xhdGUocG9zW1hdLCBwb3NbWV0pO1xyXG4gICAgICAgIGN0eC5zY2FsZShyYWRpdXMsIHJhZGl1cyk7XHJcbiAgICAgICAgaWYgKHN0cmV0Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5zdHJldGNoKHN0cmV0Y2guZGlyLCBzdHJldGNoLmZhY3Rvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLnBoeXNpY3MpIHtcclxuICAgICAgICAgICAgY3R4LnJvdGF0ZShlLnBoeXNpY3MudGhldGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3R5bGUgPSB7XHJcbiAgICAgICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgIHN0cm9rZTogZS5yZW5kZXIuY29sb3IsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogZS5yZW5kZXIubGluZVdpZHRoIC8gZS5yZW5kZXIucmFkaXVzLFxyXG4gICAgICAgICAgICBhbHBoYTogZS5yZW5kZXIuYWxwaGEgKiBhbHBoYSxcclxuICAgICAgICAgICAgZ2xvdzogZS5yZW5kZXIuZ2xvdyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGUoc3R5bGUpO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGbnNbZS5yZW5kZXIuc2hhcGVdKGN0eCk7XHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIHN0cmV0Y2goZGlyLCBmYWN0b3IpIHtcclxuICAgICAgICBsZXQgYWIgPSBbMSwgMF07XHJcbiAgICAgICAgbGV0IGFiRG90ID0gZ2VvXzEuUG9pbnQuZG90KGFiLCBkaXIpO1xyXG4gICAgICAgIGxldCBhYkFtb3VudCA9IGFiRG90ICogKGZhY3RvciAtIDEpO1xyXG4gICAgICAgIGFiW1hdICs9IGRpcltYXSAqIGFiQW1vdW50O1xyXG4gICAgICAgIGFiW1ldICs9IGRpcltZXSAqIGFiQW1vdW50O1xyXG4gICAgICAgIGxldCBiYyA9IFswLCAxXTtcclxuICAgICAgICBsZXQgYmNEb3QgPSBnZW9fMS5Qb2ludC5kb3QoYmMsIGRpcik7XHJcbiAgICAgICAgbGV0IGJjQW1vdW50ID0gYmNEb3QgKiAoZmFjdG9yIC0gMSk7XHJcbiAgICAgICAgYmNbWF0gKz0gZGlyW1hdICogYmNBbW91bnQ7XHJcbiAgICAgICAgYmNbWV0gKz0gZGlyW1ldICogYmNBbW91bnQ7XHJcbiAgICAgICAgdGhpcy5fY29udGV4dC50cmFuc2Zvcm0oYWJbWF0sIGFiW1ldLCBiY1tYXSwgYmNbWV0sIDAsIDApO1xyXG4gICAgfVxyXG4gICAgc2V0VHJhbnNmb3JtKCkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGxldCBzY2FsZSA9IHRoaXMuY2FtZXJhLnpvb20gKiBjdHguY2FudmFzLmhlaWdodCAvIFZJRVdfSEVJR0hUO1xyXG4gICAgICAgIGxldCBkeCA9IC10aGlzLmNhbWVyYS5wb3NbWF0gKiBzY2FsZSArIGN0eC5jYW52YXMud2lkdGggLyAyO1xyXG4gICAgICAgIGxldCBkeSA9IC10aGlzLmNhbWVyYS5wb3NbWV0gKiBzY2FsZSArIGN0eC5jYW52YXMuaGVpZ2h0IC8gMjtcclxuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKHNjYWxlLCAwLCAwLCBzY2FsZSwgZHgsIGR5KTtcclxuICAgIH1cclxuICAgIGRyYXdDaXJjbGUoY2VudGVyLCByYWRpdXMsIHN0eWxlKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5zZXRTdHlsZShzdHlsZSk7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmMoY2VudGVyW1hdLCBjZW50ZXJbWV0sIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgc2V0U3R5bGUoc3R5bGUpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gc3R5bGUuZmlsbDtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHlsZS5zdHJva2U7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5hbHBoYTtcclxuICAgICAgICBpZiAoc3R5bGUuZ2xvdyA+IDApIHtcclxuICAgICAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gc3R5bGUuc3Ryb2tlO1xyXG4gICAgICAgICAgICBjdHguc2hhZG93Qmx1ciA9IDEwICogc3R5bGUuZ2xvdztcclxuICAgICAgICAgICAgY3R4LnNoYWRvd09mZnNldFggPSAwO1xyXG4gICAgICAgICAgICBjdHguc2hhZG93T2Zmc2V0WSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2NyZWVuVG9Xb3JsZChwKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgbGV0IHggPSBwW1hdO1xyXG4gICAgICAgIGxldCB5ID0gcFtZXTtcclxuICAgICAgICB4IC09IGN0eC5jYW52YXMuY2xpZW50V2lkdGggLyAyO1xyXG4gICAgICAgIHkgLT0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgLyAyO1xyXG4gICAgICAgIGxldCBmYWMgPSBWSUVXX0hFSUdIVCAvIGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHggKj0gZmFjO1xyXG4gICAgICAgIHkgKj0gZmFjO1xyXG4gICAgICAgIHJldHVybiBbeCwgeV07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5SZW5kZXJlciA9IFJlbmRlcmVyO1xyXG4oZnVuY3Rpb24gKFJlbmRlcmVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBSZW5kZXJlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFJlbmRlcmVyID0gZXhwb3J0cy5SZW5kZXJlciB8fCAoZXhwb3J0cy5SZW5kZXJlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlcmVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIHBhcnRpY2xlQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9wYXJ0aWNsZUNvbnRyb2xsZXInKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBTaGlwQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgU2hpcENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5fc2hpcHMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLnNoaXApXHJcbiAgICAgICAgICAgIHRoaXMuX3NoaXBzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9zaGlwcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLl9zaGlwcykge1xyXG4gICAgICAgICAgICBpZiAoZS5pc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlLnNoaXAuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZBbW91bnQgPSBlLnNoaXAuYWNjZWwgKiBzZWNvbmRzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGR2eCA9IGUuc2hpcC5kaXJlY3Rpb25bWF0gKiBkdkFtb3VudDtcclxuICAgICAgICAgICAgICAgIGxldCBkdnkgPSBlLnNoaXAuZGlyZWN0aW9uW1ldICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHlbWF0gKz0gZHZ4O1xyXG4gICAgICAgICAgICAgICAgZS5waHlzaWNzLnZlbG9jaXR5W1ldICs9IGR2eTtcclxuICAgICAgICAgICAgICAgIC8vIGV4aGF1c3Q6XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5zaGlwLmV4aGF1c3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZXhoYXVzdCA9IGUuc2hpcC5leGhhdXN0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9iYWJsZUFtb3VudCA9IGV4aGF1c3QucmF0ZSAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHVhbEFtb3VudDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvYmFibGVBbW91bnQgPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEFtb3VudCA9IE1hdGgucmFuZG9tKCkgPCBwcm9iYWJsZUFtb3VudCA/IDEgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQW1vdW50ID0gTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiBwcm9iYWJsZUFtb3VudCAqIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcFNwZWVkID0gZS5zaGlwLmFjY2VsICogZS5waHlzaWNzLm1hc3MgLyBleGhhdXN0Lm1hc3MgLyBleGhhdXN0LnJhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3R1YWxBbW91bnQ7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3BlZWRGYWN0b3IgPSBNYXRoLnJhbmRvbSgpICogMC41ICsgMC43NTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB2eCA9IChlLnNoaXAuZGlyZWN0aW9uW1hdICogLXBTcGVlZCAqIHNwZWVkRmFjdG9yKSArIGUucGh5c2ljcy52ZWxvY2l0eVtYXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB2eSA9IChlLnNoaXAuZGlyZWN0aW9uW1ldICogLXBTcGVlZCAqIHNwZWVkRmFjdG9yKSArIGUucGh5c2ljcy52ZWxvY2l0eVtZXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB4ID0gZS5wb3NpdGlvbltYXSAtIGUuc2hpcC5kaXJlY3Rpb25bWF0gKiBlLnBoeXNpY3MucmFkaXVzICogMS4yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHkgPSBlLnBvc2l0aW9uW1ldIC0gZS5zaGlwLmRpcmVjdGlvbltZXSAqIGUucGh5c2ljcy5yYWRpdXMgKiAxLjI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkocGFydGljbGVDb250cm9sbGVyXzEuUGFydGljbGVDb21wb25lbnQuY3JlYXRlUGFydGljbGUoW3B4LCBweV0sIFtwdngsIHB2eV0sIGUucmVuZGVyLmNvbG9yLCBleGhhdXN0Lm1hc3MsIGV4aGF1c3QucmFkaXVzLCAwLjMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5TaGlwQ29udHJvbGxlciA9IFNoaXBDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKFNoaXBDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBTaGlwQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFNoaXBDb250cm9sbGVyID0gZXhwb3J0cy5TaGlwQ29udHJvbGxlciB8fCAoZXhwb3J0cy5TaGlwQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNoaXBDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIFN5c3RlbTtcclxuKGZ1bmN0aW9uIChTeXN0ZW0pIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyB7XHJcbiAgICB9XHJcbiAgICBTeXN0ZW0uRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUb3BvbG9naWNhbGx5IHNvcnQgdGhlIHN5c3RlbXMgYmFzZWQgb24gdGhlaXIgZGVwZW5kZW5jaWVzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0T3JkZXIoc3lzT2JqZWN0KSB7XHJcbiAgICAgICAgbGV0IHN5c3RlbXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBzeXNPYmplY3QpIHtcclxuICAgICAgICAgICAgc3lzdGVtcy5hZGQobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvcmRlciA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChzeXN0ZW1zLnNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0SXRlbSA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgb2Ygc3lzdGVtcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN5cyA9IHN5c09iamVjdFtuYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXBlbmRzT25TZXQoc3lzLmRlcHMsIHN5c3RlbXMpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHN5cyBkb2Vzbid0IGRlcGVuZCBvbiBhbnl0aGluZyBzdGlsbCBpbiBzeXN0ZW1zO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IG11c3QgYmUgdGhlIG5leHQgaW4gdGhlIG9yZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgIG5leHRJdGVtID0gW25hbWUsIHN5c107XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5leHRJdGVtID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIEN5Y2xpYyBkZXBlbmRlbmN5P1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3lzdGVtcy5kZWxldGUobmV4dEl0ZW1bMF0pO1xyXG4gICAgICAgICAgICBvcmRlci5wdXNoKG5leHRJdGVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9yZGVyO1xyXG4gICAgfVxyXG4gICAgU3lzdGVtLmluaXRPcmRlciA9IGluaXRPcmRlcjtcclxuICAgIGZ1bmN0aW9uIGRlcGVuZHNPblNldChkZXBzLCBzeXN0ZW1zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBkZXBzKSB7XHJcbiAgICAgICAgICAgIGlmIChzeXN0ZW1zLmhhcyhuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5pdFN5c3RlbXMoc3lzT2JqZWN0KSB7XHJcbiAgICAgICAgbGV0IG9yZGVyID0gaW5pdE9yZGVyKHN5c09iamVjdCk7XHJcbiAgICAgICAgaWYgKG9yZGVyID09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gVHNvcnQgaGFzIGZhaWxlZC4gQWJvcnQuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgcGFpciBvZiBvcmRlcikge1xyXG4gICAgICAgICAgICBsZXQgc3lzID0gcGFpclsxXTtcclxuICAgICAgICAgICAgLy8gRmlsbCBpbiB0aGUgZGVwZW5kZW5jaWVzLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lIGluIHN5cy5kZXBzKSB7XHJcbiAgICAgICAgICAgICAgICBzeXMuZGVwc1tuYW1lXSA9IHN5c09iamVjdFtuYW1lXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzeXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFN5c3RlbS5pbml0U3lzdGVtcyA9IGluaXRTeXN0ZW1zO1xyXG59KShTeXN0ZW0gPSBleHBvcnRzLlN5c3RlbSB8fCAoZXhwb3J0cy5TeXN0ZW0gPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zeXN0ZW0uanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZW5lbWllc18xID0gcmVxdWlyZSgnLi9lbmVtaWVzJyk7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFdBVkVfUEVSSU9EID0gMztcclxuY29uc3QgR0VOX1JBRElVUyA9IDIwMDtcclxuY2xhc3MgV2F2ZUdlbmVyYXRvciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgV2F2ZUdlbmVyYXRvci5EZXBlbmRlbmNpZXMoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fd2F2ZVRpbWUgPSBXQVZFX1BFUklPRDtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGlmICh0aGlzLl93YXZlVGltZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVwcy5lbmVteUNvbnRyb2xsZXIuZW5lbWllcy5zaXplIDw9IDEwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlV2F2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3dhdmVUaW1lICs9IFdBVkVfUEVSSU9EO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YXZlVGltZSAtPSBzZWNvbmRzO1xyXG4gICAgfVxyXG4gICAgZ2VuZXJhdGVXYXZlKCkge1xyXG4gICAgICAgIGxldCBmb2xsb3dlcnMgPSAxMjtcclxuICAgICAgICBsZXQgdGFua3MgPSAyO1xyXG4gICAgICAgIGxldCBzZWVrZXJzID0gODtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbGxvd2VyczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KGVuZW1pZXNfMS5FbmVteUNvbXBvbmVudC5jcmVhdGVGb2xsb3dlcihwLCBnZW9fMS5Qb2ludC56ZXJvKCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YW5rczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KGVuZW1pZXNfMS5FbmVteUNvbXBvbmVudC5jcmVhdGVUYW5rKHAsIGdlb18xLlBvaW50Lnplcm8oKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZWtlcnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgcCA9IGdlb18xLmdlby5tYXRoLnJhbmRDaXJjbGUoZ2VvXzEuUG9pbnQuemVybygpLCBHRU5fUkFESVVTKTtcclxuICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eShlbmVtaWVzXzEuRW5lbXlDb21wb25lbnQuY3JlYXRlU2Vla2VyKHAsIGdlb18xLlBvaW50Lnplcm8oKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLldhdmVHZW5lcmF0b3IgPSBXYXZlR2VuZXJhdG9yO1xyXG4oZnVuY3Rpb24gKFdhdmVHZW5lcmF0b3IpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lbXlDb250cm9sbGVyID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgV2F2ZUdlbmVyYXRvci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFdhdmVHZW5lcmF0b3IgPSBleHBvcnRzLldhdmVHZW5lcmF0b3IgfHwgKGV4cG9ydHMuV2F2ZUdlbmVyYXRvciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdhdmVHZW5lcmF0b3IuanMubWFwIl19
