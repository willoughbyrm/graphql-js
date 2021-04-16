import { expect } from 'chai';
import { describe, it } from 'mocha';

import { buildSchema } from '../buildASTSchema';
import { resolveSchemaCoordinate } from '../resolveSchemaCoordinate';

describe('resolveSchemaCoordinate', () => {
  const schema: any = buildSchema(`
    type Query {
      searchBusiness(criteria: SearchCriteria!): [Business]
    }

    input SearchCriteria {
      name: String
      filter: SearchFilter
    }

    enum SearchFilter {
      OPEN_NOW
      DELIVERS_TAKEOUT
      VEGETARIAN_MENU
    }

    type Business {
      id: ID
      name: String
      email: String @private(scope: "loggedIn")
    }

    directive @private(scope: String!) on FIELD_DEFINITION
  `);

  it('resolves a Named Type', () => {
    const expected = schema.getType('Business');
    expect(expected).not.to.equal(undefined);
    expect(resolveSchemaCoordinate(schema, 'Business')).to.equal(expected);

    expect(resolveSchemaCoordinate(schema, 'String')).to.equal(
      schema.getType('String'),
    );

    expect(resolveSchemaCoordinate(schema, 'private')).to.equal(undefined);

    expect(resolveSchemaCoordinate(schema, 'Unknown')).to.equal(undefined);
  });

  it('resolves a Type Field', () => {
    const expected = schema.getType('Business').getFields().name;
    expect(expected).not.to.equal(undefined);
    expect(resolveSchemaCoordinate(schema, 'Business.name')).to.equal(expected);

    expect(resolveSchemaCoordinate(schema, 'Business.unknown')).to.equal(
      undefined,
    );

    expect(resolveSchemaCoordinate(schema, 'Unknown.field')).to.equal(
      undefined,
    );

    expect(resolveSchemaCoordinate(schema, 'String.field')).to.equal(undefined);
  });

  it('does not resolve meta-fields', () => {
    expect(resolveSchemaCoordinate(schema, 'Business.__typename')).to.equal(
      undefined,
    );
  });

  it('resolves a Input Field', () => {
    const expected = schema.getType('SearchCriteria').getFields().filter;
    expect(expected).not.to.equal(undefined);
    expect(resolveSchemaCoordinate(schema, 'SearchCriteria.filter')).to.equal(
      expected,
    );

    expect(resolveSchemaCoordinate(schema, 'SearchCriteria.unknown')).to.equal(
      undefined,
    );
  });

  it('resolves a Enum Value', () => {
    const expected = schema.getType('SearchFilter').getValue('OPEN_NOW');
    expect(expected).not.to.equal(undefined);
    expect(resolveSchemaCoordinate(schema, 'SearchFilter.OPEN_NOW')).to.equal(
      expected,
    );

    expect(resolveSchemaCoordinate(schema, 'SearchFilter.UNKNOWN')).to.equal(
      undefined,
    );
  });

  it('resolves a Field Argument', () => {
    const expected = schema
      .getType('Query')
      .getFields()
      .searchBusiness.args.find((arg) => arg.name === 'criteria');
    expect(expected).not.to.equal(undefined);
    expect(
      resolveSchemaCoordinate(schema, 'Query.searchBusiness(criteria:)'),
    ).to.equal(expected);

    expect(resolveSchemaCoordinate(schema, 'Business.name(unknown:)')).to.equal(
      undefined,
    );

    expect(resolveSchemaCoordinate(schema, 'Unknown.field(arg:)')).to.equal(
      undefined,
    );

    expect(resolveSchemaCoordinate(schema, 'Business.unknown(arg:)')).to.equal(
      undefined,
    );

    expect(
      resolveSchemaCoordinate(schema, 'SearchCriteria.name(arg:)'),
    ).to.equal(undefined);
  });

  it('resolves a Directive', () => {
    const expected = schema.getDirective('private');
    expect(expected).not.to.equal(undefined);
    expect(resolveSchemaCoordinate(schema, '@private')).to.equal(expected);

    expect(resolveSchemaCoordinate(schema, '@unknown')).to.equal(undefined);

    expect(resolveSchemaCoordinate(schema, '@Business')).to.equal(undefined);
  });

  it('resolves a Directive Argument', () => {
    const expected = schema
      .getDirective('private')
      .args.find((arg) => arg.name === 'scope');
    expect(expected).not.to.equal(undefined);
    expect(resolveSchemaCoordinate(schema, '@private(scope:)')).to.equal(
      expected,
    );

    expect(resolveSchemaCoordinate(schema, '@private(unknown:)')).to.equal(
      undefined,
    );

    expect(resolveSchemaCoordinate(schema, '@unknown(arg:)')).to.equal(
      undefined,
    );
  });
});
