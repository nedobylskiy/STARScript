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

