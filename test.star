
class Parent extends Some{

}


class Name extends Parent{

	Event: {
		Transfer(string, string, number);
		Burn(string, number);
		Mint(string, number);
		Test(string[], number[]);
	}

    Storage: {
        KeyValue tokens;
        BigNumber totalSupply = 0;
    }

	Property: {
	    String decimals = '70';
	    Address owner = 'MY_ADDR';
	}

	public Name(string address, BigNumber emission){
        emit Mint(address, emission);
	}

	public sayHello(string who){
		return this._sayHelloToAll([who]);
	}

	private _sayHelloToAll(string[] whos){
		let hellows = '';
		for(let who of whos){
		    hellows+=`Hello, ${who}`;
		}

		return hellows;
	}
}




class NotExtended{

    Storage: {
        Number ITSNOTEXTENDED = 100500;
        BlockchainArraySafe justArray = [1,2,3];
    }

    Property: {
        String hello = 'Hello';
    }
}


