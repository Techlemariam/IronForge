# Feature: Health Check Endpoint

## Requirements
1.  **Endpoint**: `GET /api/health`
2.  **Logic**:
    -   Return `200 OK` if system is healthy.
    -   Return `500 Internal Server Error` if DB is unreachable.
    -   Query Prisma: `await prisma.$queryRaw\`SELECT 1\``
3.  **Response Format**:
    ```json
    {
      "status": "ok",
      "timestamp": "ISO-8601",
      "env": "production",
      "gitSha": "short-sha",
      "database": "connected"
    }
    ```
4.  **Security**: Publicly accessible (for load balancers).

## Platform Matrix
- **Desktop/Web**: N/A (API only)
- **Mobile**: N/A
- **TV**: N/A
