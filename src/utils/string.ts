import { isNil } from 'ramda';

export const isEmpty = (s?: string | null): boolean => isNil(s) || s.length === 0;
