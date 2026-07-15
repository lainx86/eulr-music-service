#!/usr/bin/env fish

for file in tracks/*.mp3
    set base (string replace -r '\.mp3$' '' -- (path basename "$file"))
    set clean (string replace -r '^HoliznaCC0 - ' '' -- "$base")
    set title (string trim (string replace -r '\s*\([^)]*\)\s*$' '' -- "$clean"))

    set id (
        string lower -- "$title" |
        string replace -ar '[^a-z0-9]+' '-' |
        string trim -c '-'
    )

    set duration (
        ffprobe \
            -v error \
            -show_entries format=duration \
            -of default=noprint_wrappers=1:nokey=1 \
            "$file"
    )

    echo
    echo "Uploading: $title"
    echo "ID: $id"
    echo "Duration: $duration seconds"

    pnpm upload:track -- \
        --file "$file" \
        --id "$id" \
        --title "$title" \
        --artist "HoliznaCC0" \
        --duration "$duration" \
        --content-type "audio/mpeg" \
        --license-name "CC0-1.0" \
        --license-url "https://creativecommons.org/publicdomain/zero/1.0/"

    or begin
        echo "Upload gagal pada: $file"
        exit 1
    end
end

echo
echo "Semua track HoliznaCC0 berhasil di-upload."
