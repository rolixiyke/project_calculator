const expressionEl = document.getElementById('expression');
const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

const state = {
	current: '0',
	previous: '',
	operator: null,
	readyForNewInput: false,
	shouldResetExpression: false,
};

function formatValue(value) {
	if (value === '') return '0';
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return 'Error';
	return new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 10,
	}).format(numeric);
}

function updateDisplay() {
	displayEl.textContent = formatValue(state.current);
	if (state.operator && state.previous !== '') {
		const operatorLabel = state.operator === '*' ? '×' : state.operator === '/' ? '÷' : state.operator;
		expressionEl.textContent = `${formatValue(state.previous)} ${operatorLabel}`;
	} else if (state.shouldResetExpression) {
		expressionEl.textContent = 'Result';
	} else {
		expressionEl.textContent = '0';
	}
}

function clearAll() {
	state.current = '0';
	state.previous = '';
	state.operator = null;
	state.readyForNewInput = false;
	state.shouldResetExpression = false;
	updateDisplay();
}

function deleteLast() {
	if (state.readyForNewInput || state.current === 'Error') {
		state.current = '0';
		state.readyForNewInput = false;
		updateDisplay();
		return;
	}

	state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
	updateDisplay();
}

function inputNumber(number) {
	if (state.current === 'Error') {
		clearAll();
	}

	if (state.readyForNewInput || state.shouldResetExpression) {
		state.current = number;
		state.readyForNewInput = false;
		state.shouldResetExpression = false;
	} else {
		state.current = state.current === '0' ? number : state.current + number;
	}

	updateDisplay();
}

function inputDecimal() {
	if (state.current === 'Error') {
		clearAll();
	}

	if (state.readyForNewInput || state.shouldResetExpression) {
		state.current = '0.';
		state.readyForNewInput = false;
		state.shouldResetExpression = false;
		updateDisplay();
		return;
	}

	if (!state.current.includes('.')) {
		state.current += '.';
		updateDisplay();
	}
}

function calculate(first, second, operator) {
	const a = Number(first);
	const b = Number(second);

	switch (operator) {
		case '+': return a + b;
		case '-': return a - b;
		case '*': return a * b;
		case '/': return b === 0 ? 'Error' : a / b;
		case '%': return b === 0 ? 'Error' : a % b;
		default: return second;
	}
}

function inputOperator(nextOperator) {
	if (state.current === 'Error') {
		return;
	}

	if (state.previous !== '' && state.operator && !state.readyForNewInput) {
		const result = calculate(state.previous, state.current, state.operator);
		if (result === 'Error') {
			state.current = 'Error';
			state.previous = '';
			state.operator = null;
			state.readyForNewInput = true;
			state.shouldResetExpression = true;
			updateDisplay();
			return;
		}
		state.current = String(result);
		state.previous = String(result);
	} else {
		state.previous = state.current;
	}

	state.operator = nextOperator;
	state.readyForNewInput = true;
	state.shouldResetExpression = false;
	updateDisplay();
}

function equalize() {
	if (!state.operator || state.previous === '' || state.current === 'Error') {
		return;
	}

	const result = calculate(state.previous, state.current, state.operator);
	if (result === 'Error') {
		state.current = 'Error';
	} else {
		state.current = String(result);
	}

	state.previous = '';
	state.operator = null;
	state.readyForNewInput = true;
	state.shouldResetExpression = true;
	updateDisplay();
}

keys.addEventListener('click', (event) => {
	const button = event.target.closest('button');
	if (!button) return;

	const { action, value } = button.dataset;

	switch (action) {
		case 'number':
			inputNumber(value);
			break;
		case 'decimal':
			inputDecimal();
			break;
		case 'operator':
			inputOperator(value);
			break;
		case 'equals':
			equalize();
			break;
		case 'clear':
			clearAll();
			break;
		case 'delete':
			deleteLast();
			break;
	}
});

document.addEventListener('keydown', (event) => {
	if (/^[0-9]$/.test(event.key)) {
		inputNumber(event.key);
		return;
	}

	if (event.key === '.') {
		inputDecimal();
		return;
	}

	if (['+', '-', '*', '/', '%'].includes(event.key)) {
		inputOperator(event.key);
		return;
	}

	if (event.key === 'Enter' || event.key === '=') {
		event.preventDefault();
		equalize();
		return;
	}

	if (event.key === 'Backspace') {
		deleteLast();
		return;
	}

	if (event.key === 'Escape') {
		clearAll();
	}
});

updateDisplay();