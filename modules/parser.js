/**
 * STARScript - Safe Templated Application-Related Script
 * Extended JavaScript for safe DApp applications
 * @author Andrey Nedobylsky
 **/

String.prototype.replaceAt = function (index, replace) {
    return this.substring(0, index) + replace + this.substring(index + 1);
};

const classEventsRegexp = /Event\s*:*\s*{\s*([^]*?)\s*?}/mg;
const classStorageRegexp = /Storage\s*:*\s*{\s*([^]*?)\s*?}/mg;
const classPropertyRegexp = /Property\s*:*\s*{\s*([^]*?)\s*?}/mg;
const classMethodsRegexp = /(public|private)\s*([A-Za-z0-9_]*)\(([A-Za-z0-9_, \[\]]*)\)\s*{([^]*?)}/mg;


/**
 * Extract components from class
 * @param source
 * @return {{events: ({groups: {}}|RegExpExecArray), storage: ({groups: {}}|RegExpExecArray), property: ({groups: {}}|RegExpExecArray), methods: ({groups: {}}|RegExpExecArray)}}
 */
function extractClassComponents(source) {
    let events = classEventsRegexp.exec(source);
    if(!events) {
        events = '';
    } else {
        if(typeof  events[1] !== 'undefined') {
            events = events[1];
        }
    }

    let storage = classStorageRegexp.exec(source);
    if(!storage) {
        storage = '';
    } else {
        if(typeof  storage[1] !== 'undefined') {
            storage = storage[1];
        }
    }

    let property = classPropertyRegexp.exec(source);
    if(!property) {
        property = '';
    } else {
        if(typeof  property[1] !== 'undefined') {
            property = property[1];
        }
    }


    let methodsArr = [];
    /* let methods = classMethodsRegexp.exec(source);
     if(!methods) {
         methods = '';
     } else {
         if(typeof  methods[1] !== 'undefined') {
             methods = methods[1];
         }
     }*/
    let methodSource;

    while ((methodSource = classMethodsRegexp.exec(source)) !== null) {
        methodsArr.push({
            type: methodSource[1].trim(),
            name: methodSource[2].trim(),
            params: parseParametersList(methodSource[3].trim()),
            body: methodSource[4].trim()
        });
    }

    return {
        events: parseEvents(events),
        storage: parseVarsDefinitions(storage),
        property: parseVarsDefinitions(property),
        methods: methodsArr
    };
}

/**
 * Extract events
 * @param events
 * @return {Array}
 */
function parseEvents(events) {
    const eventsRegexp = /([A-Za-z_0-9]*)\s*\(([A-Za-z0-9_, ]*)\)\s*;/mg;
    let eventsParsed;
    let eventsArray = [];
    while ((eventsParsed = eventsRegexp.exec(events)) !== null) {
        eventsArray.push({
            source: eventsParsed[0].trim(),
            name: eventsParsed[1].trim(),
            params: parseParametersList(eventsParsed[2].trim())
        });
    }

    return eventsArray;
}

/**
 * Extract vars definitions
 * @param definitions
 * @return {Array}
 */
function parseVarsDefinitions(definitions) {
    const varRegexp = /([A-Za-z0-9_]*)\s*([A-Za-z0-9_]*)\s*(=\s*([^]*?)\s*|\s*);/mg;
    let varParsed;
    let varsArray = [];
    while ((varParsed = varRegexp.exec(definitions)) !== null) {
        varsArray.push({
            source: varParsed[0].trim(),
            type: varParsed[1].trim(),
            name: varParsed[2].trim(),
            value: typeof varParsed[4] === 'undefined' ? '' : varParsed[4]
        });
    }

    return varsArray;
}


/**
 * Parse params by name, type and array definition
 * @param params
 * @return {Array}
 */
function parseParametersList(params) {
    const paramsRegexp = /((([A-Za-z0-9_]*)(\[]*))|(([A-Za-z0-9_]*?)(\[]|\s*))\s*([A-Za-z0-9_]*))\s*(,|$)/mg;

    let varParsed;
    let varsArray = [];
    while ((varParsed = paramsRegexp.exec(params)) !== null) {
        //console.log(varParsed);
        if(varParsed[1].length === 0) {
            break;
        }

        if(varParsed[4] === '[]' || varParsed[7] === '[]') { //Array definition
            if(varParsed[4] === '[]') { //Array without name
                varsArray.push({type: varParsed[3], isarray: true, name: false});
            } else {
                //Named array
                varsArray.push({type: varParsed[6], isarray: true, name: varParsed[8]});
            }
            continue;
        }

        if(varParsed[6] !== '') {
            varsArray.push({type: varParsed[6], isarray: false, name: varParsed[8]});
            continue;
        }

        varsArray.push({type: varParsed[8], isarray: false, name: false});


    }

    return varsArray;
}

/**
 * Parse class info
 * @param classSource
 * @return {{name: string, extends: *}}
 */
function getClassInfo(classSource) {
    const regex = /class\s*([A-Za-z0-9_$]*)\s*(extends\s*([A-Za-z0-9_$]*)|)/mg;

    let result = regex.exec(classSource);

    return {name: result[1], extends: typeof result[3] === 'undefined' ? false : result[3]};
}

/**
 * Extract all classes
 * @param text
 * @return {Array}
 */
function getClasses(text) {
    let classes = [];

    let openCBrace = 0;
    let isClassNow = false;
    let openQuote = false;
    let currentClassText = '';

    text = text.split('');

    function checkClassKeyword(index) {
        let tempstr = '';
        tempstr += text[index];  //c
        tempstr += text[index + 1];//l
        tempstr += text[index + 2];//a
        tempstr += text[index + 3];//s
        tempstr += text[index + 4];//s

        return tempstr === 'class';
    }

    for (let ci = 0; ci < text.length; ci++) {

        if(text[ci] === '{') {
            openCBrace++;
        }

        //Check is not string literal
        if(text[ci - 1] !== '\\' && (text[ci] === '"' || text[ci] === "'" || text[ci] === "`")) {
            openQuote = !openQuote;
        }

        //If starts class
        if(text[ci] === 'c' && checkClassKeyword(ci) && !openQuote && !isClassNow && openCBrace === 0) {
            isClassNow = true; //set class flag
        }

        //If class now
        if(isClassNow) {
            currentClassText += text[ci]; //save to curr text
        }

        //Class parsing finished
        if(isClassNow && !openQuote && openCBrace === 1 && text[ci] === '}') {
            classes.push({
                info: getClassInfo(currentClassText),
                components: extractClassComponents(currentClassText),
                source: currentClassText.trim()
            });
            currentClassText = '';
        }


        if(text[ci] === '}') {
            openCBrace--;
        }
    }

    return classes;
}

/**
 * Remove all comments
 * @param string
 * @return {string}
 */
function removeComments(string) {
    return String(string).replace(/(\/\/.*|\/\*(\*(?!\/)|[^*])*\*\/)/mg, '');
}

function parseOnceBlockRec(text) {

    let blocks = [];
    let openCBrace = 0;
    let openQuote = false;
    let currentBlockText = '';
    let beforeCurrentBlockText = '';


    text = text.trim();//.split('{');
    //text[0] = '';
    //text = text.join('{');
    // text = text.replaceAt(0, '');


    console.log('TEXT', text);

    let source = text;
    text = text.split('');


    for (let ci = 0; ci < text.length; ci++) {

        if(text[ci] === '{') {
            openCBrace++;
        }

        if(openCBrace > 0) {
            currentBlockText += text[ci];
        }


        if(text[ci] === '}') {
            openCBrace--;
        }

    }

    currentBlockText = currentBlockText.replaceAt(currentBlockText.indexOf('{'), '');
    currentBlockText = currentBlockText.replaceAt(currentBlockText.lastIndexOf('}'), '');
    currentBlockText = currentBlockText.trim();

    if(currentBlockText.length !== 0) {
        //  return [{sub: parseOnceBlockRec(currentBlockText), blockSource: currentBlockText, createSource:}];
    }

    return [];


    console.log('BTEXT', currentBlockText);

    /*if(openCBrace === -1) {
        blocks.push(text.join('').trim());
    }*/

    if(openCBrace < 0) {
        throw 'Invlid brace';
    }


    /*  let blocks2 = [];

      for (let block of blocks) {
          if(block === '}') {
              block = '';
          }
          blocks2.push({sub: explodeBlocks(block), source: block})
      }
      return blocks2;*/
}


/*function getBlocksWithSub(text){
    let blocks = [];
    blocks = explodeBlocks(text);

}*/

module.exports.removeComments = removeComments;
module.exports.getClasses = getClasses;
module.exports.parseOnceBlockRec = parseOnceBlockRec;
