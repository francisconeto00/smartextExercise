## Backend

### Setup
1. Create MySQL database. Ex: 
```
CREATE DATABASE product_catalog;
```
2. Configure the database connection config file and .env file.
```
cp config/config.json.example config/config.json
cp .env.example .env

```
And fill in the data from the database and the information on .env.


4. Install dependencies
```
npm install
```

5. (Optional) Populate the database with initial data, run the command: 
```
npm run seed
```

6. Run the project
```
npm run dev
```