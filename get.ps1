# Set Google Fonts API key
$API_KEY = "AIzaSyBixxHrUlXnxvqnE96px8ZaynxCwG0xKp8"
$API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=$API_KEY"

# Set output directory for fonts
$OUTPUT_DIR = "C:\Users\TUF_Desktop_Yama\OneDrive\get_googlefonts"

# Create directory if it doesn't exist
if (-not (Test-Path -Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR
}

# Get the list of Google Fonts
Write-Host "Fetching Google Fonts list..."
$font_data = Invoke-RestMethod -Uri $API_URL

# Start downloading fonts
Write-Host "Starting font download..."
foreach ($font in $font_data.items) {
    $font_family = $font.family
    $encoded_font_family = $font_family -replace ' ', '+'

    # Download the CSS file for the font
    $css_url = "https://fonts.googleapis.com/css?family=$encoded_font_family"
    $css_file = Join-Path -Path $OUTPUT_DIR -ChildPath "$encoded_font_family.css"
    Invoke-WebRequest -Uri $css_url -OutFile $css_file

    # Extract font file URLs from the CSS file
    $font_urls = Select-String -Pattern 'https://fonts.gstatic.com/s/[^)]*' -Path $css_file | ForEach-Object { $_.Matches.Value }
    
    foreach ($font_url in $font_urls) {
        # Get the font file name
        $font_file = [System.IO.Path]::GetFileName($font_url)

        # Download the font file
        Invoke-WebRequest -Uri $font_url -OutFile (Join-Path -Path $OUTPUT_DIR -ChildPath $font_file)

        Write-Host "Downloaded: $font_file"
    }
}

Write-Host "All fonts have been downloaded! Saved to: $OUTPUT_DIR"
