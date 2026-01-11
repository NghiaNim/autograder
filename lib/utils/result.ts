export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string; status: number };

export function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

export function err<T>(error: string, status: number = 500): Result<T> {
  return { data: null, error, status };
}
