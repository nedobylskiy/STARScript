/**
 * STARScript - Safe Templated Application-Related Script
 * Extended JavaScript for safe DApp applications
 * @author Andrey Nedobylsky
 **/

'use strict';

let program = require('commander');
program
    .version(require('./package.json').version)
    .description(require('./package.json').description)
    .option('--source-tree [path]', 'Save decomposed source tree to [path]', false)
    .option('--ecma-contract [path]', 'Generate ECMAScript Smart Contract file to [path]', false)
    .option('--ecma-contract-class [class]', 'Contract class [class]', false)
    .option('--minify', 'Generate minimized outputs (if possible)', false)
    .parse(process.argv);


const fs = require('fs');
const {decompose} = require('./modules/parser');
const targetFile = program.args[0];

if(typeof targetFile === 'undefined' || targetFile.length === 0) {
    console.log('Error: Target not specified');
    process.exit(1);
}

if(!fs.existsSync(targetFile)) {
    console.log(`Error: Target "${targetFile}" not found`);
    process.exit(1);
}

let script = fs.readFileSync(targetFile);

script = decompose(script);

//Save source tree
if(program.sourceTree) {
    if(program.sourceTree === '-') {
        console.log(JSON.stringify(script, "", 4));
    } else {
        if(program.sourceTree === true) {
            program.sourceTree = targetFile + '.json';
        }
        fs.writeFileSync(program.sourceTree, JSON.stringify(script, "", 4))
    }
}

//Compose to ECMA contract
if(program.ecmaContract) {

    let {compose} = new require('./composers/ecmaContract');
    let composed;
    try {
        composed = compose(script, program.ecmaContractClass);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
    if(program.minify) {
        composed = require("uglify-es").minify(composed).code;
    }

    if(program.ecmaContract === true) {
        program.ecmaContract = targetFile.split('.')[0] + '.js';
    }


    fs.writeFileSync(program.ecmaContract, composed);
}


