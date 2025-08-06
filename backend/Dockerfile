# Start with a Node.js base image.
# Use a version that matches your Node.js runtime (e.g., node:20-slim, node:18-slim).
# The 'slim' variants are smaller and generally preferred for production.
FROM node:20-slim

# Install system-level dependencies required by libvips for HEIF/HEIC support.
# 'libvips' is the core image processing library sharp uses.
# 'libheif-dev' and 'libde265-dev' provide the HEIF/HEIC codec support.
# '--no-install-recommends' keeps the image size smaller by avoiding unnecessary packages.
# 'rm -rf /var/lib/apt/lists/*' cleans up apt cache to further reduce image size.
RUN apt-get update && apt-get install -y \
    libvips \
    libvips-tools \
    libheif-dev \
    libde265-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker caching.
# This step allows Docker to cache dependency installation if only these files change.
COPY package*.json ./

# Install Node.js dependencies.
# Because libheif-dev and libde265-dev are installed in the previous step,
# sharp will now detect them and compile with HEIF/HEIC support.
RUN npm install --production

# Copy the rest of your application code into the container
COPY . .

# Expose the port your Node.js application listens on.
# Render services typically listen on port 10000 by default.
EXPOSE 10000

# Define the command to run your application when the container starts. 
CMD ["npm", "run", "start:prod"]
