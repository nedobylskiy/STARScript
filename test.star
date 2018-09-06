class Name extends Parent{

    //Внешние генерируемые события
	Event: {
		Transfer(string, string, number);
		Burn(string, number);
	}

    //Доступные всегда переменные с всегда известным состоянием
    Storage: {
        BlockchainArray database = [1,2,3,'33']; //Будет создавать экземпляр BlockchainArray один раз и прокидывать в него загрузку в последующие
        string HELLO = 'World';                  //Сохранит в спец раздел для всегда доступных переменных
        Number my = 321;                        //Сохранит в спец раздел для всегда доступных переменных
		Object test = [a:[b:3]];				//Объекты - ассоциативные массивы
    }

    //Неизменяемые внешне-доступные свойства
	Property: {
	    string decimals = '70';
	    number pi = 3.14;
	}

	Name(){ //Конструктор, вызываемый по имени

	}

	public hello(string who){ //синаксис похожий на си
		return who+' world';
	}

	private internalMethod(string hi){
		return hi*2;
	}
}



class Same extends Name{

	const string HELLO = 'World';
	BlockchainArray database = [1,2,3,'33']; //может здесь сделать жесткую типизацию как ниже
	BlockchainArray<Number> database2 = [1,2,3,'33']; //из-за "33" выкинет ошибку
	//Тут кстати момент, что BlockchainArray это не тип а класс, который на вход принимает название объекта
	//для хранилища, так что прикольно было бы сделать что-ьы бралось название переменной как хранилища

	constructor(){
	}

	string hello(string who){ //синаксис похожий на си
		return who+' world class';
	}
}
