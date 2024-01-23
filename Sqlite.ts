import SQLite, {Transaction, ResultSet} from 'react-native-sqlite-storage';

interface Product {
  id: string;
  name: string;
  price: number;
}

export class Database {
  db!: SQLite.SQLiteDatabase;
  databaseName: string;

  constructor() {
    this.databaseName = 'mydatabase.db';
    this.initDatabase();
  }

  async initDatabase() {
    try {
      this.db = await SQLite.openDatabase({
        name: this.databaseName,
        location: 'default',
      });
      console.log('Database opened successfully');
      this.create();
    } catch (error) {
      console.error('Error occurred while opening the database:', error);
    }
  }

  create() {
    this.db.transaction((tx: Transaction) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, price INTEGER)',
        [],
        () => {
          console.log('Table created successfully');
        },
        error => {
          console.log('Error occurred while creating the table:', error);
        },
      );
    });
  }

  drop() {
    this.db.transaction(
      (tx: Transaction) => {
        tx.executeSql(
          `DROP TABLE IF EXISTS products`,
          [],
          () => {
            console.log('Table dropped successfully');
          },
          error => {
            console.log('Error occurred while dropping the table:', error);
          },
        );
      },
      error => {
        console.log('Transaction error:', error);
      },
      () => {
        console.log('Transaction completed successfully');
      },
    );
  }

  insertProduct(product: Product) {
    this.db.transaction(
      (tx: Transaction) => {
        tx.executeSql(
          'INSERT INTO products (id, name, price) VALUES (?, ?, ?)',
          [product.id, product.name, product.price],
          (tx: Transaction, resultSet: ResultSet) => {
            if (resultSet.rowsAffected > 0) {
              console.log('Product inserted successfully');
            } else {
              console.log('Failed to insert product');
            }
          },
          error => {
            console.log('Error occurred while inserting product:', error);
          },
        );
      },
      error => {
        console.log('Transaction error:', error);
      },
      () => {
        console.log('Transaction completed successfully');
      },
    );
  }

  findProductById(
    productId: string,
    callback: (product: Product | null) => void,
  ) {
    this.db.transaction(
      (tx: Transaction) => {
        tx.executeSql(
          'SELECT * FROM products WHERE id = ? LIMIT 1',
          [productId],
          (tx: Transaction, resultSet: ResultSet) => {
            if (resultSet.rows.length > 0) {
              const productRow = resultSet.rows.item(0);
              const foundProduct: Product = {
                id: productRow.id.toString(),
                name: productRow.name,
                price: productRow.price,
              };
              callback(foundProduct);
            } else {
              callback(null);
            }
          },
          error => {
            console.log('Error occurred while finding product by ID:', error);
            callback(null);
          },
        );
      },
      error => {
        console.log('Transaction error:', error);
      },
      () => {
        console.log('Transaction completed successfully');
      },
    );
  }
}
