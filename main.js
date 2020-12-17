let allDevs;
let filteredDevs;
let searchState = {
	name: 'teste',
	progLang: [],
	isAnd: true,
};

async function start() {
	const form = document.querySelector('form');
	function runSearch() {
		updateSearchState();
		filteredDevs = filterDevs(
			allDevs,
			searchState.name,
			searchState.progLang,
			searchState.isAnd
		);
			render(filteredDevs);			
	}
	preventFormSubmit();
	await fetchDevs();

	form.addEventListener('click', runSearch);
}
start();

//----------

function preventFormSubmit() {
	function handleFormSubmit(event) {
		event.preventDefault();
		// console.log('previniu')
	}

	var form = document.querySelector('form');
	form.addEventListener('submit', handleFormSubmit);
}

async function fetchDevs() {
	const res = await fetch('http://localhost:3001/devs');
	const json = await res.json();

	allDevs = json;

	return;
}

function updateSearchState() {
	let name = document.getElementById('name').value;
	searchState.progLang = [];

	searchState.name = treatName(name);

	if (document.getElementById('java').checked) {
		searchState.progLang.push('Java');
	}
	if (document.getElementById('javascript').checked) {
		searchState.progLang.push('JavaScript');
	}
	if (document.getElementById('python').checked) {
		searchState.progLang.push('Python');
	}

	searchState.isAnd = document.getElementById('radioAnd').checked;

	return searchState;
}

function treatName(str) {
	let result = str.normalize('NFD').replace(/[^a-zA-Zs]/g, '');
	return result.toLowerCase();
}

function filterDevs(devList, devName, plList, searchType) {
	let mo = [];

	//lang check
	devList.forEach((dev) => {
		let count = 0;
		dev.programmingLanguages.forEach((knownLang) => {
			plList.forEach((pl) => {
				if (knownLang.language === pl) count++;
			});
			switch (searchType) {
				case true: //Caso AND
					if (count === plList.length && !mo.includes(dev)) mo.push(dev);
					break;
				case false: //Caso OR
					if (count > 0 && !mo.includes(dev)) mo.push(dev);
					break;
			}
		});
	});

	//name check
	mo.forEach((dev) => {
		treatedName = treatName(dev.name);
		if (!treatedName.includes(devName)) mo.splice(mo.indexOf(dev));
	});

	return mo;
}

function render(showList) {
	function renderDevCard(dev) {
		const devCardHTML = `
			<div class="picture"><img src="${dev.pictureURL}"></div>
			<div class="name">${dev.name}</div>
			<div class="languages">
				${dev.languages.map(language => {
					const devLanguageImg = `<img src="./${language}.png"/>`;
					return devLanguageImg;
				}).join('')}
			</div>
			`;
		return devCardHTML;
	}

	const divResults = document.getElementById('results');
	divResults.innerHTML = '';

	if(searchState.progLang.length > 0) {
		const ul = document.createElement('ul');
		const span = document.createElement('span');
	
		span.textContent = showList.length +  ' Devs Encontrados';
		divResults.innerHTML = '';
	
		let devsInfo = showList.map((dev) => {
			let pictureURL = dev.picture;
			let name = dev.name;
			let languages = dev.programmingLanguages.map((language) => {
				return language.id;
			});
			return { name, pictureURL, languages };
		});
		
		devsInfo.forEach((dev) => {
			const li = document.createElement('li');
			li.innerHTML = renderDevCard(dev);
			li.classList.add('card');
			ul.appendChild(li);
		});
		
		divResults.appendChild(span)
		divResults.appendChild(ul);
	}

}