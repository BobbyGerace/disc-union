import { factory } from './factory';

const fns = factory("type");

export * from './types';
export { factory };

/**
 * Accepts an object of constructor functions,
 * and wraps those functions to add a type property
 * to their result
 * 
 * @function
 * @param constructors - Object containing constructors
 * @param typeKey - Discriminant property
 */
export const discUnion = fns.discUnion;

/**
 * Returns the result of mapper if value is of the specified type,
 * otherwise returns the value unchanged
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to map over
 * @param mapper - Function to be called on obj
 * @param typeKey - Discriminant property
 */
export const map = fns.map;

/**
 * Takes an object to match, and an object of handlers whose
 * keys are the possible types of the discriminated union.
 * 
 * Exhaustive unless an "otherwise" handler is passed in as a third argument,
 * in which case the handler object may be partial.
 * 
 * @function
 * @param obj - Object to match
 * @param handlers - Object whose keys are possible types of the discriminated union, and whose values are handlers for those types
 * @param otherwise (optional) - Handler if no match is found
 * @param typeKey (optional) - Discriminant property
 * @returns Result of the matched handler, or the result of the "otherwise" handler
 */
export const match = fns.match;

/**
 * Narrows the type of the value if it matches the specified type,
 * otherwise returns null
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to get
 * @param typeKey - Discriminant property
 */
export const get = fns.get;

/**
 * Determines if the value matches the specified type
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to check
 * @param typeKey - Discriminant property
 */
export const is = fns.is;

/**
 * Narrows the type of the value if it matches, throws
 * an error otherwise
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to check
 * @param typeKey - Discriminant property
 */
export const validate = fns.validate;

/**
 * Convenience function for adding a type discriminant 
 * to an object
 * 
 * @function
 * @param type - Type to create
 * @param obj - Value to use
 * @param typeKey - Discriminant property
 */
export const createType = fns.createType;

/**
 * Attaches "static" properties and methods to constructor function
 * 
 * @function
 * @param fn - Constructor
 * @param type - Type string
 * @param typeKey - Discriminant property
 */
export const attachExtras = fns.attachExtras;
