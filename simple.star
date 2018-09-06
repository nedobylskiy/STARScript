class SimpleContact{

    Storage: {
        Number CallsCount = 0;
    }

    Property: {
        String NAME = 'SimpleContract';
    }

    Event: {
        ContractCall(number);
    }

    public call(){
        storage.CallsCount++;
        console.log('CallsCount', storage.CallsCount);
        emit ContractCall(storage.CallsCount);
        return true;
    }
}


