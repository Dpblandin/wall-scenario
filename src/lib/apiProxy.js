const apiProxy = (screen, isFake) => {
    return new Proxy(screen, {
        get: (target, key, context) => {
            if (key === 'screenUrl') {
                return isFake ? target.fetchFakeData() : axios.get(target[key]);
            }

            return target[key];
        }
    })
}

export {
    apiProxy,
}
