export class InsertBuilder {
  private table: string;
  private colValues: { [key: string]: string } = {};
  constructor(table: string) {
    this.table = table;
  }

  public fromObject(obj: { [key: string]: any }) {
    this.colValues = Object.entries(obj).reduce((prev, [key, val]) => ({ ...prev, [key]: String(val) }), {});
    return this;
  }

  public addColumnValue(column: string, value: string) {
    this.colValues[column] = value;
    return this;
  }

  public addStringColumnValue(column: string, value: string) {
    this.colValues[column] = `"${value}"`;
    return this;
  }

  public build() {
    let query = `INSERT INTO ${this.table}`;
    query += ` (${Object.keys(this.colValues).join(', ')})`;
    query += ` VALUES (${Object.values(this.colValues).join(', ')});`;
    return query;
  }
}
