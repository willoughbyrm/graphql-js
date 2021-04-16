import type { GraphQLSchema } from '../type/schema';
import type { GraphQLSchemaElement } from '../type/element';
import type { SchemaCoordinateNode } from '../language/ast';
import type { Source } from '../language/source';
import {
  isObjectType,
  isInterfaceType,
  isEnumType,
  isInputObjectType,
} from '../type/definition';
import { parseSchemaCoordinate } from '../language/parser';

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
): GraphQLSchemaElement | void {
  return resolveASTSchemaCoordinate(
    schema,
    parseSchemaCoordinate(schemaCoordinate),
  );
}

/**
 * Resolves schema coordinate from a parsed SchemaCoordinate node.
 */
export function resolveASTSchemaCoordinate(
  schema: GraphQLSchema,
  schemaCoordinate: SchemaCoordinateNode,
): GraphQLSchemaElement | void {
  const { isDirective, name, fieldName, argumentName } = schemaCoordinate;
  if (isDirective) {
    // SchemaCoordinate :
    //   - @ Name
    //   - @ Name ( Name : )
    // Let {directiveName} be the value of the first {Name}.
    // Let {directive} be the directive in the {schema} named {directiveName}.
    const directive = schema.getDirective(name.value);
    if (!argumentName) {
      // SchemaCoordinate : @ Name
      // Return the directive in the {schema} named {directiveName}.
      return directive || undefined;
    }

    // SchemaCoordinate : @ Name ( Name : )
    // Assert {directive} must exist.
    if (!directive) {
      return;
    }
    return directive.args.find((arg) => arg.name === argumentName.value);
  }

  // SchemaCoordinate :
  //   - Name
  //   - Name . Name
  //   - Name . Name ( Name : )
  // Let {typeName} be the value of the first {Name}.
  // Let {type} be the type in the {schema} named {typeName}.
  const type = schema.getType(name.value);
  if (!fieldName) {
    // SchemaCoordinate : Name
    // Return the type in the {schema} named {typeName}.
    return type || undefined;
  }

  if (!argumentName) {
    // SchemaCoordinate : Name . Name
    // If {type} is an Enum type:
    if (isEnumType(type)) {
      // Let {enumValueName} be the value of the second {Name}.
      // Return the enum value of {type} named {enumValueName}.
      return type.getValue(fieldName.value) || undefined;
    }
    // Otherwise if {type} is an Input Object type:
    if (isInputObjectType(type)) {
      // Let {inputFieldName} be the value of the second {Name}.
      // Return the input field of {type} named {inputFieldName}.
      return type.getFields()[fieldName.value];
    }
    // Otherwise:
    // Assert {type} must be an Object or Interface type.
    if (!isObjectType(type) && !isInterfaceType(type)) {
      return;
    }
    // Let {fieldName} be the value of the second {Name}.
    // Return the field of {type} named {fieldName}.
    return type.getFields()[fieldName.value];
  }

  // SchemaCoordinate : Name . Name ( Name : )
  // Assert {type} must be an Object or Interface type.
  if (!isObjectType(type) && !isInterfaceType(type)) {
    return;
  }
  // Let {fieldName} be the value of the second {Name}.
  // Let {field} be the field of {type} named {fieldName}.
  const field = type.getFields()[fieldName.value];
  // Assert {field} must exist.
  if (!field) {
    return;
  }
  // Let {argumentName} be the value of the third {Name}.
  // Return the argument of {field} named {argumentName}.
  return field.args.find((arg) => arg.name === argumentName.value);
}
