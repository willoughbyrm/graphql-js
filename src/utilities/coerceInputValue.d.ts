import { Maybe } from '../jsutils/Maybe';
import { ObjMap } from '../jsutils/ObjMap';

import { ValueNode } from '../language/ast';

import { GraphQLInputType } from '../type/definition';

import { GraphQLError } from '../error/GraphQLError';

type OnErrorCB = (
  path: ReadonlyArray<string | number>,
  invalidValue: unknown,
  error: GraphQLError,
) => void;

/**
 * Coerces a JavaScript value given a GraphQL Input Type.
 */
export function coerceInputValue(
  inputValue: unknown,
  type: GraphQLInputType,
  onError?: OnErrorCB,
): unknown;

/**
 * Produces a coerced "internal" JavaScript value given a GraphQL Value AST.
 *
 * Returns `undefined` when the value could not be validly coerced according to
 * the provided type.
 */
export function coerceInputLiteral(
  valueNode: ValueNode,
  type: GraphQLInputType,
  variables?: Maybe<ObjMap<unknown>>,
): unknown;
