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