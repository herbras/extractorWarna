import { writable } from 'svelte/store';

export function createPersistedState(key, startValue) {
    const storedValue = localStorage.getItem(key);
    const value = storedValue ? JSON.parse(storedValue) : startValue;
    const store = writable(value);

    // Subscribe ke perubahan dan update localStorage
    store.subscribe($value => {
        localStorage.setItem(key, JSON.stringify($value));
    });

    return store;
}

export const historyStore = createPersistedState('histories', []);
