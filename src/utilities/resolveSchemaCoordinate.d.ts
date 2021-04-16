import { GraphQLSchema } from '../type/schema';
import { GraphQLSchemaElement } from '../type/element';
import { SchemaCoordinateNode } from '../language/ast';
import { Source } from '../language/source';

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
