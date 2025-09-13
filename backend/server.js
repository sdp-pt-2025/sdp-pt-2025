// server.js
import app from "./app.js";

// For serverless functions, export the app instead of listening
export default app;


if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}