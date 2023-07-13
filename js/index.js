// ----------------------- CONSTANTS START -----------------------
const API_URL = 'http://www.mocky.io/v2/5dfcef48310000ee0ed2c281';
const REGEX_EMAIL = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
const MIN_AGE = 18;
const MAX_AGE = 100;

const ERROR_MESSAGES_MAP = {
    profession: 'Please enter a profession',
    age: 'Please enter a valid age',
    location: 'Please enter a valid location',
    email: 'Please enter a valid email address',
    password: 'Please enter a valid password',
    passwordEmpty: 'Please enter a password',
    passwordShort: 'Please enter a longer password'
};

const SELECT_PROFESSION_OPTIONS = [
    'Engineer',
    'Business Development Executive',
    'Office Manager/PA',
    'Accountant',
    'VR Designer'
];

const SELECTS_OPTIONS = {
    profession: SELECT_PROFESSION_OPTIONS,
    age: generateAgeOptions(MIN_AGE, MAX_AGE)
};
// ----------------------- CONSTANTS END -----------------------

// ----------------------- HTML GLOBAL ELEMENTS START -----------------------
const carousel = document.getElementById('carousel');
const buttonNext = document.getElementById('button-next');
const buttonRegistration = document.getElementById('button-registration');
const history = document.getElementById('history');
const formLogin = document.forms.login;
const formRegistration = document.forms.registration;
const lastStep = carousel.lastElementChild;
// ----------------------- HTML GLOBAL ELEMENTS END -----------------------

// ----------------------- UTILS START -----------------------
function generateAgeOptions(begin = 18, end = 30) {
    return Array.from({length: end - begin + 1}, (_, index) => index + begin);
}

function addErrorMessage(field, message) {
    if (field.nextElementSibling?.classList.contains('errorMessage')) return;

    const errorMessageElem = document.createElement('span');

    errorMessageElem.className = 'errorMessage';
    errorMessageElem.prepend(message);
    field.after(errorMessageElem);
}

function toggleButtonNext () {
    buttonNext.classList.toggle('hidden');
    buttonRegistration.classList.toggle('hidden');
}

function changeActiveStep(newStep) {
    const oldStep = carousel.querySelector('.step.active');

    oldStep.classList.remove('active');
    newStep?.classList.add('active');

    updateHistory();
}

function updateHistory() {
    const historyItems = history.querySelectorAll('.historyItem');
    const steps = carousel.querySelectorAll('.step');
    const stepsArray = Array.prototype.slice.call(steps);
    const activeStep = carousel.querySelector('.step.active');
    const activeStepIndex = stepsArray.indexOf(activeStep);

    for (let i = 0; i < stepsArray.length; i++) {
        const historyItem = historyItems[i];
        if (i === activeStepIndex) {
            historyItem.classList.add('selected');
        } else if (historyItem.classList.contains('selected')) {
            historyItem.classList.remove('selected');
        }
    }
}

function createSubmitData() {
    let formData = new FormData();
    let fields = formRegistration.querySelectorAll('input');

    for(let field of fields) {
        formData.append(field.name, field.value);
    }

    return formData;
}

function disableButton(button) {
    button.disabled = true;
}

function enableButton(button) {
    button.disabled = false;
}

function onSelectOption(event) {
    const select = event.target.closest('.select')
    const input = select.querySelector('input');
    const prevSelectedOption = select.querySelector('.selectOption.selected');
    const newSelectedOption = event.target;

    input.value = newSelectedOption.innerText;

    prevSelectedOption.classList.remove('selected');
    newSelectedOption.classList.add('selected');
}

function addOptionsToSelect(select) {
    const selectOptionsContainer = select.querySelector('.selectOptionsContainer');
    const input = select.querySelector('input');
    const options = [];

    for (let value of SELECTS_OPTIONS[input.name]) {
        const option = document.createElement('div');

        option.classList.add('selectOption');
        option.innerHTML = value;
        option.onclick = onSelectOption;

        if (!options.length) {
            input.value = value;
            option.classList.add('selected');
        }

        options.push(option);
    }

    selectOptionsContainer.append(...options);
}

function addOptionsToSelects() {
    const selects = document.querySelectorAll('.select');

    for (let select of selects) {
        addOptionsToSelect(select);
    }
}
// ----------------------- UTILS END -----------------------

// ----------------------- VALIDATORS START -----------------------
function validateEmail(field) {
    const { value: email } = field;

    if (!email || !REGEX_EMAIL.test(email)) {
        addErrorMessage(field, ERROR_MESSAGES_MAP.email);
        return false;
    }

    return true;
}

function validatePassword(field) {
    const { value: password } = field;

    if (!password) {
        addErrorMessage(field, ERROR_MESSAGES_MAP.passwordEmpty);
        return false;
    }

    if (password.length < 6) {
        addErrorMessage(field, ERROR_MESSAGES_MAP.passwordShort);
        return false;
    }

    return true;
}

function validateField(field) {
    const { name, value } = field;

    if (!value) {
        addErrorMessage(field, ERROR_MESSAGES_MAP[name]);
        return false;
    }

    if (name === 'password') return validatePassword(field);

    if (name === 'email') return validateEmail(field);

    return true;
}
// ----------------------- VALIDATORS END -----------------------

// ----------------------- HANDLERS START -----------------------
function handleLogin() {
    const { email, password } = formLogin.elements;
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);

    if (!isValidEmail || !isValidPassword) return;

    // Request for API
    console.log('Request for API from handleLogin()');
}

function handleFocus(event) {
    const { nextElementSibling } = event.target;

    if (nextElementSibling?.classList.contains('errorMessage')) {
        nextElementSibling.remove();
    }
}

function goBack() {
    const activeStep = carousel.querySelector('.step.active');
    const firstStep = carousel.querySelector('.mainForm_step');
    const buttonBack = document.querySelector('.buttonBack');
    const prevStep = activeStep.previousElementSibling;

    changeActiveStep(prevStep);

    if (prevStep === firstStep) {
        buttonBack.disabled = true;
    }

    if (buttonNext.classList.contains('hidden')) {
        toggleButtonNext();
    }
}

function goNext() {
    const activeStep = carousel.querySelector('.step.active');
    const buttonBack = document.querySelector('.buttonBack');
    const nextStep = activeStep.nextElementSibling;
    const field = activeStep.querySelector('input');
    const isValidField = validateField(field);

    if (!isValidField) return;


    changeActiveStep(nextStep);

    if (buttonBack.disabled) {
        buttonBack.disabled = false;
    }

    if (nextStep === lastStep) {
        toggleButtonNext();
    }
}

function handleResponseError(errors) {
    const firstStepWithError = document.querySelector(".step input[name=" + errors[0].name + "]").closest('.step');

    changeActiveStep(firstStepWithError);

    if (buttonNext.classList.contains('hidden')) {
        toggleButtonNext();
    }

    for (let error of errors) {
        const field = formRegistration.elements[error.name];
        addErrorMessage(field, error.message);
    }
}

function onToggleOptions(event) {
    const select = event.target.closest('.select');
    select.classList.toggle('open');

    handleFocus(event);
}

async function handleSubmit() {
    const activeStep = carousel.querySelector('.step.active');
    const field = activeStep.querySelector('input');
    const isValidField = validateField(field);

    if (!isValidField) return;

    disableButton(buttonRegistration);

    const formData = createSubmitData();
    const response = await fetch(API_URL, { method: 'POST', body: formData });
    const result = await response.json();

    setTimeout(() => enableButton(buttonRegistration), 500);

    if (result.errors) {
        handleResponseError(result.errors)
    }
}
// ----------------------- HANDLERS END -----------------------

addOptionsToSelects();
