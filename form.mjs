import l11n from "./l11n.mjs";

const messages = {
        "repeating-characters-found": "Repeating characters found",
        "form-data-sent-successfully": "Form data sent successfully",
        "received-errors-while-form-processing": "Received errors while form processing"
    },
    fieldsToValidate = ':is(input,textarea)[required]:not([type=email])',
    pattern = /(?:([A-Za-z\u0400-\u041d\u041f-\u043d\u043f-\u04FF])(?:\1\1))|(?:([^0-9A-Za-z\u0400-\u04FF])(\2))+/gi,
    form = document.getElementById('form'), output = document.querySelector('output');

form.addEventListener('submit', e => e.preventDefault() || (validateForm(e.target) && sendForm(e.target)))
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
    const messageKey = 'repeating-characters-found',
        validityMessage = window.l11n ? window.l11n.get(messageKey) : messages[messageKey];
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

function sendForm() {
    const result = !Math.round(Math.random()),
        messageKey = result ? 'form-data-sent-successfully' : 'received-errors-while-form-processing',
        parameters = {innerText: window.l11n ? window.l11n.get(messageKey) : messages[messageKey]}
    if (!result) parameters.className = 'error';
    const notification = Object.assign(document.createElement('form-notification'), parameters);
    notification.dataset.l11nInnertext = messageKey;
    output.appendChild(notification)
}

customElements.define('form-notification', class FormNotification extends HTMLElement {
    connectedCallback() {
        return setTimeout(() => this.parentNode.removeChild(this), 5000)
    }
})
