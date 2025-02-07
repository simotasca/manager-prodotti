interface Join {
  table: string;
  alias: string | null;
  field1: string;
  field2: string;
}

type OrderType = 'ASC' | 'DESC';

interface OrderBy {
  field: string;
  order: OrderType;
}

export class SelectBuilder {
  private table: string;
  private alias?: string;
  private fields: { name: string; alias?: string }[] = [];
  private joins: Join[] = [];
  private whereClauses: string[] = [];
  private orderBy: OrderBy[] = [];
  private skip?: number;
  private take?: number;

  constructor(table: string, alias?: string) {
    this.table = table;
    this.alias = alias;
  }

  public addField(name: string, alias?: string) {
    this.fields.push({ name, alias });
    return this;
  }

  public addJoin(table: string, alias: string | null, field1: string, field2: string) {
    this.joins.push({ table, alias, field1, field2 });
    return this;
  }

  /**
   * SUPPORTS ONLY "AND"
   */
  public addWhereClause(...clauses: string[]) {
    this.whereClauses.push(...clauses);
    return this;
  }

  public addOrderBy(field: string, order: OrderType) {
    this.orderBy.push({ field, order });
    return this;
  }

  public setPagination(skip: number, take: number) {
    this.skip = skip;
    this.take = take;
    return this;
  }

  public build() {
    let query: string;

    const stringFields =
      this.fields.length == 0 ? '*' : this.fields.map(f => f.name + (f.alias ? ` AS ${f.alias}` : '')).join(', ');
    query = `SELECT ${stringFields} FROM ${this.table}`;
    if (this.alias) query += ' AS ' + this.alias;

    this.joins.forEach(join => {
      if (join.table && join.field1 && join.field2)
        query =
          query +
          ` LEFT JOIN ${join.table}` +
          (join.alias ? ` as ${join.alias}` : '') +
          ` ON ${join.field1} = ${join.field2}`;
    });

    if (this.whereClauses.length > 0) {
      query += ' WHERE ' + this.whereClauses.join(' AND ');
    }

    if (this.orderBy.length > 0) {
      query += ' ORDER BY ' + this.orderBy.map(ob => `${ob.field} ${ob.order}`).join(', ');
    }

    if (this.take != undefined) {
      query += ' LIMIT ' + this.take;

      if (this.skip != undefined) {
        query += ' OFFSET ' + this.skip;
      }
    }

    query += ';';

    return query;
  }
}
