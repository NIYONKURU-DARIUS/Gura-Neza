Gura Neza 🛒
Gura Neza (meaning "Buy Well" in Kinyarwanda) is a full-stack e-commerce backend system built with Spring Boot and PostgreSQL.

🚀 About The Project
Gura Neza is a RESTful API that powers a complete e-commerce platform. It provides secure authentication, product management, cart system, order processing, and a wallet-based payment system.

✨ Features

🔐 Authentication — JWT-based register and login system
👥 Role System — USER and ADMIN roles with protected endpoints
📦 Product Management — Admin can create, update, and delete products
🛒 Cart System — Users can add, remove, and update cart items
📋 Order System — Cart to order conversion with stock management
💰 Wallet System — Balance management and wallet-based payments


🛠️ Tech Stack
TechnologyPurposeJava 24Programming languageSpring Boot 3Backend frameworkSpring SecurityAuthentication and authorizationJWTToken-based authenticationSpring Data JPADatabase accessPostgreSQLDatabaseLombokReduce boilerplate codeMavenDependency management

📁 Project Structure
com.dariusfirstproject.gura_neza
 ├── auth        → Registration and login
 ├── user        → User management
 ├── product     → Product CRUD
 ├── cart        → Cart management
 ├── order       → Order processing
 ├── wallet      → Wallet and transactions
 ├── config      → App configuration
 ├── security    → JWT and filters
 └── exception   → Global error handling

🗄️ Database Schema

users — stores user accounts and roles
products — stores product catalog
carts — stores user carts
cart_items — stores items in each cart
orders — stores placed orders
order_items — stores items in each order
wallets — stores user wallet balances
transactions — stores wallet transaction history


⚙️ Setup and Installation

Clone the repository:

bashgit clone https://github.com/yourusername/gura-neza.git

Create PostgreSQL database:

sqlCREATE DATABASE guranezadb;

Copy and configure properties:

bashcp application.properties.example application.properties

Update application.properties with your database credentials
Run the application:

bashmvn spring-boot:run

🔒 Environment Variables
Copy application.properties.example to application.properties and fill in:
propertiesspring.datasource.url=jdbc:postgresql://localhost:5432/guranezadb
spring.datasource.username=your_username
spring.datasource.password=your_password
app.jwt.secret=your_base64_secret_key

👨‍💻 Author
Darius — Computer Science Student, Year 2

📌 Project Status
🚧 Currently in active development — Phase 1
