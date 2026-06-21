# Movie Management System
A full-stack movie rental and management platform with web application for admin and employees, and mobile application for customers.

## 🎥 Demo Videos

### 📱 Mobile Application (Customer)
[![Mobile App Demo](https://drive.google.com/thumbnail?id=1ruROlyQgKwKnlICHy2G6aZbz4qGADzLA)](https://drive.google.com/file/d/1ruROlyQgKwKnlICHy2G6aZbz4qGADzLA/view?usp=drivesdk)

### 💻 Web Platform (Admin & Employee)
[![Web Platform Demo](https://drive.google.com/thumbnail?id=1t3GO8dn1_QJ5DDzcoNIeKX0cvkIMDmQt)](https://drive.google.com/file/d/1t3GO8dn1_QJ5DDzcoNIeKX0cvkIMDmQt/view?usp=drivesdk)

*Click the images above to watch the demo videos on Google Drive.*

## Tech Stack
### Backend
- Node.js
- Express.js
- SQLite3
- Stripe API
- Multer for file upload

### Frontend Web
- React.js
- Bootstrap 5
- Axios
- jsPDF for invoices

### Mobile App
- React Native
- Expo
- React Navigation
- Expo Notifications
- Expo Image Picker
- AsyncStorage

---

## Features

### Movie Management
- Browse movies with search and genre filters
- Rate movies with 1-5 stars and write reviews
- Admin can add, edit, and delete movies
- Upload movie posters and images
- Real-time stock tracking

### Reservation System
- Reserve movies for 48 hour pickup window
- Automatic stock reduction on reservation
- Payment status tracking: Pending, Paid Online, Cash Pending
- Cancel reservation with automatic stock restoration
- Auto refresh on mobile when tab is focused

### Rental and Purchase
- Weekly rental for 7 days
- Monthly rental for 30 days
- Purchase option for permanent ownership
- PDF invoice generation for all transactions
- Return rental with stock restoration
- Transaction history for customers

### Payment System
- Online payment with Stripe
- Cash payment at store
- Automatic payment status updates
- Invoice generation for cash payments

### Analytics Dashboard
- Total revenue tracking
- Active rentals and completed rentals
- Most rented movies
- Monthly revenue chart
- Low stock alerts
- Recent rental activity

### Notifications
- Push notifications for reservation reminders 2 hours before expiry
- Payment success confirmation
- Ready for pickup notification when employee processes reservation

### Premium Subscription
- Monthly and yearly premium plans
- Online or cash payment options
- Premium benefits display
- Premium badge on user profile

---

## User Roles

### Admin (Web Application)
- Full system control
- Manage movies: add, edit, delete, update stock
- Manage employees: add, edit, delete
- View all reservations with payment status
- Process customer reservations and returns
- View analytics dashboard with revenue and statistics
- Manage premium subscribers
- Generate invoices for all transactions

### Employee (Web Application)
- Browse movies with search and filter
- Rent or sell movies to customers
- Select customer from customer list
- Process weekly, monthly rentals or purchases
- Generate PDF invoices
- View active rentals and purchased movies

### Customer (Mobile Application)
- Browse movies with search and genre filters
- Reserve movies for 48 hours
- Pay online with Stripe or cash in store
- Cancel reservations
- Rate movies and write reviews
- View rental and purchase history with active, returned and purchased tabs
- Manage profile: update name, phone, date of birth
- Change profile picture
- Upgrade to premium membership
- Receive push notifications


## Conclusion

Movie DB is a complete production ready movie rental management system that successfully integrates 
multi-role user management for admin, employee and customer. The platform provides a full reservation 
to rental workflow with 48 hour reservation window followed by payment and rental or purchase. 
It supports multiple payment methods including online payments through Stripe and cash payments
in store. Real time notifications keep customers informed about reservation reminders, payment 
confirmations and pickup availability. The system also includes comprehensive reporting with PDF 
invoices and analytics dashboards. With professional user interfaces across both web and mobile platforms,
Movie DB is scalable, maintainable and ready for production deployment.



