
import { conf } from '../config';

const host: string = conf.get('host');

/**
 * Creates a link to the current server
 * @param endpoint
 */
export const createLink = (endpoint: string) => {
  return `${host}${endpoint}`;
};