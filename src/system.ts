'use strict';
export interface System {
    init(): void;
    
    deps: System.Dependencies;
}

export module System {
    export class Dependencies {
        [s: string]: System;
    }
}