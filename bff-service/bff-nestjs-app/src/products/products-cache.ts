class ProductsCashe {
  private products: Object[];
  time: number | null;

  constructor() {
    this.products = [];
    this.time = null;
  }

  setProducts(products: Object[]) {
    this.time = Date.now();
    this.products = products;
  }

  get cachedProducts() {
    return this.products;
  }
}

export default ProductsCashe;
