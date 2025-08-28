/// <reference types="firebase" />  // keeps TS happy without importing runtime code

/*  Stub exports so that any server/SSR import of "lib/firebase"
    does NOT touch the Firebase JS SDK and therefore never
    reaches Google's servers or checks any API key.            */

export const auth = undefined
export const db = undefined
export const storage = undefined
export const googleProvider = undefined
export const analytics = undefined
