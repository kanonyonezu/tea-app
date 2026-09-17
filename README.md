# tea-app
```docker run -p 8000:8000 tea-app-api```

```curl -X POST http://localhost:8000/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{"caffeine": "moderate", "body": "medium-full", "flavor": ["Roasted", "Earthy"]}'```
