async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced CORS for Vercel deployment
  app.enableCors({
    origin: [
      'https://personal-website-finals-tp54.vercel.app',
      'personal-website-finals-ten-dusky.vercel.app',
      'http://localhost:5173' 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Witcher backend running on port ${port}`);
}