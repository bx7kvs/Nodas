import dts from 'rollup-plugin-dts'
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import {terser} from "rollup-plugin-terser";
import pkg from "./package.json"
import node from "@rollup/plugin-node-resolve";
import polyfill from 'rollup-plugin-polyfill-node'

/**
 * @type {import('rollup').RollupOptions}
 */
export default [

    {
        input: "Nodas.ts",
        output: [
            {
                file: pkg.main,
                sourcemap: 'inline',
                format: "cjs",
                exports: "named"
            },
            {
                file: pkg.module,
                sourcemap: 'inline',
                format: 'es'
            }
        ],
        plugins: [
            typescript({
                tsconfig: 'tsconfig.json',

            }),
            terser({
                keep_fnames : true
            }),
            commonjs({
                extensions: ['.ts', '.js'],
            }),
            polyfill({
                include: ['events']
            }),
            node({
                browser: true
            })
        ],
    },
    {
        input: "Nodas.ts",
        output: {
            file: pkg.types,
            format: "es"
        },
        plugins: [
            dts(),
            node({
                browser: true
            })
        ],
    }
]