import type {
  GraphQLNamedType,
  GraphQLField,
  GraphQLInputField,
  GraphQLEnumValue,
  GraphQLArgument,
} from './definition';
import type { GraphQLDirective } from './directives';

export type GraphQLSchemaElement =
  | GraphQLNamedType
  | GraphQLField<mixed, mixed>
  | GraphQLInputField
  | GraphQLEnumValue
  | GraphQLArgument
  | GraphQLDirective;
