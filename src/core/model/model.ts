import { DatabaseAdapter, ColumnDefinition, TableSchema } from './databaseAdapter';

export class Model<T>  {
  protected static tableSchema: TableSchema;
  protected static db: DatabaseAdapter;
  public data: T; // Propiedad para almacenar los datos del modelo

  constructor(data?: T) {
    this.data = data || ({} as T);
  }
  

  // Inicializar el modelo con la tabla y el adaptador de base de datos
  static initialize(tableSchema: TableSchema, db: DatabaseAdapter) {
    this.tableSchema = tableSchema;
    this.db = db;
  }

  // Método para crear una tabla
  static async createTable(): Promise<void> {
    if (!this.tableSchema || !this.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = this.tableSchema.tableName;
    const columns = this.tableSchema.columns;
    
    await this.db.createTable(tableName, columns);
  }

  // Método para listar todos los registros con paginación
  static async findAll(page: number = 1, pageSize: number = 30): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database adapter is not initialized.');
    }

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const sql = `SELECT * FROM ${this.tableSchema.tableName} LIMIT ?, ?`;
    const values = [offset, limit];

    const result = await this.db.prepare(sql, values);
    return result;
  }

  static async dropTable(): Promise<void> {
    if (!this.tableSchema || !this.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = this.tableSchema.tableName;

    // Primero, borrar el contenido de la tabla
    const deleteContentSQL = `DELETE FROM ${tableName}`;
    await this.db.prepare(deleteContentSQL, {});

    // Luego, borrar la tabla
    const dropTableSQL = `DROP TABLE IF EXISTS ${tableName}`;
    await this.db.prepare(dropTableSQL, {});
  }

  // Método para buscar un registro por su ID
  static async findById(id: number): Promise<any | null> {
    if (!this.tableSchema || !this.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = this.tableSchema.tableName;
    const idField = 'id'; // Ajusta esto si el campo de ID se llama diferente

    const sql = `SELECT * FROM ${tableName} WHERE ${idField} = ? LIMIT 1`;
    const values = [id];

    const result = await this.db.prepare(sql, values);

    if (Array.isArray(result) && result.length > 0) {
      return result[0]; // Devuelve el primer registro encontrado
    } else {
      return null; // No se encontró ningún registro con el ID
    }
  }

  // Método para buscar un solo registro que cumple con las condiciones
  static async findOne(conditions: Record<string, any>): Promise<any | null> {
    if (!this.tableSchema || !this.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = this.tableSchema.tableName;
    const columns = this.tableSchema.columns;

    const conditionKeys = Object.keys(conditions);
    const conditionValues = conditionKeys.map((key) => conditions[key]);
    
    const conditionClauses = conditionKeys.map((key) => `${key} = ?`);
    const whereClause = conditionClauses.join(' AND ');

    const sql = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT 1`;

    const result = await this.db.prepare(sql, conditionValues);

    if (Array.isArray(result) && result.length > 0) {
      return result[0]; // Devuelve el primer registro encontrado
    } else {
      return null; // No se encontró ningún registro que cumpla con las condiciones
    }
  }

  // Método para buscar múltiples registros que cumplen con las condiciones
  static async findBy(conditions: Record<string, any>): Promise<any[]> {
    if (!this.tableSchema || !this.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = this.tableSchema.tableName;
    const columns = this.tableSchema.columns;

    const conditionKeys = Object.keys(conditions);
    const conditionValues = conditionKeys.map((key) => conditions[key]);

    const conditionClauses = conditionKeys.map((key) => `${key} = ?`);
    const whereClause = conditionClauses.join(' AND ');

    const sql = `SELECT * FROM ${tableName} WHERE ${whereClause}`;

    return this.db.prepare(sql, conditionValues);
  }

  static async count(conditions: Record<string, any> = []): Promise<number> {
    if (!this.tableSchema || !this.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = this.tableSchema.tableName;
    const conditionKeys = Object.keys(conditions);
    const conditionValues = conditionKeys.map((key) => conditions[key]);

    const conditionClauses = conditionKeys.map((key) => `${key} = ?`);
    const whereClause = conditionClauses.join(' AND ');

    const sql = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${whereClause}`;
    const result = await this.db.prepare(sql, conditionValues);

    if (Array.isArray(result) && result.length > 0 && result[0].count) {
      return result[0].count;
    } else {
      return 0; // No se encontraron registros que cumplan con las condiciones
    }
  }

  /////////////////////////////////////////// MÉTODOS DE INSTANCIA

  // Método para guardar los datos en la base de datos
  async save(): Promise<void> {
    if (!Model.tableSchema || !Model.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = Model.tableSchema.tableName;
    const columns = Model.tableSchema.columns;

    const dataToSave = this.data as any;

    // Implementa la lógica para generar la consulta SQL de inserción
    const sql = `INSERT INTO ${tableName} (${Object.keys(dataToSave).join(', ')}) VALUES (${Object.values(dataToSave).map(() => '?').join(', ')})`;

    // Ejecuta la consulta para guardar los datos
    await Model.db.prepare(sql, Object.values(dataToSave));
  }

  // Método para crear un nuevo registro en la base de datos
  async create(): Promise<void> {
    if (!Model.tableSchema || !Model.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = Model.tableSchema.tableName;
    const columns = Model.tableSchema.columns;

    const dataToCreate = this.data as any || ({} as T); // Si no se proporcionan datos, se inicia con campos nulos.

    // Implementa la lógica para generar la consulta SQL de inserción
    const columnNames = Object.keys(dataToCreate).join(', ');
    const placeholders = Object.keys(dataToCreate).map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;

    // Ejecuta la consulta para crear un nuevo registro
    await Model.db.prepare(sql, Object.values(dataToCreate));
  }


  // Método para borrar el registro actual en la base de datos
  async delete(): Promise<void> {
    if (!Model.tableSchema || !Model.db) {
      throw new Error('Table schema and database adapter must be initialized.');
    }

    const tableName = Model.tableSchema.tableName;
    const idField = 'id'; // Ajusta esto si el campo de ID se llama diferente

    const id = (this.data as any)[idField];

    if (id) {
      const sql = `DELETE FROM ${tableName} WHERE ${idField} = ?`;

      await Model.db.prepare(sql, [id]);
    } else {
      throw new Error('ID is required to delete the record.');
    }
  }
}