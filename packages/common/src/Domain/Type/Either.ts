import { Only } from './Only'

export type Either<T, U> = Only<T, U> | Only<U, T>
