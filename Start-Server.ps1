param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.svg' = 'image/svg+xml'
}
try {
    $listener.Start()
    Write-Host "Site: http://localhost:$Port/ (Ctrl+C to stop)"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        try {
            if ($context.Request.HttpMethod -notin @('GET', 'HEAD')) {
                $response.StatusCode = 405
                $response.Headers['Allow'] = 'GET, HEAD'
                continue
            }
            $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
            if (!$relative) { $relative = 'index.html' }
            if ($relative.Contains('\') -or $relative.Contains(':') -or $relative.Contains([char]0)) {
                $response.StatusCode = 400
                continue
            }
            $path = [IO.Path]::GetFullPath([IO.Path]::Combine($root, $relative.Replace('/', [IO.Path]::DirectorySeparatorChar)))
            $extension = [IO.Path]::GetExtension($path).ToLowerInvariant()
            if (!$path.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -or !$mime.ContainsKey($extension)) {
                $response.StatusCode = 403
                continue
            }
            if (![IO.File]::Exists($path)) {
                $response.StatusCode = 404
                continue
            }
            $probe = $path
            $isReparsePoint = $false
            while ($probe -and $probe -ne $root) {
                if (([IO.File]::GetAttributes($probe) -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                    $isReparsePoint = $true
                    break
                }
                $probe = [IO.Path]::GetDirectoryName($probe)
            }
            if ($isReparsePoint) {
                $response.StatusCode = 403
                continue
            }
            $bytes = [IO.File]::ReadAllBytes($path)
            $response.ContentType = $mime[$extension]
            $response.Headers['X-Content-Type-Options'] = 'nosniff'
            $response.Headers['Cache-Control'] = 'no-store'
            $response.ContentLength64 = $bytes.Length
            if ($context.Request.HttpMethod -eq 'GET') {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        }
        catch {
            $response.StatusCode = 500
            Write-Warning $_.Exception.Message
        }
        finally {
            $response.Close()
        }
    }
}
finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
