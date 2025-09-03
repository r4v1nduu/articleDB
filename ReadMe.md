# Build the image
docker build -t nextjs-app .

# Run with .env file
docker run -p 3000:3000 --env-file .env nextjs-app