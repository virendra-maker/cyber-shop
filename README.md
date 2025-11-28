# Cyber Shop - Hacking Tools & Services E-Commerce Platform

A full-stack e-commerce platform for selling hacking-related tools and services, built with modern web technologies and featuring a professional admin panel.

## Features

### Customer-Facing Features
- **Cyber-Themed Dark UI**: Modern dark theme with red accents for a professional hacking tools aesthetic
- **Product Catalog**: Browse and search hacking tools and services
- **Category Filtering**: Filter products by category
- **Shopping Cart**: Add/remove items and manage quantities
- **Order Management**: View order history and track purchases
- **User Authentication**: Secure login via Manus OAuth

### Admin Features
- **Admin Dashboard**: Comprehensive management interface
- **Product Management**: Create, edit, and delete products
- **Category Management**: Organize products into categories
- **Order Monitoring**: View all customer orders
- **Role-Based Access Control**: Admin-only features protected by role verification
- **Payment Management**: Review and approve payment requests from customers
- **UPI Configuration**: Set admin UPI ID for receiving payments
- **Course/API Delivery**: Deliver access links, API keys, and credentials to customers

### Payment System Features
- **UPI Payment Integration**: Display admin UPI ID to customers for payment
- **Payment Request Workflow**: Users submit payment requests with transaction ID
- **Admin Approval System**: Admins review and approve/reject payment requests
- **Course and API Delivery**: Admins deliver courses, APIs, tools, and services
- **Payment History**: Users can view all payment requests and deliverables
- **Transaction Tracking**: Complete audit trail of all payments and approvals

## Tech Stack

### Frontend
- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling with OKLCH color space
- **shadcn/ui**: High-quality UI components
- **tRPC**: End-to-end type-safe API calls

### Backend
- **Express.js**: Web server framework
- **tRPC**: Type-safe RPC framework
- **Drizzle ORM**: Type-safe database access
- **MySQL**: Relational database

### Authentication
- **Manus OAuth**: Secure authentication system
- **JWT**: Session management

## Project Structure

```
cyber_shop/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and hooks
│   │   └── App.tsx        # Main app with routing
│   └── public/            # Static assets
├── server/                # Backend application
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   └── _core/             # Core framework files
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── package.json           # Project dependencies
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/virendra-maker/cyber-shop.git
cd cyber-shop
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env file with required variables
# DATABASE_URL, JWT_SECRET, VITE_APP_ID, etc.
```

4. Push database schema:
```bash
pnpm db:push
```

5. Start development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Schema

### Tables
- **users**: User accounts with role-based access (admin/user)
- **categories**: Product categories
- **products**: Hacking tools and services with pricing
- **cartItems**: Shopping cart items per user
- **orders**: Customer orders with status tracking
- **paymentRequests**: Payment requests with transaction IDs
- **courseDeliverables**: Delivered courses and APIs with access details
- **adminSettings**: Admin UPI ID and payment settings

## API Routes

### Public Procedures
- `products.list` - Get products with optional filtering
- `products.getById` - Get single product details
- `products.categories` - Get all categories

### Protected Procedures (Requires Authentication)
- `cart.get` - Get user's cart items
- `cart.add` - Add item to cart
- `cart.remove` - Remove item from cart
- `cart.clear` - Clear entire cart
- `orders.list` - Get user's orders
- `orders.create` - Create new order

### Admin Procedures (Requires Admin Role)
- `admin.products.list` - Get all products
- `admin.products.upsert` - Create/update product
- `admin.products.delete` - Delete product
- `admin.categories.list` - Get all categories
- `admin.categories.upsert` - Create/update category
- `admin.orders.list` - Get all orders
- `admin.settings.getAdmin` - Get admin payment settings
- `admin.settings.updateAdmin` - Update admin UPI and payment details
- `admin.payments.listAll` - Get all payment requests
- `admin.payments.approve` - Approve a payment request
- `admin.payments.reject` - Reject a payment request
- `admin.payments.deliverContent` - Deliver course/API access to customer

### Payment Procedures (Requires Authentication)
- `payments.submitRequest` - Submit payment request with transaction ID
- `payments.getUserRequests` - Get user payment requests
- `payments.getRequestDetails` - Get payment request details
- `deliverables.getUserDeliverables` - Get user delivered courses and APIs
- `deliverables.getDeliverable` - Get deliverable details

### Public Payment Procedures
- `admin.settings.getPublicUPI` - Get admin UPI ID for payment

## Testing

Run the test suite:
```bash
pnpm test
```

Test coverage includes:
- Authentication procedures
- Product listing and filtering
- Cart operations
- Order management
- Admin access control
- Role-based authorization

## Deployment

### Using Manus Platform
1. Create a checkpoint via `webdev_save_checkpoint`
2. Click the **Publish** button in the Management UI
3. Your site will be deployed to a public URL

### Manual Deployment
Build the project:
```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Payment Workflow

### Customer Payment Process
1. User browses products and clicks "Submit Payment Request"
2. User selects a product and sees the admin UPI ID
3. User makes payment via UPI to the admin
4. User submits payment request with transaction ID/UTR number
5. Payment request enters "Pending" status
6. Admin reviews and approves the payment
7. Admin delivers course/API access details
8. User receives access link, API key, and credentials
9. User can view deliverables in "My Payments" section

### Admin Payment Management
1. Admin sets UPI ID in Admin Settings
2. Admin reviews pending payment requests
3. Admin verifies transaction ID with bank
4. Admin approves payment request
5. Admin delivers course/API access details:
   - Access Link (for courses)
   - API Key (for APIs)
   - Credentials (JSON format for tools/services)
6. Payment status changes to "Delivered"
7. Customer receives notification and can access content

## Admin Access

To promote a user to admin:
1. Access the database directly
2. Update the `role` field in the `users` table to `'admin'`
3. The user will have access to `/admin` dashboard on next login

## Admin Payment Configuration

1. Log in as admin
2. Go to Admin Dashboard
3. Click "💳 Payments" tab
4. Set your UPI ID and payment details
5. Save the settings
6. Your UPI ID will now display to customers on payment page

## Features Roadmap

- [x] UPI Payment integration with admin approval workflow
- [x] Course and API delivery system
- [ ] Stripe payment integration (alternative to UPI)
- [ ] Email notifications for orders and payments
- [ ] Advanced analytics dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Bulk order management
- [ ] Inventory alerts
- [ ] Customer support system
- [ ] Automated payment verification
- [ ] Multi-currency support

## Security Considerations

- All admin operations are protected by role-based access control
- Prices are stored in cents to avoid floating-point errors
- Database queries use parameterized statements via Drizzle ORM
- Session management via JWT with secure cookies
- OAuth authentication prevents unauthorized access

## Performance

- Server-side rendering optimizations
- Database query optimization with Drizzle
- Frontend code splitting with Vite
- Efficient product filtering with indexed queries

## Contributing

This is a production-ready e-commerce platform. For modifications:
1. Create a new branch
2. Make your changes
3. Run tests: `pnpm test`
4. Push and create a pull request

## License

This project is proprietary software for Cyber Shop.

## Support

For issues and questions, please contact the development team or create an issue on GitHub.

## Author

Created by virendra-maker

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Production Ready
