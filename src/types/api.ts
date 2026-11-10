export interface ApiSuccess<T> {
  data: T;
}

export interface ApiErrorBody {
  error: {
    code: "VALIDATION" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "INTERNAL";
    message: string;
    field?: string;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorBody["error"]["code"],
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
