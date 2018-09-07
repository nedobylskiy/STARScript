![STAR Logo](https://github.com/lailune/STARScript/raw/master/logo.fw.png | width=250)

# STAR (Safe Templated dApplication-Related) Script
**Programming language for safe decentralized event-driven applications**

## Structure

```javascript
class SimpleApplication extends Contract{

    //Always accessible state-safe variables storage
    Storage: {
        Number CallsCount = 0;
    }

    //Applications constants. Accessible like this.NAME
    Property: {
        String NAME = 'SimpleApplication';
    }

    //Application can emit these events
    Event: {
        ApplicationCalled(number);
    }

    /**
    * This is constructor
    * @constructor
    */
    SimpleApplication(){
        console.log('I am constructed');
    }

    /**
    * Call application method
    * @return {boolean}
    */
    public call(){
        storage.CallsCount++;
        console.log('CallsCount', storage.CallsCount);
        emit ApplicationCalled(storage.CallsCount); //Emit event
        return true;
    }
    
    /**
    * Reset calls count 
    */
    public reset(){
        this._setCalls(0);
    }
    
    /**
    * Set calls count private
    * @param {number} calls Calls count
    * @private
    */
    private _setCalls(number calls){
        storage.CallsCount = calls;
    }
}

```

## How
STARScript - is a variant of JavaScript dialect. At now, STAR compiler can translate STARScript directly to ECMAScript Smart Contract of IZZZIO blockchain platform. 
You can add additional compositors/compilers by working with `Source Tree` file.

## Write Smart Contracts
For IZZZIO blockchain STAR realize some contract-style recommendations under-the-hood. For example:

Standard ECMAScript Smart Contracts initialization for early example is: 
```javascript
    class SimpleApplication extends Contract{
        constructor(){
            super();
            this.storage = new KeyValue('SimpleApplication');
            if(contracts.isDeploy()){
                this.storage.put('CallsCount', 0);
                console.log('I am constructed');
            }
        }
    }
```

and more a lot of code for other methods...

Methods of STARScript completly compatible with JavaScript code. You can write as you want, using let, function(){}, for, while, switch & etc...

```javascript
    public method(){
        let a = 123;
        return a;
    }
```

**BUT**

All methods has access to storage object, like `this.storage` or just `storage`. Also all methods has sweety useful variable - `that`.
`that` is a like you write `const that = this;` in header of the method. It's useful for accessing main object context from any function or place.

## Methods typing
As you can see all methods has types in arguments list. STAR guaranteed that the type of the arguments variable matches or can be cast to requested type. For example:

```javascript
    /**
    * This method takes only numbers
    */
    public onlyNumbers(number i){
        return i+i;
    }
    
    // example for JS
    
    function onlyNumbers(i){
        return i+i;
    }
    ...
    
    //In STAR
    console.log(onlyNumbers(1));
    //Writes 2
    
    //In JS
    console.log(onlyNumbers(1));
    //Also writes 2
    
    //In STAR
    console.log(onlyNumbers('1'));
    //Writes 2 - cuz guaranteed typing
    
    //In JS
    console.log(onlyNumbers('1'));
    //Writes '11' cuz just string concatenation
    
    //In STAR
    console.log(onlyNumbers('Hello! '));
    //thows an Exception with TypeError
    
    //In JS
    console.log(onlyNumbers('Hello! '));
    //Writes 'Hello! Hello! ' Oh? Hi :)
   
```

but in other places STAR has JS typing

```javascript

        public onlyNumbers(number i){
            let variable = 'Hello no '+i;
            return variable;
        }
        
        console.log(onlyNumbers(3));
        //Writes 'Hello no 3'
```

In fact STAR convert this method to this:

```javascript
    function onlyNumbers(i){
        //Hidden stuff
        i = _checker.checkNumber(i); 
        const that = this;
        
        //Method code
        let variable = 'Hello no '+i;
        return variable;
    }
```

## Storage

Star provides idea of independent state-safe data storage. For example: In IZZZIO contracts you must load variables from KeyValue storage in every `constructor` call. Also you must set default values in `init`  method or by checking `isDeploy` status in constructor. 

**STAR takes this work on itself!**

Just declare one of you variable in `Storage` section and it will be loads and save every time:

```javascript
    Storage:{
        Number myIntVar = 3;
        String someTextVar = 'Foo';
        Array myArray = [1,2,3];
        Object wowObject = {foo:{bar:3}};
        
        //Also you can use some internal types
        KeyValue stoooraaage; //KeyValue can't take some default value
        BlockchainArraySafe safetyFirst = ['b','l','o','c','k','c','h','a','i','n']; //too long
        BlockchainArray dangerous = ['Hello', 'world','!'];
        
    }
```

And you can use it just with storage object:

```javascript

    //Those variables writes and reads provided by storage hidden-object
    storage.myIntVar++; //Yep, operators too
    storage.someTextVar = storage.someTextVar.substr(1); //now i'ts "oo"
    this.storage.myArray[0] = 321; //storage accessible from this
    that.storage.wowObject.foo.bar //3. Yep. You can take it in `that` too
    
    //Internal types  stores data itself
    storage.stoooraaage.put('Key','Value');
    console.log(storage.safetyFirst[2]); //Writes 'o'
    storage.myArray = that.storage.dangerous.toArray(); //Dangerous but works
```

## Events
STAR is a event-driving language. Main idea - every pure STAR objects can *emit* some events with some data params while working. Other object and external objects can subscribe to this events and work with it.

STAR events based on ECMAScript Smart Contracts Events

First you can declare events in `Event` block:

```javascript
    Event:{
        Hello(string); //Hello event with greetings string
        Bye(string);   //Other event
    }
```

and now you can *emit* this events as you want: 

```javascript
    public sayHello(string person){
        emit Hello(person);
    }
    
    public sayBye(string theNameOfTheHandYouWantToWave){
        emit Bye(theNameOfTheHandYouWantToWave);
    }
```

## Properties
Just object constant properties. Accesaible via this.propertyName

For ex:
```javascript
    Property: {
        String Foo = 'Bar';
        Number Pi = 3.14;
    }
    
   ...in some method...
   
   console.log(this.Foo); //'Bar'
   console.log(this.Pi*(radius/radius)); //Some circle square
```

## Compiler usage
Compiler works on 2 stages:
* Parsing and prepare source description object - `Source tree`
* Composing(compiling) `Source tree` to file with one of composers

At now you can use only ECMAScript Smart Contract composer

Usage:

```bash
# Create source tree
node main.js test.star --source-tree test.star.json

# Create contract
node main.js test.star --ecma-contract test.js --ecma-contract-class Name

```

## Contributing
* Fork this repository
* Make changes
* Create Pull request from fork to this repo with detail description
* Don't forget merge tou code with `master` first!