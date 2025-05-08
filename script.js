document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const overlayImage = document.getElementById('overlay-image');
    const downloadBtn = document.getElementById('download-btn');
    const previewContainer = document.getElementById('preview-container');
    const mergedImage = document.getElementById('merged-image');
    const backgroundImage = document.querySelector('.background-image');
    const atkValue = document.getElementById('atk-value');
    const defValue = document.getElementById('def-value');
    const cardName = document.getElementById('card-name');
    const nameColor = document.getElementById('name-color');
    
    // Đảm bảo hình nền đã được tải
    let bgImageLoaded = false;
    backgroundImage.onload = function() {
        bgImageLoaded = true;
    };
    
    // Nếu hình nền đã tải sẵn trong cache
    if (backgroundImage.complete) {
        bgImageLoaded = true;
    }
    
    uploadBtn.addEventListener('click', function() {
        if (imageUpload.files.length > 0) {
            const file = imageUpload.files[0];
            
            // Kiểm tra xem file có phải là hình ảnh không
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Hiển thị hình ảnh được tải lên ở giữa
                    overlayImage.src = e.target.result;
                    overlayImage.style.display = 'block';
                    
                    // Kích hoạt nút tải xuống
                    downloadBtn.disabled = false;
                    
                    // Tạo và hiển thị hình ghép
                    createMergedImage();
                };
                
                reader.readAsDataURL(file);
            } else {
                alert('Vui lòng chọn một tệp hình ảnh.');
            }
        } else {
            alert('Vui lòng chọn một hình ảnh để tải lên.');
        }
    });
    
    // Cập nhật hình ghép khi thay đổi giá trị ATK/DEF hoặc tên hoặc màu tên
    atkValue.addEventListener('input', createMergedImage);
    defValue.addEventListener('input', createMergedImage);
    cardName.addEventListener('input', createMergedImage);
    nameColor.addEventListener('input', createMergedImage);
    
    // Cập nhật màu chữ tên theo màu đã chọn
    nameColor.addEventListener('input', function() {
        cardName.style.color = nameColor.value;
    });
    
    // Tạo hình ghép
    function createMergedImage() {
        if (!bgImageLoaded) {
            setTimeout(createMergedImage, 100);
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Đặt kích thước canvas bằng với hình nền
        canvas.width = backgroundImage.naturalWidth;
        canvas.height = backgroundImage.naturalHeight;
        
        // Vẽ hình nền lên canvas
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        
        // Vẽ tên của thẻ
        drawCardName(ctx, canvas.width, canvas.height);
        
        // Tính toán vị trí để vẽ hình overlay ở giữa
        const overlayImg = new Image();
        overlayImg.onload = function() {
            // Giảm kích thước xuống chỉ còn 50%
            const maxWidth = canvas.width * 0.5;
            const maxHeight = canvas.height * 0.5;
            
            let overlayWidth = overlayImg.width;
            let overlayHeight = overlayImg.height;
            
            // Đảm bảo hình overlay không quá lớn
            if (overlayWidth > maxWidth || overlayHeight > maxHeight) {
                const ratio = Math.min(maxWidth / overlayWidth, maxHeight / overlayHeight);
                overlayWidth *= ratio;
                overlayHeight *= ratio;
            }
            
            // Dịch chuyển lên trên một chút (giảm 10% vị trí Y)
            const x = (canvas.width - overlayWidth) / 2;
            const y = (canvas.height - overlayHeight) / 2 - (canvas.height * 0.1);
            
            // Thêm bóng đổ cho hình overlay
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            // Reset bóng đổ trước khi vẽ hình ảnh
            ctx.shadowColor = 'transparent';
            
            // Vẽ hình ảnh
            ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
            
            // Vẽ khung ATK/DEF
            drawStatsBox(ctx, canvas.width, canvas.height);
            
            // Hiển thị hình ghép
            mergedImage.src = canvas.toDataURL('image/png');
        };
        
        overlayImg.src = overlayImage.src;
    }
    
    // Vẽ tên thẻ
    function drawCardName(ctx, width, height) {
        const name = cardName.value || '';
        
        if (name.trim() === '') return;
        
        // Vị trí tên thẻ - dịch chuyển lên cao hơn
        const nameY = height * 0.07;
        
        // Vẽ tên thẻ với màu được chọn
        ctx.fillStyle = nameColor.value;
        ctx.font = 'bold ' + (height * 0.05) + 'px "Times New Roman"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Thêm đổ bóng cho text để nổi bật
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Vẽ tên thẻ
        ctx.fillText(name, width / 2, nameY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    // Vẽ thông số ATK/DEF
    function drawStatsBox(ctx, width, height) {
        const atk = atkValue.value || '0';
        const def = defValue.value || '0';
        
        // Dịch chuyển vị trí lên cao hơn
        const boxY = height * 0.82;
        const padding = width * 0.33;
        
        // Không vẽ nền và viền nữa, chỉ hiển thị số
        
        // Vẽ chỉ giá trị, không hiển thị nhãn ATK/DEF
        ctx.fillStyle = '#4b2502';
        ctx.font = 'bold ' + (height * 0.06) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Thêm đổ bóng cho text để nổi bật
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Chỉ hiển thị giá trị ATK
        ctx.fillText(atk, padding, boxY);
        
        // Chỉ hiển thị giá trị DEF
        ctx.fillText(def, width - padding, boxY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    // Tải xuống hình ghép
    downloadBtn.addEventListener('click', function() {
        if (mergedImage.src) {
            const link = document.createElement('a');
            link.download = 'hinh-ghep.png';
            link.href = mergedImage.src;
            link.click();
        }
    });
    
    // Cho phép kéo thả hình ảnh
    imageUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    imageUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files.length > 0) {
            imageUpload.files = e.dataTransfer.files;
        }
    });
}); 