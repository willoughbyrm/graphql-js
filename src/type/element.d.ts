import {
  GraphQLNamedType,
  GraphQLField,
  GraphQLInputField,
  GraphQLEnumValue,
  GraphQLArgument,
} from './definition';
import { GraphQLDirective } from './directives';

export type GraphQLSchemaElement =
  | GraphQLNamedType
  | GraphQLField<unknown, unknown>
  | GraphQLInputField
  | GraphQLEnumValue
  | GraphQLArgument
  | GraphQLDirective;
