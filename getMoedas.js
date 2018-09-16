document.addEventListener('DOMContentLoaded', () => {

	// -------------------- Lista as moedas da API do site na <select> de moedas --------------------

	// variável refente à <select id="lista-moedas">
	var listaMoedas = document.getElementById('lista-moedas');
	// objeto de requisição HTTP para pegar todos os símbolos de moedas
	var xhrMoedas = new XMLHttpRequest();
	
	// se ocorreu tudo certo na requisição e houve resposta
	xhrMoedas.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			
			// array referente à propriedade data do objeto fornecido pela API - propriedade que contem as moedas
			var moedas = Object.values(JSON.parse(xhrMoedas.responseText).data);

			// para cada moeda
			moedas.forEach( (m) => {

				// é criado um novo <option>
				var optionMoeda = document.createElement('option');

				// esse option recebe em seu texto o símbolo da moeda
				optionMoeda.innerHTML = m.symbol;
				// em seu valor o id da moeda
				optionMoeda.value = m.id;

				// e é adicionado como filho da <selec>
				listaMoedas.appendChild(optionMoeda);
			});
		}
	}

	// é definida uma requisição com o método GET para a API do Cryptocurrency Market Capitalizations
	xhrMoedas.open('GET', 'https://api.coinmarketcap.com/v2/ticker/', true);
	// e então a requisição é enviada
	xhrMoedas.send();

	//-------------------- Busca o valor do dólar em outra API --------------------

	// variável que, mais tarde, irá guardar o valor do dólar
	var dolarReal = 0;
	// objeto de requisição HTTP para pegar o valor do dólar
	var xhrReal = new XMLHttpRequest();
	
	// se ocorreu tudo certo na requisição e houve resposta
	xhrReal.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {

			// o valor do dólar em reais é armazenado
			dolarReal = JSON.parse(xhrReal.responseText).valores.USD.valor;
			// e adicionado ao campo de valor do dólar (<b id="dolar"></b>)
			document.getElementById('dolar').innerHTML += dolarReal + ' BRL';
		}
	}

	// é definida uma requisição com o método GET para a API do Promasters, que fornece a cotação de algumas moedas estrangeiras
	xhrReal.open('GET', 'https://api.promasters.net.br/cotacao/v1/valores', true);
	// e então a requisição é enviada
	xhrReal.send();

	// -------------------- Pega a moeda atual da <select> e exibe as informações --------------------

	// toda vez que a <option> selecionada da <select> for alterada
	listaMoedas.addEventListener('change', () => {

		// é veirificado se o seu valor é igual a zero
		if (listaMoedas.value == 0) {
			// se for, nada ocorre
			return false;
		}

		// senão, as informações da moeda são exibidas
		ajaxC(listaMoedas.value, dolarReal);
	});

	// variável referente à <div id="corpo"></div>
	var corpo = document.getElementById('corpo');
	
	// variáveis que, mais tarde, irão guardar as informações das moedas
	var simbolo; 	// autoexplicativo
	var preco; 		// em dólar
	var pc1h; 		// percentual de mudança na última hora
	var pc24h;		// percentual de mudança no último dia
	var pc7d;		// percentual de mudança na última semana

	// dei esse nome porque essa função efetua o AJAX das moedas (Coins)
	// bom, ela efetua o AJAX para buscar todas as informações da moeda e exibe na <div> corpo
	// para isso, ela solicita como parâmetro o id da moeda e o valor do dólar
	function ajaxC(moeda, dolarReal) {
	
		// objeto de requisição HTTP para pegar as informações da moeda
		var xhr = new XMLHttpRequest();
		// se ocorreu tudo certo na requisição e houve resposta
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {

				// a <div> corpo é esvaziada
				corpo.innerHTML = '';

				// objeto de informações das moedas de acordo com o valor do dólar
				quotesUSD = JSON.parse(xhr.responseText).data.quotes.USD;

			   	// enfim, todas aquelas variáveis tem seus valores atribuidos
				simbolo = JSON.parse(xhr.responseText).data.symbol;
				preco = (quotesUSD.price).toFixed(6); // aqui reduzimos o número de casas decimais para 6
				pc1h = quotesUSD.percent_change_1h;
				pc24h = quotesUSD.percent_change_24h;
				pc7d = quotesUSD.percent_change_7d;
				
				// são criados parágrafos para a exibição dos valores das variáveis acima
				var exibe = document.createElement('p');
				var s1h = document.createElement('p');
				var s24h = document.createElement('p');
				var s7d = document.createElement('p');

				// aqui é guardado o id HTML das informações
				var id = simbolo.toLowerCase() + '-';
				var hora = id + 'hora';
				var ontem = id + 'ontem';
				var semana = id + 'semana';

				// aqui é exibido o símbolo da moeda, seu preco em dólar e seu preço em reais
				exibe.innerHTML = `<span class="simbolo">${simbolo}</span> ${preco} USD | ${(dolarReal * preco).toFixed(6)} BRL`;
				
				// aqui são exibidas os percentuais de mudança, com seus devidos ids
				s1h.innerHTML += `<b>Na ultima hora:</b> <span id="${hora}">${pc1h}%</span>`;
				s24h.innerHTML += `<b>De ontem para hoje:</b> <span id="${ontem}">${pc24h}%</span>`;
				s7d.innerHTML += `<b>Nessa semana:</b> <span id="${semana}">${pc7d}%</span>`;

				// e aqui elas são exibidas no corpo
				corpo.appendChild(exibe);
				corpo.appendChild(s1h);
				corpo.appendChild(s24h);
				corpo.appendChild(s7d);

				// após sua exibição no corpo, é verificado se os percentuais são positivos ou negativos
				// em caso negativo, o texto referente ao percentual fica vermelho e com um setinha pra baixo
				// e em caso positivo, o texto referente ao percentual fica verde e com uma setinha para cima
				if (pc1h < 0) {
					document.getElementById(hora).style.color = 'red';
					document.getElementById(hora).innerHTML += ' ▼';
				} else if (pc1h > 0) {
					document.getElementById(hora).style.color = 'green';
					document.getElementById(hora).innerHTML += ' ▲';
				}

				if (pc24h < 0) {
					document.getElementById(ontem).style.color = 'red';
					document.getElementById(ontem).innerHTML += ' ▼';
				} else if (pc24h > 0) {
					document.getElementById(ontem).style.color = 'green';
					document.getElementById(ontem).innerHTML += ' ▲';
				}

				if (pc7d < 0) {
					document.getElementById(semana).style.color = 'red';
					document.getElementById(semana).innerHTML += ' ▼';
				} else if (pc7d > 0) {
					document.getElementById(semana).style.color = 'green';
					document.getElementById(semana).innerHTML += ' ▲';
				}
			}
		}

		// é definida uma requisição com o método GET para a API do Cryptocurrency Market Capitalizations, mas agora especificando a moeda
		xhr.open('GET', `https://api.coinmarketcap.com/v2/ticker/${moeda}/`, true);
		// e então a requisição é enviada
		xhr.send();
	}
});