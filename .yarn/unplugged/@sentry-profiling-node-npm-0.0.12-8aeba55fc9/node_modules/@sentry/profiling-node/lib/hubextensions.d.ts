import type { Hub, TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';
declare type StartTransaction = (this: Hub, transactionContext: TransactionContext, customSamplingContext?: CustomSamplingContext) => Transaction;
export declare function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction: StartTransaction): StartTransaction;
/**
 * This patches the global object and injects the Profiling extensions methods
 */
export declare function addExtensionMethods(): void;
export {};
