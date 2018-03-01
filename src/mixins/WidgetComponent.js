import AssetResolver from './AssetResolver';

export default {
    mixins: [
        AssetResolver,
    ],

    props: {
        isTesting: {
            required: false,
            default: false,
        },

        isFake: {
            required: false,
            default: false,
        },
    },

    data() {
        return {
            screenUrl: '',
            error: false,
            dataLoaded: false,
        };
    },

    computed: {
        canDisplayData() {
            return this.dataLoaded && !this.error;
        },
    },

    created() {
        if (typeof this.start !== 'function') {
            console.warn(`${this.$options._componentTag} : when using WidgetComponent mixin, you need to implement start() in ${this.$options._componentTag} component methods`);
        }
    },

    mounted() {
        /* isStatic: false || true should be present on every component instance data
         *  see Contexts.vue for example
         *  isFake: should be set to true on created() components hooks if using fake api data
         */
        if (this.isStatic) {
            return this.dataLoaded = true;
        }

        if (this.isFake) {
            return this.fetchFakeData();
        }

        this._widget_component_getData();

        if (this.refreshEvery) {
            return setInterval(() => {
                this._widget_component_getData();
            }, this.refreshEvery * 1000);
        }

        return true;
    },

    methods: {
        _widget_component_getData() {
            return axios.get(this.screenUrl)
                .then(({ data }) => {
                    if (typeof this.onDataFetched !== 'function') {
                        return console.warn(`${this.$options._componentTag} : when using WidgetComponent mixin, you need to implement onDataFetched(data) in ${this.$options._componentTag} component methods`);
                    }

                    this.dataLoaded = true;
                    this.onDataFetched(data.data);

                    return this.start();
                })
                .catch(() => this.onError(response));
        },

        onError(response) {
            this.error = true;
        },
    },
};
