export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  low_stock_limit: number;
};
export type LowStockProduct = Pick<Product, "id" | "name" | "stock" | "low_stock_limit">;