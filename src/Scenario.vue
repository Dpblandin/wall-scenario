<template>
    <component
            ref="screen"
            v-show="enabled"
            :is="currentScreen.component"
            :screen="currentScreen"
            :with-widgets="withWidgets"
            :key="currentIndex"
            is-testing="scenario"
    >
    </component>
</template>

<script>
    import eventHub from './lib/eventHub';

    export default {
        props: {
            scenario: {
                required: true,
            },
            autoPlay: {
                type: Boolean,
                default: false,
            },

            reloadAfter: {
                type: Number,
                default: 600000,
            },

            withWidgets: {
                type: Boolean,
                default: false,
            },
        },

        components: {
        },

        data() {
            return {
                enabled: false,
                started: false,
                currentIndex: 0,
                timer: null,
            };
        },

        computed: {
            shouldStartTimer() {
                if (this.autoPlay) {
                    return !this.started;
                }

                return true;
            },

            currentScreen() {
                return this.scenario.screens[this.currentIndex];
            },

            currentScreenComponent() {
                return this.currentScreen.component;
            },

            intervalTime() {
                if (window.App.isFast === true) {
                    return 5000;
                }

                return this.currentScreen.duration * 1000;
            },
        },

        created() {
            eventHub.$on('component-loaded', this.onComponentLoaded);
        },
        mounted() {
            if (this.reloadAfter > 0) {
                setTimeout(()=> window.location.reload(), this.reloadAfter)
            }
        },

        watch: {
            intervalTime() {
                clearInterval(this.timer);
                this.startTimer();
            },
        },

        methods: {
            onComponentLoaded() {
                if (this.autoPlay) {
                    this.play();
                }
            },

            play() {
                this.enabled = true;
                // start() must be implemented on each Screen component.
                if (typeof this.$refs.screen.start === 'function') {
                    this.$refs.screen.start();
                }

                // Send screen changed event to remote
                this.$emit('screen-changed', this.currentScreen.label);

                // Set scenario interval
                if (this.shouldStartTimer) {
                    this.startTimer();
                }

                this.started = true;
            },

            startTimer() {
                this.timer = setInterval(() => {
                    this.moveToNextScreen();
                    this.$emit('screen-changed', this.currentScreen.label);
                }, this.intervalTime);
            },

            moveToNextScreen() {
                if (this.currentIndex + 1 >= this.scenario.screens.length) {
                    return this.currentIndex = 0;
                }

                return this.currentIndex += 1;
            },
        },
    };
</script>
