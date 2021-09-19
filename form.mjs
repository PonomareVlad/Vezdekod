import l11n from "./l11n.mjs";

const message = 'Repeating characters found',
    fieldsToValidate = ':is(input,textarea)[required]:not([type=email])',
    pattern = /(?:([A-Za-z\u0400-\u041d\u041f-\u043d\u043f-\u04FF])(?:\1\1))|(?:([^0-9A-Za-z\u0400-\u04FF])(\2))+/gi,
    form = document.getElementById('form');

form.addEventListener('submit', e => e.preventDefault() || (validateForm(e.target) && saveForm(e.target)))
form.querySelectorAll(fieldsToValidate).forEach(f => f.addEventListener('change', ({target: field}) => validateField(field)))
document.querySelector('form button[type="submit"]').addEventListener('click', ({target: {form}}) => setVisibleInvalids(form) && validateForm(form))
document.getElementById('language').addEventListener('change', async ({target: {value}}) => (await l11n).set(value));

function downloadBlob(blob, name = 'form.txt') {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = name;

    document.body.appendChild(link);

    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );

    document.body.removeChild(link);
}

function validateField(field) {
    field.setCustomValidity('');
    const validityMessage = window.l11n ? window.l11n.get('repeating-characters-found') : message;
    return field.value ? !pattern.test(field.value) || field.setCustomValidity(validityMessage) : false;
}

function validateForm(form) {
    return ![...form.querySelectorAll(fieldsToValidate)].map(validateField).includes(false);
}

function saveForm(form) {
    const body = [...new FormData(form).entries()].map(field => field.join(': ')).join(`\r\n`)
    return downloadBlob(new Blob([body]));
}

function setVisibleInvalids(form) {
    return form.classList.toggle('visible-invalids', true)
}
