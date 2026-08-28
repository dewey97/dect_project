$f = 'app/(investigation)/board/page.tsx'
$txt = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Thay thế hàm handlePointerUp
$oldZoom = '    // If it was a simple click down & up, zoom it!
    if (!hasDragged.current) {
      const item = items.find((it) => it.id === itemId)
      if (item) {
        openZoom(item, e.currentTarget as HTMLElement)
      }
    }'

$newZoom = '    // If it was a simple click down & up, zoom it!
    if (!hasDragged.current) {
      const item = items.find((it) => it.id === itemId)
      if (item) {
        const target = e.target as HTMLElement
        const isImgClick = target.tagName === "IMG" || target.classList.contains("clue-image-container") || target.closest(".clue-image-container")
        if (item.imgUrl && isImgClick) {
          openZoom(item, e.currentTarget as HTMLElement)
        }
      }
    }'

# Thay thế phần div wrapper ảnh
$oldDiv = '                ) : (
                  <div className="w-full h-full flex flex-col pointer-events-none">
                    {item.imgUrl ? (
                      <div className="w-full h-full overflow-hidden relative rounded border border-primary/20 shadow-md group-hover:shadow-xl group-hover:border-primary/50 transition-all duration-200">
                        <img
                          src={item.imgUrl}
                          alt=""
                          draggable={false}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                        {/* Hover Overlay with ZoomIn Icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-200">
                          <ZoomIn className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-zinc-800 border border-border flex items-center justify-center text-[0.65rem] font-sans text-muted-foreground">
                        KHÔNG CÓ HÌNH ẢNH
                      </div>
                    )'

$newDiv = '                ) : (
                  <div className="w-full h-full flex flex-col select-none">
                    {item.imgUrl ? (
                      <div className="clue-image-container w-full h-full overflow-hidden relative rounded border border-primary/20 shadow-md group-hover:shadow-xl group-hover:border-primary/50 transition-all duration-200 pointer-events-auto cursor-pointer">
                        <img
                          src={item.imgUrl}
                          alt=""
                          draggable={false}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                        {/* Hover Overlay with ZoomIn Icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-200 pointer-events-none">
                          <ZoomIn className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-zinc-800 border border-border flex items-center justify-center text-[0.65rem] font-sans text-muted-foreground pointer-events-none">
                        KHÔNG CÓ HÌNH ẢNH
                      </div>
                    )'

# Chuẩn hóa tất cả ngắt dòng thành LF trước khi replace
$txtNormalized = $txt -replace "`r`n", "`n"
$oldZoomNormalized = $oldZoom -replace "`r`n", "`n"
$newZoomNormalized = $newZoom -replace "`r`n", "`n"
$oldDivNormalized = $oldDiv -replace "`r`n", "`n"
$newDivNormalized = $newDiv -replace "`r`n", "`n"

if ($txtNormalized.Contains($oldZoomNormalized)) {
    $txtNormalized = $txtNormalized.Replace($oldZoomNormalized, $newZoomNormalized)
    Write-Host "Zoom logic match found and replaced."
} else {
    Write-Host "WARNING: Zoom logic match NOT found!"
}

if ($txtNormalized.Contains($oldDivNormalized)) {
    $txtNormalized = $txtNormalized.Replace($oldDivNormalized, $newDivNormalized)
    Write-Host "Div block match found and replaced."
} else {
    Write-Host "WARNING: Div block match NOT found!"
}

# Lưu lại file với định dạng chuẩn
[System.IO.File]::WriteAllText($f, $txtNormalized, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done"
