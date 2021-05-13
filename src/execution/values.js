import type { ReadOnlyObjMap, ReadOnlyObjMapLike } from '../jsutils/ObjMap';
import { hasOwnProperty } from '../jsutils/hasOwnProperty';
import { invariant } from '../jsutils/invariant';
import { keyMap } from '../jsutils/keyMap';
import { printPathArray } from '../jsutils/printPathArray';

import { GraphQLError } from '../error/GraphQLError';

import type {
  FieldNode,
  DirectiveNode,
  VariableDefinitionNode,
} from '../language/ast';
import { Kind } from '../language/kinds';
import { print } from '../language/printer';

import type { GraphQLSchema } from '../type/schema';
import type { GraphQLInputType, GraphQLField } from '../type/definition';
import type { GraphQLDirective } from '../type/directives';
import {
  isInputType,
  isNonNullType,
  isRequiredInput,
} from '../type/definition';

import { typeFromAST } from '../utilities/typeFromAST';
import {
  coerceInputValue,
  coerceInputLiteral,
  coerceDefaultValue,
} from '../utilities/coerceInputValue';
import {
  validateInputValue,
  validateInputLiteral,
} from '../utilities/validateInputValue';

export type VariableValues = {|
  +sources: ReadOnlyObjMap<{|
    +variable: VariableDefinitionNode,
    +type: GraphQLInputType,
    +value: mixed,
  |}>,
  +coerced: ReadOnlyObjMap<mixed>,
|};

type VariableValuesOrErrors =
  | {| variableValues: VariableValues |}
  | {| errors: $ReadOnlyArray<GraphQLError> |};

/**
 * Prepares an object map of variableValues of the correct type based on the
 * provided variable definitions and arbitrary input. If the input cannot be
 * parsed to match the variable definitions, a GraphQLError will be thrown.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 *
 * @internal
 */
export function getVariableValues(
  schema: GraphQLSchema,
  varDefNodes: $ReadOnlyArray<VariableDefinitionNode>,
  inputs: ReadOnlyObjMapLike<mixed>,
  options?: {| maxErrors?: number |},
): VariableValuesOrErrors {
  const errors = [];
  const maxErrors = options?.maxErrors;
  try {
    const variableValues = coerceVariableValues(
      schema,
      varDefNodes,
      inputs,
      (error) => {
        if (maxErrors != null && errors.length >= maxErrors) {
          throw new GraphQLError(
            'Too many errors processing variables, error limit reached. Execution aborted.',
          );
        }
        errors.push(error);
      },
    );

    if (errors.length === 0) {
      return { variableValues };
    }
  } catch (error) {
    errors.push(error);
  }

  return { errors };
}

function coerceVariableValues(
  schema: GraphQLSchema,
  varDefNodes: $ReadOnlyArray<VariableDefinitionNode>,
  inputs: ReadOnlyObjMapLike<mixed>,
  onError: (error: GraphQLError) => void,
): VariableValues {
  const sources = Object.create(null);
  const coerced = Object.create(null);
  for (const varDefNode of varDefNodes) {
    const varName = varDefNode.variable.name.value;
    const varType = typeFromAST(schema, varDefNode.type);
    if (!isInputType(varType)) {
      // Must use input types for variables. This should be caught during
      // validation, however is checked again here for safety.
      const varTypeStr = print(varDefNode.type);
      onError(
        new GraphQLError(
          `Variable "$${varName}" expected value of type "${varTypeStr}" which cannot be used as an input type.`,
          varDefNode.type,
        ),
      );
      continue;
    }

    const value = hasOwnProperty(inputs, varName) ? inputs[varName] : undefined;
    sources[varName] = { variable: varDefNode, type: varType, value };

    if (value === undefined) {
      if (varDefNode.defaultValue) {
        coerced[varName] = coerceInputLiteral(varDefNode.defaultValue, varType);
        continue;
      } else if (!isNonNullType(varType)) {
        // Non-provided values for nullable variables are omitted.
        continue;
      }
    }

    const coercedValue = coerceInputValue(value, varType);
    if (coercedValue !== undefined) {
      coerced[varName] = coercedValue;
    } else {
      validateInputValue(value, varType, (error, path) => {
        onError(
          new GraphQLError(
            `Variable "$${varName}" has invalid value${printPathArray(path)}: ${
              error.message
            }`,
            varDefNode,
            undefined,
            undefined,
            undefined,
            error.originalError,
          ),
        );
      });
    }
  }

  return { sources, coerced };
}

/**
 * Prepares an object map of argument values given a list of argument
 * definitions and list of argument AST nodes.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 *
 * @internal
 */
export function getArgumentValues(
  def: GraphQLField<mixed, mixed> | GraphQLDirective,
  node: FieldNode | DirectiveNode,
  variableValues?: ?VariableValues,
): { [argument: string]: mixed, ... } {
  const coercedValues = {};

  // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2203')
  const argumentNodes = node.arguments ?? [];
  const argNodeMap = keyMap(argumentNodes, (arg) => arg.name.value);

  for (const argDef of def.args) {
    const name = argDef.name;
    const argType = argDef.type;
    const argumentNode = argNodeMap[name];

    if (!argumentNode && isRequiredInput(argDef)) {
      // Note: ProvidedRequiredArgumentsRule validation should catch this before
      // execution. This is a runtime check to ensure execution does not
      // continue with an invalid argument value.
      throw new GraphQLError(
        `Argument "${name}" of required type "${String(
          argType,
        )}" was not provided.`,
        node,
      );
    }

    // Variables without a value are treated as if no argument was provided if
    // the argument is not required.
    if (
      !argumentNode ||
      (argumentNode.value.kind === Kind.VARIABLE &&
        variableValues?.coerced[argumentNode.value.name.value] === undefined &&
        !isRequiredInput(argDef))
    ) {
      if (argDef.defaultValue) {
        coercedValues[name] = coerceDefaultValue(
          argDef.defaultValue,
          argDef.type,
        );
      }
      continue;
    }

    const valueNode = argumentNode.value;
    const coercedValue = coerceInputLiteral(valueNode, argType, variableValues);
    if (coercedValue === undefined) {
      // Note: ValuesOfCorrectTypeRule validation should catch this before
      // execution. This is a runtime check to ensure execution does not
      // continue with an invalid argument value.
      validateInputLiteral(
        valueNode,
        argType,
        variableValues,
        (error, path) => {
          error.message = `Argument "${name}" has invalid value${printPathArray(
            path,
          )}: ${error.message}`;
          throw error;
        },
      );
      // istanbul ignore next (validateInputLiteral should throw)
      invariant(false, 'Invalid argument');
    }
    coercedValues[name] = coercedValue;
  }
  return coercedValues;
}

/**
 * Prepares an object map of argument values given a directive definition
 * and a AST node which may contain directives. Optionally also accepts a map
 * of variable values.
 *
 * If the directive does not exist on the node, returns undefined.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 */
export function getDirectiveValues(
  directiveDef: GraphQLDirective,
  node: { +directives?: $ReadOnlyArray<DirectiveNode>, ... },
  variableValues?: ?VariableValues,
): void | { [argument: string]: mixed, ... } {
  // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2203')
  const directiveNode = node.directives?.find(
    (directive) => directive.name.value === directiveDef.name,
  );

  if (directiveNode) {
    return getArgumentValues(directiveDef, directiveNode, variableValues);
  }
}
