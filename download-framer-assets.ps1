# Downloads every file the site still needs from Framer's servers into this repo.
# Run:  powershell -ExecutionPolicy Bypass -File "K:\codes\personal projects\Radmoon final website\download-framer-assets.ps1"
# Re-running is safe: files that already exist are skipped.
$root = $PSScriptRoot
$files = @(
  @('https://framerusercontent.com/assets/1ilY5S5GlVlXm3LGUz7ixPFxyk.woff2', 'assets/fonts/m-mabar-regular.woff2'),
  @('https://framerusercontent.com/images/YTx4JRfElbalZ5l9xFN0LSlspI.png', 'assets/icons/apple-touch-icon.png'),
  @('https://framerusercontent.com/images/TtqHlZuNC4FIYJk4YJjNhpGZA.png', 'assets/icons/favicon.png'),
  @('https://framerusercontent.com/images/zdCurcVzLCpksKiKRap7bvgw.jpg?scale-down-to=1600', 'assets/img/home/about.jpg'),
  @('https://framerusercontent.com/images/3mzagltZTFMfLGNRvaNwrnAXV4Y.jpg?scale-down-to=1600', 'assets/img/home/blastfront.jpg'),
  @('https://framerusercontent.com/images/q7OMNgatLPoVm8iVJzaMyys0FA.png?scale-down-to=1600', 'assets/img/home/chap.png'),
  @('https://framerusercontent.com/images/zF0nFDMxPZUHELOC3SnQlSer948.png?scale-down-to=1600', 'assets/img/home/evermore.png'),
  @('https://framerusercontent.com/images/Wvfjg72iPvPtYcjdWqBKOeyQIM.jpg?scale-down-to=2048', 'assets/img/home/neuroscape.jpg'),
  @('https://framerusercontent.com/images/pesjB6CzVNdVbylntayINBWkviE.jpg?scale-down-to=1600', 'assets/img/home/pacificrim.jpg'),
  @('https://framerusercontent.com/images/IFOBvVu5d6ZHyuRl9Ou85R4vIVM.jpg?scale-down-to=1600', 'assets/img/home/vflect.jpg'),
  @('https://framerusercontent.com/images/3mzagltZTFMfLGNRvaNwrnAXV4Y.jpg?scale-down-to=1024', 'assets/img/related/blastfront.jpg'),
  @('https://framerusercontent.com/images/q7OMNgatLPoVm8iVJzaMyys0FA.png?scale-down-to=1024', 'assets/img/related/chap.png'),
  @('https://framerusercontent.com/images/Wvfjg72iPvPtYcjdWqBKOeyQIM.jpg?scale-down-to=1024', 'assets/img/related/neuroscape.jpg'),
  @('https://framerusercontent.com/assets/klHyuRTPZninWpeB0tN3Wr5rw.mp4', 'assets/video/aloha-klHyuRTPZninWpeB0tN3Wr5rw.mp4'),
  @('https://framerusercontent.com/assets/nXmphVwReLzDHzrUO3ctozMJdg.mp4', 'assets/video/aloha-nXmphVwReLzDHzrUO3ctozMJdg.mp4'),
  @('https://framerusercontent.com/images/xzPkNE9tcbnUJbg6bL3Z5G5jePw.png?scale-down-to=2048', 'assets/video/aloha-poster-xzPkNE9tcbnUJbg6bL3Z5G5jePw.png'),
  @('https://framerusercontent.com/images/IxBP5uAa7VYtdbwrijq2G55ys0.jpg?scale-down-to=2048', 'assets/video/blastfront-hero-poster.jpg'),
  @('https://framerusercontent.com/assets/2rnIT44U5V01R9KxmFcDycF6vyc.mp4', 'assets/video/blastfront-hero.mp4'),
  @('https://framerusercontent.com/assets/BdW3IqL10d3ecaTgZ1SsVcVGY.mp4', 'assets/video/chap-BdW3IqL10d3ecaTgZ1SsVcVGY.mp4'),
  @('https://framerusercontent.com/assets/QhVV4JFvUioTrpWLPkkqEdvcGA.mp4', 'assets/video/chap-QhVV4JFvUioTrpWLPkkqEdvcGA.mp4'),
  @('https://framerusercontent.com/images/q7OMNgatLPoVm8iVJzaMyys0FA.png?scale-down-to=2048', 'assets/video/chap-poster-q7OMNgatLPoVm8iVJzaMyys0FA.png'),
  @('https://framerusercontent.com/assets/rfbbBgQCPu4uYAEBHHQChClwQ20.mp4', 'assets/video/home-hero.mp4'),
  @('https://framerusercontent.com/assets/FnW3fMh3Ms7FYs74tgntvqtAbc.mp4', 'assets/video/pacificrim-FnW3fMh3Ms7FYs74tgntvqtAbc.mp4'),
  @('https://framerusercontent.com/assets/H75i2SR4ogdZtZEgRJMc0J3332I.mp4', 'assets/video/pacificrim-H75i2SR4ogdZtZEgRJMc0J3332I.mp4'),
  @('https://framerusercontent.com/assets/TdW6es3ZL59UIzcr9vxGqpnfe2o.mp4', 'assets/video/pacificrim-TdW6es3ZL59UIzcr9vxGqpnfe2o.mp4'),
  @('https://framerusercontent.com/assets/UzbhqG55Vgw1T0UBlV7UuCJm6Gk.mp4', 'assets/video/pacificrim-UzbhqG55Vgw1T0UBlV7UuCJm6Gk.mp4'),
  @('https://framerusercontent.com/assets/b3eITasi6d96E7WDYOPvmAlOnzA.mp4', 'assets/video/pacificrim-b3eITasi6d96E7WDYOPvmAlOnzA.mp4'),
  @('https://framerusercontent.com/assets/mJYFlyf9M66K4prTWNIqda5uI.mp4', 'assets/video/pacificrim-mJYFlyf9M66K4prTWNIqda5uI.mp4'),
  @('https://framerusercontent.com/assets/wQFVdfjmyOT9xXyp4O8zD3U8byg.mp4', 'assets/video/pacificrim-wQFVdfjmyOT9xXyp4O8zD3U8byg.mp4'),
  @('https://framerusercontent.com/assets/xRA8C0WFxVAyBywgHHvtgXOs7YQ.mp4', 'assets/video/pacificrim-xRA8C0WFxVAyBywgHHvtgXOs7YQ.mp4')
)
$ok = 0; $skip = 0; $fail = 0
foreach ($f in $files) {
  $dest = Join-Path $root $f[1]
  if (Test-Path $dest) { Write-Host "skip   $($f[1])"; $skip++; continue }
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  try {
    Invoke-WebRequest -Uri $f[0] -OutFile $dest -UseBasicParsing
    Write-Host ("ok     {0}  ({1:N0} KB)" -f $f[1], ((Get-Item $dest).Length / 1KB)); $ok++
  } catch {
    Write-Warning "FAILED $($f[1]) <- $($f[0]): $($_.Exception.Message)"; $fail++
  }
}
Write-Host ""
Write-Host "Done: $ok downloaded, $skip already present, $fail failed."
