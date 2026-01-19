Blogging Platform REST API



A RESTful API for a personal blogging platform built using Node.js, Express, MySQL, and Swagger (OpenAPI).

This project supports full CRUD operations, search functionality, relational data modeling, transactions, and interactive API documentation.



Features



Create, read, update, and delete blog posts



Many-to-many relationship between posts and tags



Search blog posts by title, content, category, or tags



MySQL relational database with proper normalization



Transactions for data consistency



Swagger (OpenAPI) documentation for easy testing



Clean and scalable project structure



Tech Stack



Backend: Node.js, Express.js



Database: MySQL



ORM / Driver: mysql2



Documentation: Swagger UI (swagger-jsdoc, swagger-ui-express)



Tools: Postman, GitHub



blogapi/

│

├── routes/

│   └── posts.js        # Blog routes (CRUD + search)

├── db.js               # MySQL connection pool

├── swagger.js          # Swagger configuration

├── server.js           # App entry point

├── package.json

├── .gitignore

└── README.md



Database Schema



Posts Table



id (Primary Key)



title



content



category



created\_at



updated\_at



Tags Table



id (Primary Key)



name



Post\_Tags Table (Many-to-Many)



post\_id (Foreign Key)



tag\_id (Foreign Key)



Setup Instructions



Clone the Repository



git clone https://github.com/<your-username>/blogging-platform-api.git

cd blogging-platform-api



Install Dependencies



npm install



Configure Environment Variables



Create a .env file in the root directory:



DB\_HOST=localhost

DB\_USER=root

DB\_PASSWORD=your\_mysql\_password

DB\_NAME=blog\_db

PORT=3000



Create Database \& Tables



CREATE DATABASE blog\_db;

USE blog\_db;



Create tables:



CREATE TABLE posts (

&nbsp; id INT AUTO\_INCREMENT PRIMARY KEY,

&nbsp; title VARCHAR(255) NOT NULL,

&nbsp; content TEXT NOT NULL,

&nbsp; category VARCHAR(100) NOT NULL,

&nbsp; created\_at DATETIME DEFAULT CURRENT\_TIMESTAMP,

&nbsp; updated\_at DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP

);



CREATE TABLE tags (

&nbsp; id INT AUTO\_INCREMENT PRIMARY KEY,

&nbsp; name VARCHAR(50) UNIQUE NOT NULL

);



CREATE TABLE post\_tags (

&nbsp; post\_id INT,

&nbsp; tag\_id INT,

&nbsp; PRIMARY KEY (post\_id, tag\_id),

&nbsp; FOREIGN KEY (post\_id) REFERENCES posts(id) ON DELETE CASCADE,

&nbsp; FOREIGN KEY (tag\_id) REFERENCES tags(id) ON DELETE CASCADE

);





Start the Server



node server.js



Server will run on:



http://localhost:3000



Swagger API Documentation



Swagger UI is available at:



http://localhost:3000/api-docs



You can:



View all API endpoints



Test requests directly from the browser



See request/response formats



API Endpoints



Method	 Endpoint	     Description

POST	 /posts	             Create a new blog post

GET	 /posts	             Get all blog posts

GET	 /posts?term=tech    Search blog posts

GET	 /posts/{id}	     Get a single blog post

PUT	 /posts/{id}	     Update a blog post

DELETE	 /posts/{id}	     Delete a blog post



Example Request (Create Post)



{

&nbsp; "title": "My First Blog",

&nbsp; "content": "This is my first blog post",

&nbsp; "category": "Technology",

&nbsp; "tags": \["NodeJS", "MySQL", "API"]

}



Data Safety



Uses MySQL transactions



Prevents partial inserts



Maintains data consistency across tables





Future Enhancements



User authentication (JWT)



Role-based access control



Pagination \& sorting



Comments system



Deployment to cloud (Render / Railway)



API rate limiting \& caching











