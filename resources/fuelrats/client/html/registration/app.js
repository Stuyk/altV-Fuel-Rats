Vue.config.devtools = true;
Vue.prototype.window = window;

const app = new Vue({
    el: '#app',
    data() {
        return {
            error: null,
            registering: false,
            username: '',
            password: ''
        };
    },
    computed: {},
    methods: {
        setError(errorMessage) {
            this.error = errorMessage;
            this.registering = false;
        },
        keyup(keyInfo) {
            if (keyInfo.key === 'Enter') {
                this.processRegistration(false);
            }
        },
        processRegistration(register = false) {
            this.error = null;
            this.registering = true;

            if (this.username === '') {
                this.setError('Must specify a username.');
                return;
            }

            if (this.password === '') {
                this.setError('Must specify a password.');
                return;
            }

            if (this.username.length <= 3) {
                this.setError('Username must be atleast 4 characters.');
                return;
            }

            if (this.password.length <= 3) {
                this.setError('Password must be atleast 4 characters.');
                return;
            }

            if ('alt' in window) {
                alt.emit('registration:Route', this.username, this.password, register);
            } else {
                console.log(`${this.username} / ${this.password} / isRegistering: ${register}`);
            }
        }
    },
    mounted() {
        if ('alt' in window) {
            alt.on('registration:Error', this.setError);
        }

        setTimeout(() => {
            this.$refs.username.focus();
        }, 200);

        window.addEventListener('keyup', this.keyup);
    },
    updated() {},
    watch: {}
});
