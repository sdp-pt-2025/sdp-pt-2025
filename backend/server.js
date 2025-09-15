import app from "./app.js"

const PORT = process.env.PORT || 8080;
  
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));
  }