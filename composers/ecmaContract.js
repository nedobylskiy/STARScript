/**
 * STARScript - Safe Templated Application-Related Script
 * Extended JavaScript for safe DApp applications
 * @author Andrey Nedobylsky
 **/


/**
 * iZ3 ECMAScript contracts composer
 */


const ECMA_INTERNAL = 'const _ECMA_INTERNAL = new ( ' + function () {
    let globalStorageInstanes = {};
    return {
        /**
         * Types validator
         */
        validateType: {
            string: function (input) {
                if(typeof input === 'string') {
                    return input;
                }

                if(typeof  input['toString'] !== 'undefined') {
                    return input.toString();
                }

                assert.true(false, 'STARScript: Invalid input string');
            },
            number: function (input) {
                if(typeof input === 'number') {
                    return input;
                }

                if(!Number.isNaN(Number(input)) && Number.isFinite(Number(input))) {
                    return Number(input);
                }

                assert.true(false, 'STARScript: Invalid input Number');
            },
            BigNumber: function (input) {
                if(!new BigNumber(input).isNaN()) {
                    return new BigNumber(input);
                }

                assert.true(false, 'STARScript: Invalid input BigNumber');
            }
        },
        /**
         * Global variables storage
         * @param className
         * @return {*}
         */
        createOrGetGlobalStorageInstance: function (className) {
            if(typeof globalStorageInstanes[className] === 'undefined') {
                globalStorageInstanes[className] = new KeyValue(className);
                return globalStorageInstanes[className];
            }

            return globalStorageInstanes[className];
        },
        decodeType(val) {
            if(typeof val !== 'object') {
                val = JSON.parse(val);
            }
            switch (val.type) {
                case 'number':
                    return Number(val.val);
                case 'string':
                    return String(val.val);
                case 'BigNumber':
                    return new BigNumber(val.val);
                default:
                    return val.val;
            }
        },
        encodeType: function (val, type) {
            switch (type) {
                case 'Number':
                case 'number':
                    return JSON.stringify({type: 'number', val: Number(val)});
                case 'String':
                case 'string':
                    return JSON.stringify({type: 'string', val: val});
                case 'BigNumber':
                    return JSON.stringify({type: 'BigNumber', val: new BigNumber(val).toFixed()});
                default:
                    return JSON.stringify({type: 'object', val: val});
            }
        }
    }
} + ')();\n\n';

/**
 * Returns method
 * @param name
 * @param classObj
 * @return {*}
 */
function getMethodObjByName(name, classObj) {
    for (let method of classObj.components.methods) {
        if(method.name === name) {
            return method;
        }
    }

    return false;
}

function getEventsCreationStr(events) {
    let str = '';
    for (let event of events) {
        if(event.params.length > 10) {
            throw 'Error: Event can take 10 arguments maximum in "' + event.name + '" event'
        }
        let types = paramsArray2jsParams(event.params, true);
        str += `this.${event.name} = new Event('${event.name}', ${types.params});\n`;
    }

    str += "\n";

    return str;
}

/**
 * Create validator caller
 * @param param
 * @return {string}
 */
function createParamValidator(param) {
    switch (param.type) {
        case 'String':
        case 'string':
            return `${param.name} = _ECMA_INTERNAL.validateType.string(${param.name});\n`;
        case 'number':
        case 'Number':
            return `${param.name} = _ECMA_INTERNAL.validateType.number(${param.name});\n`;
        case 'BigNumber':
            return `${param.name} = _ECMA_INTERNAL.validateType.BigNumber(${param.name});\n`;
        default:
            throw 'Error: Invalid param type: "' + param.type + '"';
    }
}

function eventsEmitToCall(source, emits) {
    for (let emit of emits) {
        let params = (emit.params.join(', ') + ' ').replace(',  ', '');

        let eventCall = `this.${emit.event}.emit(${params});\n`;

        source = source.replace(emit.template, eventCall);
    }
    return source;
}

/**
 * Compose method params with validators
 * @param params
 * @return {{params: string, validators: string}}
 */
function paramsArray2jsParams(params, quoted, methodName, private) {
    let jsParams = '';
    let validators = '';
    let jsDoc = '/**\n';
    if(methodName) {
        jsDoc += `* ${methodName}\n`;
    }
    if(private) {
        jsDoc += `* @private\n`;
    }
    for (let param of params) {
        if(param.name) {
            jsParams += `${param.name}, `;
            jsDoc += `* @param {${param.isarray ? 'Array' : param.type}} ${param.name}\n`;
            if(param.type === 'string') {
                validators += createParamValidator(param);
            }
        } else {
            jsParams += `${quoted ? '"' : ''}${param.isarray ? 'array' : param.type}${quoted ? '"' : ''}, `;
        }
    }

    jsDoc += '*/\n';

    jsParams += ' ';
    jsParams = jsParams.replace(',  ', '');
    return {params: jsParams, validators: validators, jsdoc: jsDoc};
}

/**
 * Compose class to js
 * @param classObj
 * @return {string}
 */
function composeClass(classObj) {

    let classJsSource = `class ${classObj.info.name}`;
    if(classObj.info.extends) {
        classJsSource += ` extends ${classObj.info.extends}`;
    }
    classJsSource += "{\n";

    //Standard constructor
    let classConstructor = getMethodObjByName(classObj.info.name, classObj);

    let storage = composeStorage(classObj.components.storage);
    let constructStorage = `\n\nconst that = this; this._storageTypes = {}; this._varsStorage = _ECMA_INTERNAL.createOrGetGlobalStorageInstance("${classObj.info.name}");\n
        this.storage = new (function(){
            let that2 = this;
            this.currentInstances = {};
            return  new Proxy(this, {
                _putRawObject(name, object){
                    that2.currentInstances[name] = object;
                },
                 get(target, item) {
                    if(typeof that2.currentInstances[item] !== 'undefined'){
                        return that2.currentInstances[item];
                    }
                    let encodedVar = that._varsStorage.get(item);
                    if(!encodedVar){
                        return undefined;
                    }
                    
                    return _ECMA_INTERNAL.decodeType(encodedVar);
                 },
                 set(target, item, value) {
                    let type = 'object';
                    if(typeof that._storageTypes[item] !== 'undefined'){
                        type = that._storageTypes[item];
                    }
                    
                    that._varsStorage.put(item, _ECMA_INTERNAL.encodeType(value, type));
                                        
                   // return value;
                    return true;
                 }
            });
        })();\n
    \n\n`;

    if(!classConstructor) {
        //throw 'Error: Class "'+classObj.info.name+'" does not have a constructor method. The presence of the constructor method is necessary with the strict rules for the contracts composing'
        classJsSource += `  constructor(){\n`;
        if(classObj.info.extends) {
            classJsSource += `      super();\n`;
        }

        classJsSource += constructStorage;

        //Events create
        classJsSource += getEventsCreationStr(classObj.components.events);

        classJsSource += storage.construct;
        classJsSource += `      if(contracts.isDeploy()){\n${storage.deploy}\n}\n`;
    } else {
        let constructParams = paramsArray2jsParams(classConstructor.params);
        classJsSource += constructParams.jsdoc;
        classJsSource += `  constructor(${constructParams.params}){\n`;
        if(classObj.info.extends) {
            classJsSource += `      super(${constructParams.params});\n`;
        }
        classJsSource += `      ${constructParams.validators}`;
        classJsSource += constructStorage;

        //Events create
        classJsSource += getEventsCreationStr(classObj.components.events);

        classJsSource += storage.construct;
        //Contract constructor
        classJsSource += `      if(contracts.isDeploy()){\n${storage.deploy}\n this.${classObj.info.name}(${constructParams.params});}\n`;

        classJsSource += `  }\n     ${classObj.info.name}(${constructParams.params}){\n let storage = this.storage; let that = this;\n`;
        //Constructor source
        classJsSource += eventsEmitToCall(classConstructor.source, classObj.components.emits);
    }
    classJsSource += `  }\n`;


    //Methods and properties
    classJsSource += '  ' + composeProperty(classObj.components.property);
    classJsSource += '  ' + composeMethods(classObj.components.methods, classObj);

    classJsSource += '\ninit(){}\n';

    classJsSource += "\n}\n";


    return classJsSource;
}

/**
 * Create storage init script part
 * @param storage
 * @return {{construct: string, deploy: string}}
 */
function composeStorage(storage) {
    let constructVars = '';
    let deployVars = '';

    for (let v of storage) {
        switch (v.type) {
            case 'KeyValue':
                if(v.value !== '') {
                    throw 'Error: KeyValue type does not accept default values for "' + v.name + '" variable'
                }
                constructVars += `   this.${v.name} = new KeyValue('${v.name}'); this.storage._putRawObject(${v.name},this.${v.name}); \n`;
                continue;
            case 'BlockchainArraySafe':
                if(v.value === '') {
                    constructVars += `   this.${v.name} = new BlockchainArraySafe('${v.name}'); this.storage._putRawObject(${v.name},this.${v.name}); \n`;
                } else {
                    constructVars += `   this.${v.name} = new BlockchainArraySafe('${v.name}'); this.storage._putRawObject(${v.name},this.${v.name}); \n`;
                    deployVars += `this.storage.${v.name}.applyArray(${v.value});`;
                }
                continue;

            case 'BlockchainArray':
                if(v.value === '') {
                    constructVars += `   this.${v.name} = new BlockchainArray('${v.name}'); this.storage._putRawObject(${v.name},this.${v.name}); \n`;
                } else {
                    constructVars += `   this.${v.name} = new BlockchainArray('${v.name}'); this.storage._putRawObject(${v.name},this.${v.name}); \n`;
                    deployVars += `this.storage.${v.name}.applyArray(${v.value});`;
                }
                continue;
            case 'Number':
            case 'number':
                constructVars += `   this._storageTypes['${v.name}']='number'; this.storage.${v.name} = ${v.value};   this._varsStorage.put('${v.name}', _ECMA_INTERNAL.encodeType(${v.value}, 'number'));\n`;
                continue;
            case 'String':
            case 'string':
                constructVars += `   this._storageTypes['${v.name}']='string'; this.storage.${v.name} = ${v.value};    this._varsStorage.put('${v.name}', _ECMA_INTERNAL.encodeType(${v.value}, 'string'));\n`;
                continue;
            case 'BigNumber':
                constructVars += `   this._storageTypes['${v.name}']='BigNumber';  this.storage.${v.name} = new BigNumber(${v.value});   this._varsStorage.put('${v.name}', _ECMA_INTERNAL.encodeType(${v.value}, 'BigNumber'));\n`;
                continue;
            case 'Object':
                constructVars += `   this._storageTypes['${v.name}']='object'; this.storage.${v.name} = ${v.value};   this._varsStorage.put('${v.name}', _ECMA_INTERNAL.encodeType(${v.value}, 'object'));\n`;
                continue;
            default:
                throw 'Error: Undefined storage type "' + v.type + '" for "' + v.name + '"';
        }
    }

    return {construct: constructVars, deploy: deployVars}
}


/**
 * Compose properties
 * @param properties
 * @return {string}
 */
function composeProperty(properties) {
    let propertySources = '';
    for (let property of properties) {
        propertySources += `    /**\n* @returns {${property.type}}\n*/ \n`;
        propertySources += `    get ${property.name}(){ return ${property.value};}\n`;
    }

    return propertySources;
}

/**
 * Compose methods with validators
 * @param methods
 * @return {string}
 */
function composeMethods(methods, obj) {
    let methodsSources = '';
    for (let method of methods) {
        if(method.name === obj.info.name) {
            continue;
        }
        let params = paramsArray2jsParams(method.params, false, method.name, method.type === 'private');
        methodsSources += params.jsdoc + "\n";
        methodsSources += `   ${method.name}(${params.params}){\n`;
        methodsSources += params.validators + '\n';
        methodsSources += `   let storage = this.storage; let that = this; \n\n${eventsEmitToCall(method.source, obj.components.emits)}\n`;
        methodsSources += `   }\n`;
    }
    return methodsSources;
}

/**
 * Compose script
 * @param tree
 * @param contractClass
 * @return {boolean}
 */
module.exports.compose = function (tree, contractClass) {
    let classes = [];
    let extended = [];
    let classByName = {};
    let depency = [];

    let source = "/**\n* iZ3 ECMAScript Smart Contracts compiler.\n* THIS FILE WAS CREATED AUTOMATICALLY. DO NOT EDIT IT.\n* @created " + (new Date()) + "\n*/\n\n";
    source += ECMA_INTERNAL;


    for (let classUnit of tree) {
        classes.push(classUnit.info.name);
        if(classUnit.info.extends) {
            extended.push(classUnit.info.extends);
        }
    }

    //Class depency check
    for (let classUnit of tree) {
        if(classUnit.info.extends) {
            if(classes.includes(classUnit.info.extends) && typeof classByName[classUnit.info.extends] === 'undefined') {
                throw 'Error: Class "' + classUnit.info.name + '" extends "' + classUnit.info.extends + '" but the extensible class was declared later';
            }
            classByName[classUnit.info.name] = classUnit;
            depency.push({class: classUnit.info.name, depency: classUnit.info.extends});
        }
    }

    if(classes.length === 0) {
        throw 'Error: There are no classes ready for code generation';
    }

    if((contractClass === false || contractClass === true) && classes.length > 1) {
        throw 'Error: Contract class is unobvious: "' + classes.join('", "') + '". Use `--ecma-contract-class` param for select contract class';
    }
    if((contractClass === false || contractClass === true) && classes.length === 1) {
        contractClass = classes[0];
    }
    if(!classes.includes(contractClass)) {
        throw 'Error: Class "' + contractClass + '"  is not declared'
    }

    for (let classUnit of tree) {
        source += composeClass(classUnit);
    }

    source += `\nglobal.registerContract(${contractClass});\n`;

    return source;

};