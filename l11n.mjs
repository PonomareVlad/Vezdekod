const storageKey = 'l11n', prefix = 'data-l11n-', targets = ['innerText', 'title', 'value', 'lang', 'dir'],
    lcTargets = targets.map(target => target.toLowerCase())

class L11n {
    constructor() {
        this.localeProxyHandler = {
            get: (target, prop, receiver) => Reflect.get(target, prop, receiver) || this.locales.defaults[prop]
        }
        return this.init(...arguments).then(() => window.l11n = this)
    }

    async init(localesSource, locale) {
        this.locales = await fetch(localesSource).then(r => r.json()).catch(() => ({}))
        const defaultLocale = this.locales.default || Object.keys(this.locales).shift(),
            targetLocale = locale || defaultLocale;
        if (!this.locales.defaults) this.locales.defaults = this.locales[defaultLocale] || {};
        if (targetLocale) return this.set(targetLocale, true);
    }

    set(locale, skipStorage) {
        if (!locale || !this.locales || !this.locales[locale]) return;
        if (!skipStorage) localStorage.setItem(storageKey, locale);
        this.locale = new Proxy(this.locales[locale], this.localeProxyHandler);
        return this.update();
    }

    get(key, locale) {
        if (locale && (!this.locales || !this.locales[locale])) throw `Locale ${locale} not found !`
        const targetLocale = locale ? new Proxy(this.locales[locale], this.localeProxyHandler) : this.locale;
        return targetLocale[key];
    }

    update() {
        const nodes = document.querySelectorAll(targets.map(t => `[${prefix}${t}]`).join(','));
        nodes.forEach(node => node.getAttributeNames().filter(a => a.startsWith(prefix)).forEach(attribute =>
            node[targets[lcTargets.indexOf(attribute.replace(prefix, ''))]] = this.locale[node.getAttribute(attribute)]))
    }
}

export default new L11n('/l11n.json', localStorage.getItem(storageKey));
