import { Maybe } from '../jsutils/Maybe';

import { ValueNode } from '../language/ast';

import { GraphQLInputType, GraphQLDefaultValueUsage } from '../type/definition';

import { GraphQLError } from '../error/GraphQLError';

import { VariableValues } from '../execution/values';

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
  variableValues?: Maybe<VariableValues>,
): unknown;

/**
 * @internal
 */
export function coerceDefaultValue(
  defaultValue: GraphQLDefaultValueUsage,
  type: GraphQLInputType,
): unknown;
