'use strict';
export interface System {
    init(): void;

    deps: System.Dependencies;
}

export module System {
    export class Dependencies {
        [s: string]: System;
    }

    /**
     * Topologically sort the systems based on their dependencies.
     */
    export function initOrder(sysObject: Dependencies): [string, System][] {
        let systems = new Set<string>();
        for (let name in sysObject) {
            systems.add(name);
        }

        let order: [string, System][] = [];

        while (systems.size > 0) {
            let nextItem: [string, System] = null;

            for (let name of systems) { // Iterate over each system.
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

    function dependsOnSet(deps: Dependencies, systems: Set<string>): boolean {
        for (let name in deps) {
            if (systems.has(name)) {
                return true;
            }
        }

        return false;
    }
    
    export function initSystems(sysObject: Dependencies): boolean {
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
}