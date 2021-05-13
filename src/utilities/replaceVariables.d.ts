import { Maybe } from '../jsutils/Maybe';

import { VariableValues } from '../execution/values';

import { ValueNode, ConstValueNode } from '../language/ast';

/**
 * Replaces any Variables found within an AST Value literal with literals
 * supplied from a map of variable values, or removed if no variable replacement
 * exists, returning a constant value.
 *
 * Used primarily to ensure only complete constant values are used during input
 * coercion of custom scalars which accept complex literals.
 */
export function replaceVariables(
  valueNode: ValueNode,
  variables?: Maybe<VariableValues>,
): ConstValueNode;
