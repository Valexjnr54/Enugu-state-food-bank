import express, { Request, Response, NextFunction } from "express";
import rateLimiter from "./middlewares/rateLimitMiddleware";
import cors from "cors";
import { Config } from "./config/config";
import { adminAuthRouter } from "./routes/auth/adminAuthRoutes";
import { adminOnly } from "./middlewares/adminMiddleware";
import { adminRouter } from "./routes/admin/admin.routes";
import { userAuthRouter } from "./routes/auth/userAuthRoutes";
import { userRouter } from "./routes/user/user.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(rateLimiter);
app.use(cors({ origin: Config.corsAllowedOrigin }));

app.use((_request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    next();
});

const route = '/api/v1';

app.get('/', (_request: Request, response: Response) => {
    return response.send('Food Stock Lending App has Started');
});

app.get(`${route}`, (_request: Request, response: Response) => {
    return response.send('Food Stock Lending App Backend has Started');
});

app.use(`${route}/auth`, adminAuthRouter);
app.use(`${route}/auth`, userAuthRouter);

app.use(`${route}/admin`, adminRouter);
app.use(`${route}/user`,userRouter);


app.use((error: any, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof SyntaxError && 'body' in error) {
        return response.status(400).json({
            status: "failed",
            success: false,
            error: "Invalid Json",
            message: "the request contains invaild JSON"
        })
    }
    next(error);
});

app.use((request, response) => {
    response.status(404).json({
        status: "failed",
        success: false,
        error: "Not Found",
        message: `The requested resource ${request.url} was not found`
    })
});

export default app;