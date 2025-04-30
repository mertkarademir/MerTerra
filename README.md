# Photo Blog

A modern photo blog application built with Next.js, TypeScript, and Tailwind CSS. Share your photos with the world, organize them in albums, and interact with others through comments.

## Features

- 📸 Upload and manage photos
- 📁 Organize photos in albums
- 💬 Comment on photos
- 🔐 User authentication
- 🌐 Responsive design
- 🚀 Fast and modern UI

## Prerequisites

- Node.js 18 or later
- PostgreSQL database
- Cloudinary account for image storage

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd photo-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/photo_blog"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Database Schema

The application uses the following database schema:

- **User**: Stores user information and authentication details
- **Album**: Organizes photos into collections
- **Photo**: Stores photo metadata and URLs
- **Comment**: Stores user comments on photos

## API Routes

- `/api/auth/*`: Authentication endpoints
- `/api/albums`: Album management
- `/api/photos`: Photo management
- `/api/comments`: Comment management

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth.js
- Cloudinary
- PostgreSQL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
