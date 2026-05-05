/**
 * Shared interaction state + a tiny pub/sub bus.
 *
 * Every view subscribes to the parts of the state it cares about. View
 * code calls `state.set({ ... })` to mutate; subscribers fire on change.
 * This is the backbone for Task 5 (linking) and Task 6 (coordinated views).
 */

(function () {
    const listeners = new Set();

    const _state = {
        selectedCountry: null,    // hover/click on map or scatterplot
        clickedCountries: [],    // click on map
        brushedCountries: [],     // d3.brush selection on the scatterplot
        selectedYear: 2020,       // year slider
        selectedIndicator: null,  // indicator dropdown
    };

    function get() {
        return { ..._state };
    }

    function set(patch) {
        Object.assign(_state, patch);
        for (const fn of listeners) fn(get(), patch);
    }

    function subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }

    window.appState = { get, set, subscribe };
})();
