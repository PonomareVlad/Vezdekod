const message = 'Обнаружены повторяющиеся символы',
    fieldsToValidate = ':is(input,textarea)[required]:not([type=email])',
    pattern = /(?:([A-Za-z\u0400-\u041d\u041f-\u043d\u043f-\u04FF])(?:\1\1))|(?:([^0-9A-Za-z\u0400-\u04FF])(\2))+/gi,
    form = document.getElementById('form');

form.addEventListener('submit', e => e.preventDefault() || (validateForm(e) && saveForm(e)))
form.querySelectorAll(fieldsToValidate).forEach(f => f.addEventListener('change', e => validateField(e.target)))
document.querySelector('form button[type="submit"]').addEventListener('click', setVisibleInvalids)

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
    return field.value ? !pattern.test(field.value) || field.setCustomValidity(message) : false;
}

function validateForm(event) {
    return ![...event.target.querySelectorAll(fieldsToValidate)].map(validateField).includes(false);
}

function saveForm(event) {
    const body = [...new FormData(event.target).entries()].map(field => field.join(': ')).join(`\r\n`)
    return downloadBlob(new Blob([body]));
}

function setVisibleInvalids(event) {
    return event.target.form.classList.toggle('visible-invalids', true)
}
