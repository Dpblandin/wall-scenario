import eventHub from '../lib/eventHub';
import AssetResolver from './AssetResolver';

export default {
    mixins: [
        AssetResolver,
    ],

    props: {
        screen: {
            type: Object,
            required: false,
            default: () => ({ url: '' }),
        },

        isTesting: {
            required: false,
            default: false,
        },

        isFake: {
            required: false,
            default: false,
        },

        withWidgets: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            screenUrl: this.screen.url,
            duration: this.screen.duration * 1000 || 30 * 1000,
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
            console.warn(`${this.$options._componentTag} : when using ScreenComponent mixin, you need to implement start() in ${this.$options._componentTag} component methods`);
        }

        eventHub.$on('component-play', this.onComponentPlay);
    },

    mounted() {
        if (this.isStatic) {
            this.dataLoaded = true;
            return eventHub.$emit('component-loaded');
        }

        return this.fetchData();
    },


    destroyed() {
        eventHub.$off('component-play', this.onComponentPlay);
    },

    methods: {
        fetchData() {
            if (this.isFake) {
                return this.fetchFakeData();
            }

            return axios.get(this.screenUrl)
                .then(({ data }) => {
                    if (typeof this.onDataFetched !== 'function') {
                        return console.warn(`${this.$options._componentTag} : when using ScreenComponent mixin, you need to implement onDataFetched(data) in ${this.$options._componentTag} component methods`);
                    }

                    this.dataLoaded = true;
                    this.onDataFetched(data.data);

                    eventHub.$emit('component-loaded');
                    if (this.isTesting === 'component') {
                        return this.start();
                    }

                    return true;
                })
                .catch((response) => this.onError(response));
        },
        onError(response) {
            this.error = true;
        },

        onComponentPlay() {
            this.start();
        },
    },
};
