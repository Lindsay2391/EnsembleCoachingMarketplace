-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Australia',
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT,
    "videoUrl" TEXT,
    "specialties" TEXT NOT NULL,
    "experienceLevels" TEXT NOT NULL,
    "rateHourly" REAL,
    "rateHalfDay" REAL,
    "rateFullDay" REAL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "availability" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "cancellationPolicy" TEXT,
    "travelSupplement" REAL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnsembleProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ensembleName" TEXT NOT NULL,
    "ensembleType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Australia',
    "genres" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnsembleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ensembleId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "proposedDates" TEXT NOT NULL,
    "confirmedDate" TEXT,
    "sessionType" TEXT NOT NULL,
    "durationHours" REAL,
    "rate" REAL NOT NULL,
    "travelCost" REAL,
    "totalCost" REAL NOT NULL,
    "goals" TEXT,
    "specialRequests" TEXT,
    "cancellationReason" TEXT,
    "cancelledBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "Booking_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "EnsembleProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "preparationRating" INTEGER,
    "communicationRating" INTEGER,
    "teachingRating" INTEGER,
    "valueRating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "EnsembleProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "CoachProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EnsembleProfile_userId_key" ON "EnsembleProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");
