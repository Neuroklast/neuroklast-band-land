# Background-video encoder: FFmpeg licensing

The admin build uses @ffmpeg/ffmpeg 0.12.15 (MIT) with @ffmpeg/core 0.12.10
(GPL-2.0-or-later), including the GPL-licensed x264 video encoder.

The prebuild/predev script copies the unmodified @ffmpeg/core dist/umd runtime
into public/vendor/ffmpeg-core alongside the MIT-licensed wrapper, so users downloading the encoder receive GPL
binary code. Keep the upstream copyright and license notices and make the
complete corresponding source code and build scripts available as required by
GPL-2.0-or-later before distributing this runtime in production.

Upstream source and licenses:
- https://github.com/ffmpegwasm/ffmpeg.wasm
- https://github.com/ffmpegwasm/ffmpeg.wasm-core
- https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

The website code (BSL-1.1) and separately distributed core must not be conflated.
Get a license compliance review if you are unsure about your obligations.
