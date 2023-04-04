export class UpdateBuilder {
  // only one table supported (no join)
  private table: string;
  // private alias?: string;
  // private fields: { name: string; alias?: string }[] = [];
  // private joins: Join[] = [];
  private whereClauses: string[] = [];
  private setParams: { [key: string]: string } = {};
  // private orderBy: OrderBy[] = [];
  // private skip?: number;
  // private take?: number;
  constructor(table: string) {
    this.table = table;
  }

  /**
   * SUPPORTS ONLY "AND"
   */
  public addWhereClause(...clauses: string[]) {
    this.whereClauses.push(...clauses);
    return this;
  }

  public addSetParam(field: string, value: string) {
    this.setParams[field] = value;
    return this;
  }

  public addStringSetParam(field: string, value: string) {
    this.setParams[field] = `"${value}"`;
    return this;
  }

  public build() {
    let query: string = 'UPDATE ' + this.table;

    if (Object.keys(this.setParams).length) {
      query +=
        ' SET ' +
        Object.entries(this.setParams)
          .map(([param, value]) => `${param} = ${value}`)
          .join(', ');
    }

    if (this.whereClauses.length) {
      query += ' WHERE ' + this.whereClauses.join(' AND ');
    }

    return query;
  }
}
