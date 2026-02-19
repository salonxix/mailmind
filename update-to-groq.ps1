$files = @(
    "app/api/ai/todo-title/route.ts",
    "app/api/ai/summarize/route.ts",
    "app/api/ai/reply/route.ts",
    "app/api/ai/explain/route.ts",
    "app/api/ai/categorize/route.ts",
    "app/api/calendar/extract/route.ts"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Replace API key variable
    $content = $content -replace 'const OPENROUTER_API_KEY = process\.env\.OPENROUTER_API_KEY;', 'const GROQ_API_KEY = process.env.GROQ_API_KEY;'
    
    # Replace model
    $content = $content -replace 'const MODEL = "meta-llama/llama-3\.2-3b-instruct:free";', 'const MODEL = "llama-3.3-70b-versatile";'
    
    # Replace API URL
    $content = $content -replace 'https://openrouter\.ai/api/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'
    
    # Replace headers
    $content = $content -replace '"Authorization": `Bearer \$\{OPENROUTER_API_KEY\}`', '"Authorization": `Bearer ${GROQ_API_KEY}`'
    
    # Remove OpenRouter specific headers
    $content = $content -replace ',\s*"HTTP-Referer": "https://mailmindd\.app"', ''
    $content = $content -replace ',\s*"X-Title": "MailMindd"', ''
    
    # Replace variable references
    $content = $content -replace 'OPENROUTER_API_KEY', 'GROQ_API_KEY'
    
    # Remove comments
    $content = $content -replace '// ✅ Using Meta Llama.*\n', ''
    $content = $content -replace '// ✅ Validate API key on module load\n', ''
    $content = $content -replace '// ✅ Check API key before processing\n\s*', ''
    $content = $content -replace '// ✅ Check if API key is configured\n\s*', ''
    $content = $content -replace '// ✅ Validate input\n\s*', ''
    
    Set-Content $file -Value $content
    Write-Host "Updated: $file"
}

Write-Host "`nAll files updated to use Groq!"
