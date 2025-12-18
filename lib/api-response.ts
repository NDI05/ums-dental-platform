export const successResponse = (data: unknown, message: string = 'Success', statusCode: number = 200, headers: Record<string, string> = {}) => {
    return Response.json({
        success: true,
        message,
        data,
    }, {
        status: statusCode,
        headers
    });
};

export const errorResponse = (message: string = 'Internal Server Error', errorType: string = 'INTERNAL_SERVER_ERROR', error: unknown = null, statusCode: number = 500) => {
    return Response.json({
        success: false,
        message,
        error: {
            code: errorType,
            details: error,
        }
    }, { status: statusCode });
};

export const validationErrorResponse = (errors: unknown) => {
    return errorResponse('Validasi gagal', 'VALIDATION_ERROR', errors, 400);
};

export const unauthorizedResponse = (message: string = 'Unauthorized') => {
    return errorResponse(message, 'UNAUTHORIZED', null, 401);
};

export const forbiddenResponse = (message: string = 'Forbidden') => {
    return errorResponse(message, 'FORBIDDEN', null, 403);
};

export const notFoundResponse = (resource: string) => {
    return errorResponse(`${resource} tidak ditemukan`, 'NOT_FOUND', null, 404);
};

export const serverErrorResponse = (message: string = 'Terjadi kesalahan pada server') => {
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', null, 500);
};
