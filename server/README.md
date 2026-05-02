## Backend Folder Structure

```text
server/
	src/
		config/
			db.ts
		controllers/
		middleware/
		models/
		routes/
		services/
		types/
		utils/
		index.ts
```

### Purpose

- `config/` - environment and database setup.
- `controllers/` - request handlers.
- `middleware/` - auth, error handling, request validation
- `models/` - Mongoose schemas and models
- `routes/` - route definitions
- `services/` - business logic and database operations
- `types/` - shared TypeScript types and interfaces
- `utils/` - helpers and reusable functions

### Suggested Entry Files

- `src/index.ts` - starts the server
- `src/config/db.ts` - connects to MongoDB
- `src/routes/index.ts` - combines all route modules


```sql
	use ecommerce;
	SET FOREIGN_KEY_CHECKS = 0;
	TRUNCATE TABLE order_items;
	TRUNCATE TABLE orders;
	TRUNCATE TABLE cart_items;
	TRUNCATE TABLE wishlist_items;
	TRUNCATE TABLE addresses;
	TRUNCATE TABLE users;
	TRUNCATE TABLE products;
	TRUNCATE TABLE categories;
	SET FOREIGN_KEY_CHECKS = 1;


```




connect ECONNREFUSED 127.0.0.1:27017, connect ECONNREFUSED ::1:27017

Windows:Press Win + R, type services.msc, and hit Enter.
Find MongoDB Server (or MongoDB) in the list.
If the status isn't "Running," right-click it and select Start

## API Routes

The server mounts these routers from `src/index.ts`:

| Base path | File | Notes |
| --- | --- | --- |
| `/api/users` | `src/routes/user.routes.ts` | user create, login, profile |
| `/api/categories` | `src/routes/catagorie.routes.ts` | category list |
| `/api/products` | `src/routes/product.routes.ts` | product CRUD |
| `/api/wishlist` | `src/routes/wishlist.routes.ts` | wishlist actions |
| `/api/cart` | `src/routes/cart.routes.ts` | cart actions |
| `/api/addresses` | `src/routes/address.routes.ts` | address CRUD |
| `/api/orders` | `src/routes/order.routes.ts` | order lifecycle |

### Route Details

#### Users

- `POST /api/users/create` - create a new user
- `POST /api/users/login` - sign in a user
- `GET /api/users/profile` - get the authenticated user profile

#### Categories

- `GET /api/categories/` - list categories

#### Products

- `GET /api/products/user` - get the authenticated user's products
- `POST /api/products/create` - create a product
- `GET /api/products/:id` - get a product by id
- `DELETE /api/products/delete/:id` - delete a product
- `PUT /api/products/update/:id` - update a product

#### Wishlist

- `POST /api/wishlist/add` - add an item to wishlist
- `GET /api/wishlist/` - get wishlist items
- `DELETE /api/wishlist/remove/:id` - remove an item from wishlist

#### Cart

- `GET /api/cart/` - get the authenticated cart
- `POST /api/cart/add` - add an item to cart

#### Addresses

- `POST /api/addresses/add` - add an address
- `GET /api/addresses/list` - list saved addresses
- `PUT /api/addresses/update/:id` - update an address
- `DELETE /api/addresses/delete/:id` - delete an address

#### Orders

- `POST /api/orders/create` - create an order
- `GET /api/orders/my` - list the authenticated user's orders
- `GET /api/orders/:id` - get an order by id
- `PUT /api/orders/update/:id` - update an order
- `POST /api/orders/cancel/:id` - cancel an order

## Runtime Notes

- The server chooses the database implementation from `DATA_BASE_TYPE`.
- Set `DATA_BASE_TYPE=sql` to use the SQL connection path.
- Set `DATA_BASE_TYPE=mongodb` to use the MongoDB connection path.
- The MongoDB connection error shown above usually means MongoDB is not running locally on port `27017`.