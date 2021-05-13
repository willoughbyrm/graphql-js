import { Maybe } from '../jsutils/Maybe';

import { GraphQLError } from '../error/GraphQLError';

import { ValueNode } from '../language/ast';

import { GraphQLInputType } from '../type/definition';

import { VariableValues } from '../execution/values';

/**
 * Validate that the provided input value is allowed for this type, collecting
 * all errors via a callback function.
 */
export function validateInputValue(
  inputValue: unknown,
  type: GraphQLInputType,
  onError: (error: GraphQLError, path: ReadonlyArray<string | number>) => void,
): void;

/**
 * Validate that the provided input literal is allowed for this type, collecting
 * all errors via a callback function.
 *
 * If variable values are not provided, the literal is validated statically
 * (not assuming that those variables are missing runtime values).
 */
export function validateInputLiteral(
  valueNode: ValueNode,
  type: GraphQLInputType,
  variables: Maybe<VariableValues>,
  onError: (error: GraphQLError, path: ReadonlyArray<string | number>) => void,
): void;
