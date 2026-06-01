// NSBM Creators Hub - Query Parameter & Router State Coordinator
// Saved at /d:/Project/Web/code/js/router.js

(function () {
    const NSBM_Router = {
        /**
         * Gets a URL search query parameter value.
         * @param {string} name Parameter name
         * @returns {string|null} Parameter value
         */
        getParam(name) {
            return new URLSearchParams(window.location.search).get(name);
        },

        /**
         * Sets a URL search query parameter value dynamically without reloading.
         * @param {string} name Parameter name
         * @param {string} value Parameter value
         */
        setParam(name, value) {
            const url = new URL(window.location.href);
            url.searchParams.set(name, value);
            window.history.pushState({ path: url.href }, '', url.href);
        },

        /**
         * Removes a search parameter from the URL dynamically without reloading.
         * @param {string} name Parameter name
         */
        removeParam(name) {
            const url = new URL(window.location.href);
            url.searchParams.delete(name);
            window.history.pushState({ path: url.href }, '', url.href);
        },

        /**
         * Gets all URL search query parameters as a simple key-value object.
         * @returns {Object} Search parameters object
         */
        getParams() {
            const params = {};
            const searchParams = new URLSearchParams(window.location.search);
            for (const [key, value] of searchParams.entries()) {
                params[key] = value;
            }
            return params;
        }
    };

    // Expose globally
    window.NSBM_Router = NSBM_Router;
})();
