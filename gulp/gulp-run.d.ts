/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/gulp/gulp.d.ts" />
/// <reference path="../typings/vinyl/vinyl.d.ts" />


declare module 'gulp-run' {
    import Vinyl = require('vinyl');
    import * as gulp from 'gulp';
    import * as stream from 'stream';

    module run {
        export interface RunError {
            /**
             * The exit status of the program.
             */
            status: number;
        }

        export interface RunStream extends stream.Transform {
            /**
             * Start a gulp pipeline and execute the command immediately, pushing the results downstream.
             * @param stdin If given, this will be used as stdin for the command.
             * @param callback The callback is called once the command has exited.
             * An Error is passed if the exit status was non-zero.
             */
            exec(stdin?: string | Buffer | Vinyl, callback?: (error?: RunError) => void): stream.Readable
        }

        export interface CommandOptions {
            /**
             * The environmental variables for the child process. Defaults to process.env
             */
            env?: {},
            
            /**
             * The initial working directory for the child process. Defaults to process.cwd().
             */
            cwd?: string,
            
            /**
             * If true, do not print the command's output.
             * This is the same as setting verbosity to 1. Defaults to false.
             */
            silent?: boolean,
            
            /**
             * Sets the verbosity level. Defaults to 3.
             */
            verbosity?: number
            
            /**
             * Windows only. If true uses the PowerShell instead of cmd.exe for command execution.
             */
            usePowerShell?: boolean
        }
        /**
         * Represents a command to be run in a subshell.
         */
        export class Command {
            /**
             * Represents a command to be run in a subshell.
             * @param template The command to run.
             * It can be a template interpolating the variable file which references the Vinyl file being input.
             */
            constructor(template: string, options?: CommandOptions);
            
            /**
             * Spawn a subshell and execute the command.
             * @param stdin If given, this will be used as stdin for the command.
             * @param callback The callback is called once the command has exited.
             * An Error is passed if the exit status was non-zero.
             */
            exec(stdin?: string | Buffer | Vinyl, callback?: (error?: RunError) => void): Vinyl;

            toString(): string;
        }
    }
    /**
     * Creates a Vinyl (gulp) stream that transforms its input by piping it to a shell command.
     * @param template The command to run.
     * It can be a template interpolating the variable file which references the Vinyl file being input.
     */
    function run(template: string, options?: run.CommandOptions): run.RunStream;
    export = run;
}
