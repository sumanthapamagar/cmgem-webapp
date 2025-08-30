import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const AuthHeader = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const authHeader = request.headers.authorization || "";
        return authHeader.replace("Bearer ", "");
    }
);
