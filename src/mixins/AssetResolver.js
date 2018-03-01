function trimSlashes(string) {
    return string.replace(/^\/+|\/+$/g, '');
}

export default {
    methods: {
        assetUrl(asset, path = 'styles/images') {
            const trimmedPath = trimSlashes(path);

            if (this.isFake) {
                return `assets/${trimmedPath}/${asset}`;
            }

            return `/dist/frontend/${trimmedPath}/${asset}`;
        },
    },
};
