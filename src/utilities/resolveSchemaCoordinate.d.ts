import { GraphQLSchema } from '../type/schema';
import {
  GraphQLNamedType,
  GraphQLField,
  GraphQLInputField,
  GraphQLEnumValue,
  GraphQLArgument,
} from '../type/definition';
import { GraphQLDirective } from '../type/directives';
import { SchemaCoordinateNode } from '../language/ast';
import { Source } from '../language/source';

/**
 * A schema element may be one of the following kinds:
 */
export type GraphQLSchemaElement =
  | Readonly<{
      kind: 'NamedType';
      type: GraphQLNamedType;
    }>
  | Readonly<{
      kind: 'Field';
      type: GraphQLNamedType;
      field: GraphQLField<unknown, unknown>;
    }>
  | Readonly<{
      kind: 'InputField';
      type: GraphQLNamedType;
      inputField: GraphQLInputField;
    }>
  | Readonly<{
      kind: 'EnumValue';
      type: GraphQLNamedType;
      enumValue: GraphQLEnumValue;
    }>
  | Readonly<{
      kind: 'FieldArgument';
      type: GraphQLNamedType;
      field: GraphQLField<unknown, unknown>;
      fieldArgument: GraphQLArgument;
    }>
  | Readonly<{
      kind: 'Directive';
      directive: GraphQLDirective;
    }>
  | Readonly<{
      kind: 'DirectiveArgument';
      directive: GraphQLDirective;
      directiveArgument: GraphQLArgument;
    }>;

/**
 * A schema coordinate is resolved in the context of a GraphQL schema to
 * uniquely identifies a schema element. It returns undefined if the schema
 * coordinate does not resolve to a schema element.
 *
 * https://spec.graphql.org/draft/#sec-Schema-Coordinates.Semantics
 */
export function resolveSchemaCoordinate(
  schema: GraphQLSchema,
  schemaCoordinate: string | Source,
): GraphQLSchemaElement | undefined;

/**
 * Resolves schema coordinate from a parsed SchemaCoordinate node.
 */
export function resolveASTSchemaCoordinate(
  schema: GraphQLSchema,
  schemaCoordinate: SchemaCoordinateNode,
): GraphQLSchemaElement | undefined;
