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
    .parse(process.argv);


const fs = require('fs');
const {removeComments, getClasses, parseOnceBlockRec} = require('./modules/parser');

let script = fs.readFileSync('test.star');

script = removeComments(script);
script = getClasses(script);

console.log(JSON.stringify(script, "", 4));

/*
for(let classS of script){
    console.log(JSON.stringify(explodeBlocks(classS.source)));
}*/


//console.log(JSON.stringify(parseOnceBlockRec( ' class asd { class z{ class y {} } }')));

//console.log(script);

